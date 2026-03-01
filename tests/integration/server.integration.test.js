const test = require('node:test');
const assert = require('node:assert/strict');
const { createServer } = require('../../src/server');

function request(server, path) {
  const { port } = server.address();

  return new Promise((resolve, reject) => {
    const req = require('node:http').request(
      {
        host: '127.0.0.1',
        port,
        path,
        method: 'GET'
      },
      (res) => {
        let data = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          resolve({ statusCode: res.statusCode, body: data });
        });
      }
    );

    req.on('error', reject);
    req.end();
  });
}

test('GET /health returns service health and structured request log', async (t) => {
  const logs = [];
  const server = createServer({ info: (msg) => logs.push(msg) });
  await new Promise((resolve) => server.listen(0, resolve));
  t.after(() => server.close());

  const response = await request(server, '/health');
  assert.equal(response.statusCode, 200);
  assert.deepEqual(JSON.parse(response.body), { status: 'ok' });

  const parsed = JSON.parse(logs.at(-1));
  assert.equal(parsed.message, 'request_received');
  assert.equal(parsed.method, 'GET');
  assert.equal(parsed.url, '/health');
});

test('GET / returns bootstrap payload', async (t) => {
  const server = createServer();
  await new Promise((resolve) => server.listen(0, resolve));
  t.after(() => server.close());

  const response = await request(server, '/');
  assert.equal(response.statusCode, 200);
  assert.equal(JSON.parse(response.body).service, 'NexusChat');
});

test('Unknown route returns 404 payload', async (t) => {
  const server = createServer();
  await new Promise((resolve) => server.listen(0, resolve));
  t.after(() => server.close());

  const response = await request(server, '/not-found');
  assert.equal(response.statusCode, 404);
  assert.deepEqual(JSON.parse(response.body), { error: 'Not Found' });
});
