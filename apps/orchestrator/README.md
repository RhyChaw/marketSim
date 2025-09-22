# Orchestrator (Node/TypeScript)

Express + WebSocket server controlling the OCaml core and broadcasting events.

## Dev

- Install deps:

```
npm ci
```

- Start dev server:

```
npm run dev
```

- REST endpoints (stubs): `/replay/start`, `/replay/pause`, `/replay/resume`, `/replay/speed`, `/replay/seek`
- WebSocket: `ws://localhost:4000/ws` (heartbeat messages)
