# NDJSON Event Schema

One JSON object per line. All timestamps are nanoseconds since UNIX epoch.

Common fields:
- ts_ns: int64 (number encoded)
- seq: int64 (per-feed monotonic)
- type: "trade" | "quote" | "book"
- sym: string (symbol)

Trade:
```
{ "type":"trade", "ts_ns":0, "seq":0, "sym":"AAPL", "price": 150.12, "size": 100 }
```

Quote:
```
{ "type":"quote", "ts_ns":0, "seq":1, "sym":"AAPL", "bid":150.10, "bsize":200, "ask":150.15, "asize":180 }
```

Book snapshot (top N simplified):
```
{ "type":"book", "ts_ns":0, "seq":2, "sym":"AAPL", "bids":[[150.10,200]], "asks":[[150.15,180]] }
```
