const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '.env') });

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

const userRoutes = require('./routes/userRoutes');
const itemRoutes = require('./routes/itemRoutes');
const requestRoutes = require('./routes/requestRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const aiRoutes = require('./routes/aiRoutes');

const app = express();

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
  res.json({
    status: 'online',
    app: 'BorrowBox API',
    time: new Date().toISOString()
  });
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

const startServer = async () => {
  try {
    if (process.env.MONGODB_URI) {
      console.log('[MongoDB] MONGODB_URI detected. Connecting to MongoDB Atlas...');
      await connectDB();
    } else {
      console.warn('[MongoDB Warning] MONGODB_URI is missing. Running in development mode with Mock Store fallback.');
    }

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`[BorrowBox Server] Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
    });
  } catch (error) {
    console.error(`[Server Error] Database connection failed. Exiting: ${error.message}`);
    process.exit(1);
  }
};

startServer();
