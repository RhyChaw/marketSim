# marketSim

High-Performance Real-Time Market Replay and Simulation Engine.

marketSim replays historical market data deterministically at configurable speeds (1x…1000x+),
feeds strategies via a sandboxed plugin API, and provides an interactive dashboard for control
and visualization. The event-scheduling core is implemented in OCaml to prioritize correctness
and reproducibility.

## Features
- Deterministic OCaml event scheduler preserving nanosecond timestamps and ordering
- Adjustable replay speed with pause/resume/seek controls
- Pluggable strategy interface (Python and Rust SDKs)
- Node/TypeScript orchestrator with REST control plane and WebSocket streaming
- React/Next.js dashboard for live controls, overlays, and metrics
- Data ingestion from columnar (Parquet/Arrow) or NDJSON/binary
- Stress-testing hooks to inject synthetic shock events

## Architecture Overview
See `docs/ARCHITECTURE.md` for diagrams and dataflow, including:
- Replay Core (OCaml): event queue, clock, speed governor, deterministic scheduler
- Orchestrator (Node/TS): process control, REST, WebSocket broadcast, stress injection
- Strategy SDKs: subscribe to events, emit orders/metrics, sandbox isolation
- Dashboard (Next.js): controls, live charts, P&L/exposure overlays
- Storage: memory-mapped files or Arrow/Parquet for fast sequential access

## Repository Layout
- `apps/core-ocaml` — OCaml replay core (dune project)
- `apps/orchestrator` — Node/TypeScript orchestrator and APIs
- `apps/dashboard` — Next.js dashboard
- `sdks/python` — Python strategy SDK (`market_sim_sdk`)
- `sdks/rust` — Rust strategy SDK (crate)
- `data` — sample datasets and generators
- `docs` — architecture/design docs
- `scripts` — helper scripts (dev, data prep, CI)

## Quickstart (work in progress)
1. Prerequisites
   - OCaml + opam, Node.js 18+, Python 3.10+, Rust stable, Yarn/PNPM
2. Clone and bootstrap
   - `cd apps/orchestrator && npm ci` (or `pnpm i`)
   - `cd apps/core-ocaml && opam switch create . ocaml-base-compiler.5.1.0 && opam install dune` (example)
   - `cd apps/dashboard && npm ci`
3. Run (dev):
   - Start core in replay-dev mode
   - Start orchestrator (REST+WS)
   - Start dashboard and connect to WS

Scripts and exact commands will be added as components land.

## Data Formats
- NDJSON events: one event per line (trade/quote/book), monotonic nanosecond timestamps
- Binary columnar: Arrow/Parquet for high-throughput sequential scan
- Sample data generator: synthetic order-book and trade streams for regression tests

## Determinism & Testing
- Scheduler is pure/functional with explicit state transitions
- Input data and seed fully determine outputs
- Deterministic snapshotting for rewind/seek
- Test suite validates event ordering and reproducibility across replays

## Roadmap
- OCaml core with speed governor and wall-clock mapping
- Orchestrator REST/WS and basic pub/sub
- Python/Rust SDKs (subscribe/metrics)
- Dashboard controls and basic charts
- Stress event injection and comparison runs
- Distributed multi-day replays

## Contributing
Issues and PRs welcome. Please discuss larger changes first. Code style and CI
details will be provided as the modules stabilize.

## License
MIT
