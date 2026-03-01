const http = require('node:http');

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(payload));
}

function resolveRoute(url) {
  if (url === '/health') {
    return { statusCode: 200, payload: { status: 'ok' } };
  }

  if (url === '/') {
    return {
      statusCode: 200,
      payload: {
        service: 'NexusChat',
        message: 'NexusChat bootstrap server is running.'
      }
    };
  }

  return { statusCode: 404, payload: { error: 'Not Found' } };
}

function createLogEvent(level, message, meta = {}) {
  return JSON.stringify({
    ts: new Date().toISOString(),
    level,
    message,
    ...meta
  });
}

function createServer(logger = console) {
  return http.createServer((req, res) => {
    const method = req.method || 'UNKNOWN';
    const url = req.url || '/';

    logger.info?.(createLogEvent('info', 'request_received', { method, url }));

    try {
      const result = resolveRoute(url);
      sendJson(res, result.statusCode, result.payload);
    } catch (error) {
      logger.error?.(
        createLogEvent('error', 'request_error', {
          method,
          url,
          error: error instanceof Error ? error.message : String(error)
        })
      );
      sendJson(res, 500, { error: 'Internal Server Error' });
    }
  });
}

function startServer(port = process.env.PORT || 3000, logger = console) {
  const server = createServer(logger);

  server.on('error', (error) => {
    logger.error?.(
      createLogEvent('error', 'server_error', {
        error: error instanceof Error ? error.message : String(error)
      })
    );
  });

  return new Promise((resolve) => {
    server.listen(port, () => {
      logger.info?.(createLogEvent('info', 'server_started', { port }));
      resolve(server);
    });
  });
}

module.exports = {
  createLogEvent,
  createServer,
  resolveRoute,
  startServer
};
