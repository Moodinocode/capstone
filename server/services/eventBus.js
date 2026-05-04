import logger from '../utils/logger.js';

// Single in-process pub/sub used to fan SSE updates out to all connected
// clients. Multi-instance deployments would need Redis pub/sub here, but a
// single Render dyno is fine for the event-day load.
const clients = new Set();

export function addClient(res) {
  clients.add(res);
  logger.debug({ count: clients.size }, 'sse client connected');
}

export function removeClient(res) {
  clients.delete(res);
  logger.debug({ count: clients.size }, 'sse client disconnected');
}

export function broadcast(event, data) {
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const res of clients) {
    try {
      res.write(payload);
    } catch (err) {
      logger.warn({ err: err.message }, 'sse write failed; dropping client');
      clients.delete(res);
    }
  }
}

export function clientCount() {
  return clients.size;
}

// Heartbeat keeps idle proxies (e.g. Render) from killing the connection.
setInterval(() => {
  for (const res of clients) {
    try { res.write(': ping\n\n'); } catch { clients.delete(res); }
  }
}, 25_000).unref?.();
