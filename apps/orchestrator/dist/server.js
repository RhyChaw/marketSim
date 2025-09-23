import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import pino from 'pino';
import http from 'http';
import { setupReplayRoutes } from './routes/replay';
import { setupWebSocket } from './ws';
const log = pino({ level: process.env.LOG_LEVEL || 'info' });
const app = express();
app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.get('/health', (_req, res) => res.json({ ok: true }));
setupReplayRoutes(app, log);
const server = http.createServer(app);
setupWebSocket(server, log);
const PORT = Number(process.env.PORT || 4000);
server.listen(PORT, () => {
    log.info({ port: PORT }, 'orchestrator listening');
});
