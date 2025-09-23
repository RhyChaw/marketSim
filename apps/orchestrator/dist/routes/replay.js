import { z } from 'zod';
import { Player } from '../player';
const startSchema = z.object({ date: z.string(), speed: z.number().positive().default(1) });
const speedSchema = z.object({ multiplier: z.number().positive() });
const seekSchema = z.object({ timestamp: z.string() });
let player = null;
export function setupReplayRoutes(app, log) {
    app.post('/replay/start', (req, res) => {
        const parse = startSchema.safeParse(req.body);
        if (!parse.success)
            return res.status(400).json({ error: parse.error.flatten() });
        const { date, speed } = parse.data;
        // For now, date maps to our sample file. Later, resolve by date partition/path.
        const file = `/Users/rhychaw/projects/marketSim/data/sample.ndjson`;
        const hub = globalThis.__MS_HUB__;
        player?.stop();
        player = new Player({ file, speed }, log, (ev) => hub?.broadcast({ type: 'event', payload: ev }));
        player.start().catch((err) => log.error({ err }, 'player error'));
        return res.json({ ok: true, state: player.getState() });
    });
    app.post('/replay/pause', (_req, res) => {
        player?.pause();
        return res.json({ ok: true, state: player?.getState() });
    });
    app.post('/replay/resume', (_req, res) => {
        player?.resume();
        return res.json({ ok: true, state: player?.getState() });
    });
    app.post('/replay/speed', (req, res) => {
        const parse = speedSchema.safeParse(req.body);
        if (!parse.success)
            return res.status(400).json({ error: parse.error.flatten() });
        const { multiplier } = parse.data;
        player?.setSpeed(multiplier);
        return res.json({ ok: true, speed: multiplier });
    });
    app.post('/replay/seek', (req, res) => {
        // Stub: not implemented in Player yet
        const parse = seekSchema.safeParse(req.body);
        if (!parse.success)
            return res.status(400).json({ error: parse.error.flatten() });
        return res.status(501).json({ ok: false, error: 'seek not implemented' });
    });
}
