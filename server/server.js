const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const promClient = require('prom-client');

dotenv.config({ path: path.join(__dirname, '.env') });

const connectDB = require('./config/db');
const {
  DATA_MODES,
  enableMockStore,
  enableMongoDB,
  getDataMode,
  isMockStoreMode,
} = require('./services/dataMode');
const errorHandler = require('./middleware/errorHandler');

const userRoutes = require('./routes/userRoutes');
const itemRoutes = require('./routes/itemRoutes');
const requestRoutes = require('./routes/requestRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const aiRoutes = require('./routes/aiRoutes');

const app = express();
Object.defineProperty(app.locals, 'useMockStore', {
  enumerable: true,
  get: isMockStoreMode,
});
const metricsRegistry = new promClient.Registry();
const apiRoutePrefixes = ['/api/users', '/api/items', '/api/requests', '/api/dashboard', '/api/ai'];
const supportedMethods = new Set(['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD']);

promClient.collectDefaultMetrics({ register: metricsRegistry });

const httpRequests = new promClient.Counter({
  name: 'borrowbox_http_requests_total',
  help: 'Total number of HTTP requests.',
  labelNames: ['method', 'route', 'status_code'],
  registers: [metricsRegistry],
});

const httpErrors = new promClient.Counter({
  name: 'borrowbox_http_errors_total',
  help: 'Total number of HTTP responses with a status code of 400 or higher.',
  labelNames: ['method', 'route', 'status_code'],
  registers: [metricsRegistry],
});

const httpRequestDuration = new promClient.Histogram({
  name: 'borrowbox_http_request_duration_seconds',
  help: 'HTTP request duration in seconds.',
  labelNames: ['method', 'route'],
  registers: [metricsRegistry],
});

app.use((req, res, next) => {
  const startedAt = process.hrtime.bigint();
  const apiPrefix = apiRoutePrefixes.find((prefix) => (
    req.path === prefix || req.path.startsWith(`${prefix}/`)
  ));

  res.once('finish', () => {
    const method = supportedMethods.has(req.method) ? req.method : 'OTHER';
    const expressRoute = req.route?.path;
    const route = typeof expressRoute === 'string'
      ? `${apiPrefix || ''}${apiPrefix && expressRoute === '/' ? '' : expressRoute}` || '/'
      : 'unknown';
    const statusCode = String(res.statusCode);
    const labels = { method, route, status_code: statusCode };
    const durationSeconds = Number(process.hrtime.bigint() - startedAt) / 1e9;

    httpRequests.inc(labels);
    if (res.statusCode >= 400) {
      httpErrors.inc(labels);
    }
    httpRequestDuration.observe({ method, route }, durationSeconds);
  });

  next();
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection is verified in startServer() below before server boots

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/ai', aiRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  const databaseConnected = getDataMode() === DATA_MODES.MONGODB
    && mongoose.connection.readyState === 1;
  const status = databaseConnected ? 'healthy' : 'degraded';

  res.status(200).json({
    status,
    application: 'running',
    database: databaseConnected ? 'connected' : 'disconnected',
    databaseReady: databaseConnected,
    dataMode: databaseConnected ? DATA_MODES.MONGODB : DATA_MODES.MOCK,
    ready: true,
    time: new Date().toISOString()
  });
});

app.get('/metrics', async (req, res, next) => {
  try {
    res.set('Content-Type', metricsRegistry.contentType);
    res.end(await metricsRegistry.metrics());
  } catch (error) {
    next(error);
  }
});

// Serve built React frontend static files in production / built mode
const publicPath = path.join(__dirname, 'public');
app.use(express.static(publicPath));

// Fallback for React Router single-page navigation
app.get('*', (req, res, next) => {
  if (req.url.startsWith('/api')) {
    return next();
  }
  const indexPath = path.join(publicPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      res.status(200).send(`
        <!DOCTYPE html>
        <html>
          <head><title>BorrowBox API Server</title></head>
          <body style="font-family: system-ui, sans-serif; padding: 2rem; background: #0f172a; color: #f8fafc;">
            <h1>📦 BorrowBox API Server Running</h1>
            <p>Status: Active | Port: ${process.env.PORT || 5000}</p>
            <p>Client build path: <code>${publicPath}</code></p>
            <p>Run <code>npm run dev</code> for local React development client on port 3000.</p>
          </body>
        </html>
      `);
    }
  });
});

// Central Error Handler
app.use(errorHandler);

const startServer = async ({
  connectDatabase = connectDB,
  port = process.env.PORT || 5000,
} = {}) => {
  enableMockStore();

  if (process.env.MONGODB_URI) {
    console.info('[MongoDB] URI configured. Attempting database connection.');
    try {
      await connectDatabase();
      if (mongoose.connection.readyState === 1) {
        enableMongoDB();
      } else {
        console.warn('[MongoDB Warning] Connection did not become ready; starting in mock-store mode.');
      }
    } catch {
      enableMockStore();
      console.warn('[MongoDB Warning] Initial connection failed; starting in mock-store mode.');
    }
  } else {
    console.warn('[MongoDB Warning] URI is not configured; starting in mock-store mode.');
  }

  return new Promise((resolve, reject) => {
    const server = app.listen(port, () => {
      console.log(`[BorrowBox Server] Server running on port ${server.address().port} in ${process.env.NODE_ENV || 'development'} mode`);
      resolve(server);
    });
    server.once('error', reject);
  });
};

if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
