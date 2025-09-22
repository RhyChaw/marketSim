# Architecture Overview

marketSim consists of five primary components:

1. OCaml Replay Core
   - Deterministic event scheduler preserving nanosecond timestamps
   - Speed governor mapping market time to wall-clock time
   - Pure state transitions; reproducible given inputs and seeds

2. Orchestrator (Node/TypeScript)
   - Process lifecycle for the OCaml core
   - REST control API: start, stop, pause, resume, seek, speed
   - WebSocket pub/sub broadcasting replayed events to clients/SDKs
   - Stress injection: synthetic events merged into the stream

3. Strategy SDKs (Python, Rust)
   - Subscribe to event stream
   - Emit orders/metrics back via a sandboxed channel
   - Local adapters for reconnect, backpressure, buffering

4. Dashboard (Next.js)
   - Interactive controls (speed, pause/resume, seek)
   - Live charts for trades, quotes, order book depth
   - Overlays for strategy P&L, exposure, order flow

5. Storage & Data
   - NDJSON and Arrow/Parquet inputs
   - Optional memory-mapped files for low-latency sequential access

## Dataflow

[Data Source] -> [Reader] -> [OCaml Scheduler] -> [Orchestrator WS] ->
[SDKs + Dashboard] -> [Metrics/Orders back to Orchestrator]

## Determinism

- Single-threaded event queue with total ordering by (timestamp, sequence)
- No wall-clock dependencies; simulated clock advanced by scheduler
- All randomness seeded and captured
- Checkpoints (snapshots) for rewind/seek

## APIs (initial draft)

- REST
  - POST /replay/start { date, speed }
  - POST /replay/pause
  - POST /replay/resume
  - POST /replay/seek { timestamp }
  - POST /replay/speed { multiplier }

- WebSocket topics
  - events.trades, events.quotes, events.book
  - control.status
  - metrics.strategy.<name>

## Roadmap Notes

- Phase 1: Core replay + orchestrator + basic dashboard
- Phase 2: SDKs and stress injection
- Phase 3: Rewind/seek snapshots and distributed multi-day runs
