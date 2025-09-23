import WebSocket from 'ws';

export class ClientHub {
  private clients: Set<WebSocket> = new Set();

  add(ws: WebSocket) {
    this.clients.add(ws);
    ws.on('close', () => this.clients.delete(ws));
  }

  broadcast(obj: unknown) {
    const payload = JSON.stringify(obj);
    for (const c of this.clients) {
      if (c.readyState === WebSocket.OPEN) c.send(payload);
    }
  }
}
