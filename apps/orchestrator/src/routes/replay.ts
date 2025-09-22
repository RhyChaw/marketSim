import type { Express } from 'express';
import type pino from 'pino';
import { z } from 'zod';

const startSchema = z.object({ date: z.string(), speed: z.number().positive().default(1) });
const speedSchema = z.object({ multiplier: z.number().positive() });
const seekSchema = z.object({ timestamp: z.string() });

export function setupReplayRoutes(app: Express, log: pino.Logger) {
  app.post('/replay/start', (req, res) => {
    const parse = startSchema.safeParse(req.body);
    if (!parse.success) return res.status(400).json({ error: parse.error.flatten() });
    const { date, speed } = parse.data;
    log.info({ date, speed }, 'replay start requested');
    // TODO: spawn OCaml core with args and wire pipes
    return res.json({ ok: true });
  });

  app.post('/replay/pause', (_req, res) => {
    // TODO: signal core process
    return res.json({ ok: true });
  });

  app.post('/replay/resume', (_req, res) => {
    // TODO: signal core process
    return res.json({ ok: true });
  });

  app.post('/replay/speed', (req, res) => {
    const parse = speedSchema.safeParse(req.body);
    if (!parse.success) return res.status(400).json({ error: parse.error.flatten() });
    const { multiplier } = parse.data;
    log.info({ multiplier }, 'speed change requested');
    // TODO: send control message to core
    return res.json({ ok: true });
  });

  app.post('/replay/seek', (req, res) => {
    const parse = seekSchema.safeParse(req.body);
    if (!parse.success) return res.status(400).json({ error: parse.error.flatten() });
    const { timestamp } = parse.data;
    log.info({ timestamp }, 'seek requested');
    // TODO: snapshot/rewind handling
    return res.json({ ok: true });
  });
}
