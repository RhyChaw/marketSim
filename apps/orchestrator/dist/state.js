import WebSocket from 'ws';
export class ClientHub {
    clients = new Set();
    add(ws) {
        this.clients.add(ws);
        ws.on('close', () => this.clients.delete(ws));
    }
    broadcast(obj) {
        const payload = JSON.stringify(obj);
        for (const c of this.clients) {
            if (c.readyState === WebSocket.OPEN)
                c.send(payload);
        }
    }
}
