import asyncio
from market_sim_sdk import MarketSimClient

async def main():
    client = MarketSimClient()
    await client.run_print()

if __name__ == "__main__":
    asyncio.run(main())
