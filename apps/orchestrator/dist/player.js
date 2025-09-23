import fs from 'fs';
import readline from 'readline';
export class Player {
    cfg;
    log;
    state = 'idle';
    rl = null;
    startMarketNs = null;
    startWallNs = null;
    lastTsNs = 0n;
    sink;
    constructor(cfg, log, sink) {
        this.cfg = cfg;
        this.log = log;
        this.sink = sink;
    }
    getState() { return this.state; }
    isPaused() { return this.state === 'paused'; }
    isStopped() { return this.state === 'stopped'; }
    setSpeed(multiplier) {
        if (multiplier <= 0)
            multiplier = 1;
        this.cfg.speed = multiplier;
    }
    async start() {
        if (this.state === 'playing')
            return;
        this.state = 'playing';
        const stream = fs.createReadStream(this.cfg.file, { encoding: 'utf8' });
        this.rl = readline.createInterface({ input: stream, crlfDelay: Infinity });
        for await (const line of this.rl) {
            if (this.isStopped())
                break;
            if (!line)
                continue;
            const obj = safeParse(line);
            if (!obj)
                continue;
            const tsVal = obj.ts_ns;
            const tsNumber = typeof tsVal === 'number' ? tsVal : Number(tsVal ?? 0);
            const tsNs = BigInt(tsNumber);
            if (this.startMarketNs === null) {
                this.startMarketNs = tsNs;
                this.startWallNs = nowNs();
            }
            if (this.isPaused()) {
                await this.waitUntilResumed();
            }
            await this.govern(tsNs);
            this.lastTsNs = tsNs;
            this.sink(obj);
        }
        this.state = 'stopped';
    }
    pause() { if (this.state === 'playing')
        this.state = 'paused'; }
    resume() {
        if (this.state === 'paused') {
            this.state = 'playing';
            if (this.startWallNs && this.startMarketNs) {
                // adjust wall start to keep alignment on resume
                const elapsedMarket = this.lastTsNs - this.startMarketNs;
                this.startWallNs = nowNs() - BigInt(Math.floor(Number(elapsedMarket) / this.cfg.speed));
            }
            if (this.waiter) {
                this.waiter();
                this.waiter = null;
            }
        }
    }
    stop() { this.state = 'stopped'; this.rl?.close(); }
    waiter = null;
    waitUntilResumed() {
        return new Promise((resolve) => { this.waiter = resolve; });
    }
    async govern(nextTs) {
        if (!this.startMarketNs || !this.startWallNs)
            return;
        const marketElapsed = Number(nextTs - this.startMarketNs);
        const desiredWallElapsed = marketElapsed / this.cfg.speed;
        const targetWall = this.startWallNs + BigInt(Math.floor(desiredWallElapsed));
        const delayNs = Number(targetWall - nowNs());
        if (delayNs > 0)
            await sleepNs(delayNs);
    }
}
function safeParse(line) {
    try {
        return JSON.parse(line);
    }
    catch {
        return null;
    }
}
function nowNs() {
    const [sec, nano] = process.hrtime();
    return BigInt(sec) * 1000000000n + BigInt(nano);
}
function sleepNs(ns) {
    const ms = Math.floor(ns / 1e6);
    const rem = ns - ms * 1e6;
    return new Promise((r) => setTimeout(r, ms + (rem > 0 ? 1 : 0)));
}
