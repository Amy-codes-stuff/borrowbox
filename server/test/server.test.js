const assert = require('node:assert/strict');
const { describe, it } = require('node:test');

process.env.MONGODB_URI = '';

const mongoose = require('mongoose');
const request = require('supertest');
const { app } = require('../server');

describe('BorrowBox API', () => {
  it('reports application and database health independently', async () => {
    const previousReadyState = mongoose.connection.readyState;

    try {
      mongoose.connection.readyState = 0;
      const unavailableResponse = await request(app).get('/api/health');

      assert.equal(unavailableResponse.status, 503);
      assert.equal(unavailableResponse.body.status, 'unhealthy');
      assert.equal(unavailableResponse.body.application, 'running');
      assert.equal(unavailableResponse.body.database, 'disconnected');
      assert.equal(Number.isNaN(Date.parse(unavailableResponse.body.time)), false);

      mongoose.connection.readyState = 1;
      const healthyResponse = await request(app).get('/api/health');

      assert.equal(healthyResponse.status, 200);
      assert.equal(healthyResponse.body.status, 'healthy');
      assert.equal(healthyResponse.body.application, 'running');
      assert.equal(healthyResponse.body.database, 'connected');
    } finally {
      mongoose.connection.readyState = previousReadyState;
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
});