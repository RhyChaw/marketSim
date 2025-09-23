import { WebSocketServer } from 'ws';
import { ClientHub } from './state';
export function setupWebSocket(server, log) {
    const wss = new WebSocketServer({ server, path: '/ws' });
    const hub = new ClientHub();
    wss.on('connection', (socket) => {
        log.info('ws client connected');
        hub.add(socket);
        socket.send(JSON.stringify({ type: 'hello', ts: Date.now() }));
    });
    // Expose broadcaster to other modules via process global (simple stub)
    // In production, use DI/module export. Here we attach for quick wiring.
    globalThis.__MS_HUB__ = hub;
}
