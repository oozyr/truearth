/**
 * Market Ticker Configuration
 *
 * To enable live data:
 *   1. Sign up at https://finnhub.io (stocks/indices) or https://www.coingecko.com/api (crypto)
 *   2. Set FINNHUB_API_KEY and/or COINGECKO_API_KEY in .env.local
 *   3. The API route will automatically switch from mock → live data
 *
 * Mock data shape exactly mirrors real API responses for zero-friction swap.
 */

// ─── API Key Config ─────────────────────────────────────────
export const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY || '';
export const COINGECKO_API_KEY = process.env.COINGECKO_API_KEY || '';

export const USE_LIVE_MARKET_DATA = !!(FINNHUB_API_KEY || COINGECKO_API_KEY);

// ─── Tracked Instruments ────────────────────────────────────
export interface TrackedInstrument {
  symbol: string;
  name: string;
  type: 'stock' | 'crypto' | 'commodity' | 'index';
  tradingViewSymbol: string; // For direct TradingView link
}

export const TRACKED_INSTRUMENTS: TrackedInstrument[] = [
  // Indices
  { symbol: 'SPX',  name: 'S&P 500',     type: 'index',     tradingViewSymbol: 'SP:SPX' },
  { symbol: 'IXIC', name: 'NASDAQ',       type: 'index',     tradingViewSymbol: 'NASDAQ:IXIC' },
  { symbol: 'DJI',  name: 'Dow Jones',    type: 'index',     tradingViewSymbol: 'DJ:DJI' },
  { symbol: 'FTSE', name: 'FTSE 100',     type: 'index',     tradingViewSymbol: 'FTSE:UKX' },
  { symbol: 'N225', name: 'Nikkei 225',   type: 'index',     tradingViewSymbol: 'TVC:NI225' },

  // Crypto
  { symbol: 'BTC',  name: 'Bitcoin',      type: 'crypto',    tradingViewSymbol: 'BINANCE:BTCUSDT' },
  { symbol: 'ETH',  name: 'Ethereum',     type: 'crypto',    tradingViewSymbol: 'BINANCE:ETHUSDT' },

  // Commodities
  { symbol: 'GOLD', name: 'Gold',         type: 'commodity', tradingViewSymbol: 'TVC:GOLD' },
  { symbol: 'OIL',  name: 'Crude Oil',    type: 'commodity', tradingViewSymbol: 'TVC:USOIL' },
  { symbol: 'NG',   name: 'Natural Gas',  type: 'commodity', tradingViewSymbol: 'TVC:NATURALGAS' },
];

// ─── Mock Prices (mirrors real API shape) ───────────────────
export const MOCK_PRICES: Record<string, { price: number; change: number }> = {
  SPX:  { price: 5892.34,  change: 0.42  },
  IXIC: { price: 19103.52, change: -0.18 },
  DJI:  { price: 42458.19, change: 0.31  },
  FTSE: { price: 8394.50,  change: -0.55 },
  N225: { price: 38470.20, change: 1.12  },
  BTC:  { price: 94832.50, change: 2.34  },
  ETH:  { price: 3412.80,  change: -1.05 },
  GOLD: { price: 3289.40,  change: 0.67  },
  OIL:  { price: 78.52,    change: -1.88 },
  NG:   { price: 3.42,     change: 3.15  },
};
