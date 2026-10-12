const mongoose = require('mongoose');
const { enableMockStore, useMongoDB } = require('../services/dataMode');

const errorHandler = (err, req, res, next) => {
  const connectionFailure = err.name && /Mongo(ServerSelection|Network|NetworkTimeout|NotConnected|TopologyClosed|PoolCleared)|MongooseError/.test(err.name);
  const databaseUnavailable = useMongoDB()
    && (mongoose.connection.readyState !== 1 || connectionFailure);
  if (databaseUnavailable) {
    enableMockStore();
  }

  const databaseError = databaseUnavailable
    || (err.name && /Mongo|Mongoose/.test(err.name));
  const message = databaseUnavailable || databaseError
    ? 'Database operation failed; mock-store mode is active for subsequent requests.'
    : err.message || 'Internal Server Error';

  if (databaseError) {
    console.warn(`[Database Warning] ${req.method} ${req.path} failed; no database details are exposed.`);
  } else {
    console.error(`[Error] ${req.method} ${req.url} -`, message);
  }

  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  
  res.status(statusCode).json({
    success: false,
    message,
    stack: databaseError || process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

module.exports = errorHandler;
