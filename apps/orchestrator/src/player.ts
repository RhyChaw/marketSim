import fs from 'fs';
import readline from 'readline';
import type pino from 'pino';

export type PlayerState = 'idle' | 'playing' | 'paused' | 'stopped';

export interface PlayerConfig {
  file: string;
  speed: number; // multiplier
}

export type EventSink = (event: Record<string, unknown>) => void;

export class Player {
  private cfg: PlayerConfig;
  private log: pino.Logger;
  private state: PlayerState = 'idle';
  private rl: readline.Interface | null = null;
  private startMarketNs: bigint | null = null;
  private startWallNs: bigint | null = null;
  private lastTsNs: bigint = 0n;
  private sink: EventSink;

  constructor(cfg: PlayerConfig, log: pino.Logger, sink: EventSink) {
    this.cfg = cfg;
    this.log = log;
    this.sink = sink;
  }

  getState() { return this.state; }
  private isPaused() { return this.state === 'paused'; }
  private isStopped() { return this.state === 'stopped'; }

  setSpeed(multiplier: number) {
    if (multiplier <= 0) multiplier = 1;
    this.cfg.speed = multiplier;
  }

  async start(): Promise<void> {
    if (this.state === 'playing') return;
    this.state = 'playing';

    const stream = fs.createReadStream(this.cfg.file, { encoding: 'utf8' });
    this.rl = readline.createInterface({ input: stream, crlfDelay: Infinity });

    for await (const line of this.rl) {
      if (this.isStopped()) break;
      if (!line) continue;
      const obj = safeParse(line);
      if (!obj) continue;

      const tsVal = (obj as any).ts_ns;
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

  pause() { if (this.state === 'playing') this.state = 'paused'; }
  resume() {
    if (this.state === 'paused') {
      this.state = 'playing';
      if (this.startWallNs && this.startMarketNs) {
        // adjust wall start to keep alignment on resume
        const elapsedMarket = this.lastTsNs - this.startMarketNs;
        this.startWallNs = nowNs() - BigInt(Math.floor(Number(elapsedMarket) / this.cfg.speed));
      }
      if (this.waiter) { this.waiter(); this.waiter = null; }
    }
  }
  stop() { this.state = 'stopped'; this.rl?.close(); }

  private waiter: (() => void) | null = null;
  private waitUntilResumed(): Promise<void> {
    return new Promise((resolve) => { this.waiter = resolve; });
  }

  private async govern(nextTs: bigint): Promise<void> {
    if (!this.startMarketNs || !this.startWallNs) return;
    const marketElapsed = Number(nextTs - this.startMarketNs);
    const desiredWallElapsed = marketElapsed / this.cfg.speed;
    const targetWall = this.startWallNs + BigInt(Math.floor(desiredWallElapsed));
    const delayNs = Number(targetWall - nowNs());
    if (delayNs > 0) await sleepNs(delayNs);
  }
}

function safeParse(line: string): Record<string, unknown> | null {
  try { return JSON.parse(line); } catch { return null; }
}

function nowNs(): bigint {
  const [sec, nano] = process.hrtime();
  return BigInt(sec) * 1_000_000_000n + BigInt(nano);
}

function sleepNs(ns: number): Promise<void> {
  const ms = Math.floor(ns / 1e6);
  const rem = ns - ms * 1e6;
  return new Promise((r) => setTimeout(r, ms + (rem > 0 ? 1 : 0)));
}
