import type { Server as HTTPServer } from 'http';
import WebSocket, { WebSocketServer } from 'ws';
import type pino from 'pino';

export function setupWebSocket(server: HTTPServer, log: pino.Logger) {
  const wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', (socket: WebSocket) => {
    log.info('ws client connected');
    socket.send(JSON.stringify({ type: 'hello', ts: Date.now() }));
    socket.on('close', () => log.info('ws client disconnected'));
  });

  const interval = setInterval(() => {
    const payload = JSON.stringify({ type: 'heartbeat', ts: Date.now() });
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) client.send(payload);
    });
  }, 1000);

  wss.on('close', () => clearInterval(interval));
}
