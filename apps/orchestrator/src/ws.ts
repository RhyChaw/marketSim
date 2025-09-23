import type { Server as HTTPServer } from 'http';
import WebSocket, { WebSocketServer } from 'ws';
import type pino from 'pino';
import { ClientHub } from './state';

export function setupWebSocket(server: HTTPServer, log: pino.Logger) {
  const wss = new WebSocketServer({ server, path: '/ws' });
  const hub = new ClientHub();

  wss.on('connection', (socket: WebSocket) => {
    log.info('ws client connected');
    hub.add(socket);
    socket.send(JSON.stringify({ type: 'hello', ts: Date.now() }));
  });

  // Expose broadcaster to other modules via process global (simple stub)
  // In production, use DI/module export. Here we attach for quick wiring.
  (globalThis as any).__MS_HUB__ = hub;
}
