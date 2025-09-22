#!/usr/bin/env python3
import json
import random
import time
from typing import List, Tuple

random.seed(42)

Symbol = str

def gen_series(symbol: Symbol, count: int, start_ns: int, spacing_ns: int) -> List[dict]:
    price = 100.0
    out = []
    ts = start_ns
    for i in range(count):
        # random walk
        price += random.uniform(-0.05, 0.05)
        trade = {
            "type": "trade",
            "ts_ns": ts,
            "seq": i,
            "sym": symbol,
            "price": round(price, 4),
            "size": random.choice([10, 25, 50, 100])
        }
        bid = round(price - 0.02, 4)
        ask = round(price + 0.02, 4)
        quote = {
            "type": "quote",
            "ts_ns": ts,
            "seq": i,
            "sym": symbol,
            "bid": bid,
            "bsize": random.choice([100, 200, 300]),
            "ask": ask,
            "asize": random.choice([80, 160, 240])
        }
        out.append(quote)
        out.append(trade)
        ts += spacing_ns
    return out

if __name__ == "__main__":
    import argparse
    ap = argparse.ArgumentParser()
    ap.add_argument("--symbol", default="AAPL")
    ap.add_argument("--count", type=int, default=1000)
    ap.add_argument("--spacing-ns", type=int, default=1_000_000)  # 1ms
    ap.add_argument("--out", default="/Users/rhychaw/projects/marketSim/data/sample.ndjson")
    args = ap.parse_args()

    events = gen_series(args.symbol, args.count, 0, args.spacing_ns)
    with open(args.out, "w") as f:
        for ev in events:
            f.write(json.dumps(ev, separators=(",", ":")) + "\n")
    print(f"wrote {len(events)} events to {args.out}")
