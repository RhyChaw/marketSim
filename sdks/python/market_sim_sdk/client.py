import asyncio
import json
import os
import time
from dataclasses import dataclass
from typing import Awaitable, Callable, Optional

import requests
import websockets

EventCallback = Callable[[dict], Awaitable[None]]


@dataclass
class ReplayControl:
    base_url: str

    def start(self, date: str, speed: float = 1.0) -> dict:
        r = requests.post(f"{self.base_url}/replay/start", json={"date": date, "speed": speed}, timeout=10)
        r.raise_for_status()
        return r.json()

    def pause(self) -> dict:
        r = requests.post(f"{self.base_url}/replay/pause", timeout=10)
        r.raise_for_status()
        return r.json()

    def resume(self) -> dict:
        r = requests.post(f"{self.base_url}/replay/resume", timeout=10)
        r.raise_for_status()
        return r.json()

    def speed(self, multiplier: float) -> dict:
        r = requests.post(f"{self.base_url}/replay/speed", json={"multiplier": multiplier}, timeout=10)
        r.raise_for_status()
        return r.json()

    def seek(self, timestamp: str) -> dict:
        r = requests.post(f"{self.base_url}/replay/seek", json={"timestamp": timestamp}, timeout=10)
        r.raise_for_status()
        return r.json()


class MarketSimClient:
    def __init__(self,
                 base_url: Optional[str] = None,
                 ws_url: Optional[str] = None,
                 reconnect: bool = True,
                 max_backoff_s: float = 10.0) -> None:
        self.base_url = base_url or os.getenv("MARKETSIM_BASE", "http://localhost:4000")
        self.ws_url = ws_url or os.getenv("MARKETSIM_WS", "ws://localhost:4000/ws")
        self.reconnect = reconnect
        self.max_backoff_s = max_backoff_s
        self.control = ReplayControl(self.base_url)

    async def run(self, on_event: EventCallback) -> None:
        backoff = 0.5
        while True:
            try:
                async with websockets.connect(self.ws_url, ping_interval=20, ping_timeout=20) as ws:
                    backoff = 0.5
                    async for msg in ws:
                        try:
                            data = json.loads(msg)
                        except Exception:
                            continue
                        await on_event(data)
            except Exception:
                if not self.reconnect:
                    raise
                await asyncio.sleep(backoff)
                backoff = min(self.max_backoff_s, backoff * 2)

    async def run_print(self) -> None:
        async def printer(ev: dict) -> None:
            print(json.dumps(ev, separators=(",", ":")))
        await self.run(printer)
