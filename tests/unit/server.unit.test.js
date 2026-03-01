const test = require('node:test');
const assert = require('node:assert/strict');
const { createLogEvent, resolveRoute } = require('../../src/server');

test('resolveRoute returns health payload for /health', () => {
  const result = resolveRoute('/health');
  assert.equal(result.statusCode, 200);
  assert.deepEqual(result.payload, { status: 'ok' });
});

test('resolveRoute returns root payload for /', () => {
  const result = resolveRoute('/');
  assert.equal(result.statusCode, 200);
  assert.equal(result.payload.service, 'NexusChat');
});

test('resolveRoute returns 404 payload for unknown path', () => {
  const result = resolveRoute('/unknown');
  assert.equal(result.statusCode, 404);
  assert.deepEqual(result.payload, { error: 'Not Found' });
});

test('createLogEvent returns structured log payload', () => {
  const event = JSON.parse(createLogEvent('info', 'request_received', { method: 'GET', url: '/health' }));

  assert.equal(event.level, 'info');
  assert.equal(event.message, 'request_received');
  assert.equal(event.method, 'GET');
  assert.equal(event.url, '/health');
  assert.ok(event.ts);
});
