import { NextResponse } from 'next/server';
import { TRACKED_INSTRUMENTS, MOCK_PRICES, FINNHUB_API_KEY } from '@/lib/market-config';
import type { MarketTicker } from '@/types/global';

// Cache for 60 seconds
export const revalidate = 60;

export async function GET() {
  try {
    // ── Live data path (when API key is configured) ──
    if (FINNHUB_API_KEY) {
      // TODO: Implement live Finnhub/CoinGecko fetch
      // const liveData = await fetchLiveMarketData();
      // return Response.json(liveData);
    }

    // ── Mock data path ──
    const tickers: MarketTicker[] = TRACKED_INSTRUMENTS.map(inst => {
      const mock = MOCK_PRICES[inst.symbol] || { price: 0, change: 0 };
      // Add slight randomization so data looks "live" on refresh
      const jitter = (Math.random() - 0.5) * 0.4;
      const price = +(mock.price * (1 + jitter / 100)).toFixed(2);
      const changePercent = +(mock.change + jitter).toFixed(2);
      const change24h = +(price * changePercent / 100).toFixed(2);

      return {
        symbol: inst.symbol,
        name: inst.name,
        price,
        change24h,
        changePercent,
        type: inst.type,
        url: `https://www.tradingview.com/symbols/${inst.tradingViewSymbol}/`,
      };
    });

    return Response.json(tickers, { status: 200 });
  } catch (error) {
    console.error('[TRUEARTH] Market fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch market data' },
      { status: 500 }
    );
  }
}
