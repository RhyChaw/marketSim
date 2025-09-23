# market-sim-sdk (Python)

Async client to subscribe to replay events via WebSocket and control the replay via REST.

## Install (editable)

```
pip install -e .
```

## Usage

```
python examples/print_events.py
```

Environment variables:
- `MARKETSIM_BASE` (default: http://localhost:4000)
- `MARKETSIM_WS` (default: ws://localhost:4000/ws)
