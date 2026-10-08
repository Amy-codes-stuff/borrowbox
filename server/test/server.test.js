const assert = require('node:assert/strict');
const { describe, it } = require('node:test');

process.env.MONGODB_URI = '';

const mongoose = require('mongoose');
const request = require('supertest');
const { app } = require('../server');

const getMetricValue = (metrics, name, labels) => {
  const sample = metrics.split('\n').find((line) => (
    line.startsWith(`${name}{`)
      && Object.entries(labels).every(([label, value]) => line.includes(`${label}="${value}"`))
  ));

  return sample ? Number(sample.slice(sample.lastIndexOf(' ') + 1)) : 0;
};

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