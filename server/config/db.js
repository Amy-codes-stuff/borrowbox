const mongoose = require('mongoose');
const { enableMockStore, enableMongoDB, useMongoDB } = require('../services/dataMode');

let connectionListenersRegistered = false;
let hasConnected = false;

const handleConnected = () => {
  if (mongoose.connection.readyState !== 1) {
    return;
  }

  const wasDisconnected = !useMongoDB() && hasConnected;
  hasConnected = true;
  enableMongoDB();

  if (wasDisconnected) {
    console.info('[MongoDB] Connection restored; using MongoDB data mode.');
  }
};

const handleDisconnected = () => {
  const wasConnected = useMongoDB();
  enableMockStore();

  if (wasConnected) {
    console.warn('[MongoDB Warning] Connection lost; using the in-memory mock store until MongoDB reconnects.');
  }
};

const registerConnectionListeners = () => {
  if (connectionListenersRegistered) {
    return;
  }

  mongoose.connection.on('connected', handleConnected);
  mongoose.connection.on('reconnected', handleConnected);
  mongoose.connection.on('disconnected', handleDisconnected);
  mongoose.connection.on('close', handleDisconnected);
  mongoose.connection.on('error', () => {
    if (mongoose.connection.readyState !== 1) {
      enableMockStore();
      console.warn('[MongoDB Warning] Connection error; using the in-memory mock store until MongoDB reconnects.');
    }
  });
  connectionListenersRegistered = true;
};

const connectDB = async () => {
  const connStr = process.env.MONGODB_URI;
  if (!connStr) {
    throw new Error('MONGODB_URI environment variable is missing.');
  }

  registerConnectionListeners();
  const conn = await mongoose.connect(connStr, {
    serverSelectionTimeoutMS: 5000,
  });
  if (mongoose.connection.readyState === 1) {
    hasConnected = true;
    enableMongoDB();
    console.info('[MongoDB] Connected successfully.');
  }

  return conn;
};

registerConnectionListeners();

module.exports = connectDB;
