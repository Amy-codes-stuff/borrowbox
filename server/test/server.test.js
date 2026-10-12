const assert = require('node:assert/strict');
const { describe, it } = require('node:test');

process.env.MONGODB_URI = '';

const mongoose = require('mongoose');
const request = require('supertest');
const { app, startServer } = require('../server');
const connectDB = require('../config/db');
const Item = require('../models/Item');
const {
  DATA_MODES,
  enableMockStore,
  enableMongoDB,
  getDataMode,
} = require('../services/dataMode');

enableMockStore();

const getMetricValue = (metrics, name, labels) => {
  const sample = metrics.split('\n').find((line) => (
    line.startsWith(`${name}{`)
      && Object.entries(labels).every(([label, value]) => line.includes(`${label}="${value}"`))
  ));

  return sample ? Number(sample.slice(sample.lastIndexOf(' ') + 1)) : 0;
};

describe('BorrowBox API', { concurrency: false }, () => {
  it('reports application and database health independently', async () => {
    const previousReadyState = mongoose.connection.readyState;

    try {
      enableMockStore();
      mongoose.connection.readyState = 0;
      const unavailableResponse = await request(app).get('/api/health');

      assert.equal(unavailableResponse.status, 200);
      assert.equal(unavailableResponse.body.status, 'degraded');
      assert.equal(unavailableResponse.body.application, 'running');
      assert.equal(unavailableResponse.body.database, 'disconnected');
      assert.equal(unavailableResponse.body.databaseReady, false);
      assert.equal(unavailableResponse.body.dataMode, DATA_MODES.MOCK);
      assert.equal(unavailableResponse.body.ready, true);
      assert.equal(Number.isNaN(Date.parse(unavailableResponse.body.time)), false);

      mongoose.connection.readyState = 1;
      enableMongoDB();
      const healthyResponse = await request(app).get('/api/health');

      assert.equal(healthyResponse.status, 200);
      assert.equal(healthyResponse.body.status, 'healthy');
      assert.equal(healthyResponse.body.application, 'running');
      assert.equal(healthyResponse.body.database, 'connected');
      assert.equal(healthyResponse.body.databaseReady, true);
      assert.equal(healthyResponse.body.dataMode, DATA_MODES.MONGODB);
    } finally {
      enableMockStore();
      mongoose.connection.readyState = previousReadyState;
    }
  });

  it('starts in mock mode when the configured MongoDB URI cannot connect without logging it', async () => {
    const previousUri = process.env.MONGODB_URI;
    const previousReadyState = mongoose.connection.readyState;
    const originalConnect = mongoose.connect;
    const originalWarn = console.warn;
    const originalLog = console.log;
    const output = [];
    const uri = 'mongodb://fallback-user:fallback-secret@127.0.0.1:27017/borrowbox';
    let server;

    try {
      process.env.MONGODB_URI = uri;
      mongoose.connection.readyState = 0;
      mongoose.connect = async () => {
        throw new Error(`Cannot connect using ${uri}`);
      };
      console.warn = (...args) => output.push(args.join(' '));
      console.log = (...args) => output.push(args.join(' '));

      server = await startServer({
        connectDatabase: connectDB,
        port: 0,
      });

      assert.equal(getDataMode(), DATA_MODES.MOCK);
      assert.equal(app.locals.useMockStore, true);
      assert.equal(output.join(' ').includes('fallback-secret'), false);
      assert.match(output.join(' '), /Initial connection failed/);
      const health = await request(server).get('/api/health');
      assert.equal(health.status, 200);
      assert.equal(health.body.dataMode, DATA_MODES.MOCK);
      assert.equal(health.body.database, 'disconnected');
    } finally {
      console.warn = originalWarn;
      console.log = originalLog;
      mongoose.connect = originalConnect;
      if (server) {
        await new Promise((resolve, reject) => server.close((error) => (
          error ? reject(error) : resolve()
        )));
      }
      process.env.MONGODB_URI = previousUri;
      mongoose.connection.readyState = previousReadyState;
      enableMockStore();
    }
  });

  it('starts with mock data when MongoDB URI is absent', async () => {
    const previousUri = process.env.MONGODB_URI;
    let connectAttempted = false;
    let server;

    try {
      delete process.env.MONGODB_URI;
      server = await startServer({
        connectDatabase: async () => {
          connectAttempted = true;
        },
        port: 0,
      });

      assert.equal(connectAttempted, false);
      assert.equal(getDataMode(), DATA_MODES.MOCK);
      const response = await request(server).get('/api/items').query({ category: 'Study' });
      assert.equal(response.status, 200);
      assert.ok(response.body.data.length > 0);
    } finally {
      if (server) {
        await new Promise((resolve, reject) => server.close((error) => (
          error ? reject(error) : resolve()
        )));
      }
      if (previousUri === undefined) {
        delete process.env.MONGODB_URI;
      } else {
        process.env.MONGODB_URI = previousUri;
      }
      enableMockStore();
    }
  });

  it('uses mock data for item, user, request, and dashboard routes in fallback mode', async () => {
    enableMockStore();

    const [items, users, requests, dashboard] = await Promise.all([
      request(app).get('/api/items').query({ category: 'Study' }),
      request(app).get('/api/users'),
      request(app).get('/api/requests'),
      request(app).get('/api/dashboard'),
    ]);

    assert.equal(items.status, 200);
    assert.ok(items.body.count > 0);
    assert.equal(users.status, 200);
    assert.ok(users.body.count > 0);
    assert.equal(requests.status, 200);
    assert.equal(requests.body.success, true);
    assert.equal(dashboard.status, 200);
    assert.equal(dashboard.body.success, true);
    assert.ok(dashboard.body.data.stats);
  });

  it('preserves mock-store item and request CRUD operations', async () => {
    enableMockStore();

    const createdItemResponse = await request(app)
      .post('/api/items')
      .send({
        name: 'Fallback test item',
        description: 'Temporary test listing',
        category: 'Study',
        condition: 'Good',
        location: 'Test location',
      });
    assert.equal(createdItemResponse.status, 201);
    const itemId = createdItemResponse.body.data._id;

    const updatedItemResponse = await request(app)
      .put(`/api/items/${itemId}`)
      .send({ name: 'Updated fallback test item' });
    assert.equal(updatedItemResponse.status, 200);
    assert.equal(updatedItemResponse.body.data.name, 'Updated fallback test item');

    const deleteItemResponse = await request(app).delete(`/api/items/${itemId}`);
    assert.equal(deleteItemResponse.status, 200);
    assert.equal((await request(app).get(`/api/items/${itemId}`)).status, 404);

    const createdRequestResponse = await request(app)
      .post('/api/requests')
      .set('x-demo-user-id', '65f000000000000000000002')
      .send({
        itemId: '65f000000000000000000101',
        requestedDuration: '2 days',
        message: 'Fallback CRUD test',
      });
    assert.equal(createdRequestResponse.status, 201);
    const requestId = createdRequestResponse.body.data._id;

    const deletedRequestResponse = await request(app)
      .delete(`/api/requests/${requestId}`)
      .set('x-demo-user-id', '65f000000000000000000002');
    assert.equal(deletedRequestResponse.status, 200);
    assert.equal(deletedRequestResponse.body.message, 'Request deleted');

    const requestList = await request(app)
      .get('/api/requests')
      .set('x-demo-user-id', '65f000000000000000000002');
    assert.equal(requestList.body.data.some((entry) => entry._id === requestId), false);
  });

  it('switches to mock mode after an in-flight MongoDB operation fails', async () => {
    const previousReadyState = mongoose.connection.readyState;
    const originalFind = Item.find;
    const originalWarn = console.warn;
    const output = [];

    try {
      mongoose.connection.readyState = 1;
      enableMongoDB();
      Item.find = () => {
        const error = new Error('failed at mongodb://user:secret@host/database');
        error.name = 'MongoNetworkError';
        throw error;
      };
      console.warn = (...args) => output.push(args.join(' '));

      const failedRequest = await request(app).get('/api/items');
      assert.equal(failedRequest.status, 500);
      assert.match(failedRequest.body.message, /mock-store mode is active/);
      assert.equal(getDataMode(), DATA_MODES.MOCK);
      assert.equal(output.join(' ').includes('secret'), false);

      const subsequentRequest = await request(app).get('/api/items');
      assert.equal(subsequentRequest.status, 200);
      assert.ok(subsequentRequest.body.count > 0);
    } finally {
      Item.find = originalFind;
      console.warn = originalWarn;
      mongoose.connection.readyState = previousReadyState;
      enableMockStore();
    }
  });

  it('keeps serving after MongoDB disconnects and returns to MongoDB mode on recovery', async () => {
    const previousUri = process.env.MONGODB_URI;
    const previousReadyState = mongoose.connection.readyState;
    const originalConnect = mongoose.connect;
    let server;

    try {
      process.env.MONGODB_URI = 'mongodb://example.invalid/borrowbox';
      mongoose.connect = async () => {
        mongoose.connection.readyState = 1;
        mongoose.connection.emit('connected');
        return mongoose;
      };
      server = await startServer({
        connectDatabase: connectDB,
        port: 0,
      });

      assert.equal(getDataMode(), DATA_MODES.MONGODB);
      assert.equal(app.locals.useMockStore, false);

      mongoose.connection.readyState = 0;
      mongoose.connection.emit('disconnected');
      assert.equal(getDataMode(), DATA_MODES.MOCK);

      const degradedHealth = await request(server).get('/api/health');
      const mockItems = await request(server).get('/api/items');
      assert.equal(degradedHealth.status, 200);
      assert.equal(degradedHealth.body.status, 'degraded');
      assert.equal(degradedHealth.body.database, 'disconnected');
      assert.equal(mockItems.status, 200);
      assert.ok(mockItems.body.count > 0);

      mongoose.connection.readyState = 1;
      mongoose.connection.emit('connected');
      assert.equal(getDataMode(), DATA_MODES.MONGODB);

      const recoveredHealth = await request(server).get('/api/health');
      assert.equal(recoveredHealth.status, 200);
      assert.equal(recoveredHealth.body.status, 'healthy');
      assert.equal(recoveredHealth.body.database, 'connected');
    } finally {
      if (server) {
        await new Promise((resolve, reject) => server.close((error) => (
          error ? reject(error) : resolve()
        )));
      }
      mongoose.connect = originalConnect;
      process.env.MONGODB_URI = previousUri;
      mongoose.connection.readyState = previousReadyState;
      enableMockStore();
    }
  });

  it('returns filtered item listings from the mock store', async () => {
    const response = await request(app).get('/api/items').query({ category: 'Study' });

    assert.equal(response.status, 200);
    assert.equal(response.body.success, true);
    assert.ok(response.body.count > 0);
    assert.ok(response.body.data.every((item) => item.category === 'Study'));
  });

  it('uses the error handler for missing items', async () => {
    const response = await request(app).get('/api/items/not-a-real-item');

    assert.equal(response.status, 404);
    assert.equal(response.body.success, false);
    assert.equal(response.body.message, 'Item not found');
  });

  it('exposes Prometheus metrics in text format', async () => {
    const response = await request(app).get('/metrics');

    assert.equal(response.status, 200);
    assert.match(response.headers['content-type'], /text\/plain/);
    assert.match(response.text, /^# HELP borrowbox_http_requests_total /m);
    assert.match(response.text, /^# HELP borrowbox_http_errors_total /m);
    assert.match(response.text, /^# HELP borrowbox_http_request_duration_seconds /m);
    assert.match(response.text, /^# HELP process_start_time_seconds /m);
  });

  it('increments the request counter for a normal API request', async () => {
    const labels = { method: 'GET', route: '/api/items', status_code: '200' };
    const beforeMetrics = await request(app).get('/metrics');
    const before = getMetricValue(beforeMetrics.text, 'borrowbox_http_requests_total', labels);

    const response = await request(app).get('/api/items').query({ category: 'Study' });
    const afterMetrics = await request(app).get('/metrics');
    const after = getMetricValue(afterMetrics.text, 'borrowbox_http_requests_total', labels);

    assert.equal(response.status, 200);
    assert.equal(after, before + 1);
  });

  it('increments the error counter for an API error response', async () => {
    const labels = { method: 'GET', route: '/api/items/:id', status_code: '404' };
    const beforeMetrics = await request(app).get('/metrics');
    const before = getMetricValue(beforeMetrics.text, 'borrowbox_http_errors_total', labels);

    const response = await request(app).get('/api/items/not-a-real-item');
    const afterMetrics = await request(app).get('/metrics');
    const after = getMetricValue(afterMetrics.text, 'borrowbox_http_errors_total', labels);

    assert.equal(response.status, 404);
    assert.equal(after, before + 1);
  });
});