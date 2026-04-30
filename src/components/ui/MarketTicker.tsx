"use client";

import { useEffect } from "react";
import { useGlobalStore } from "@/store/useGlobalStore";
import { TrendingUp, TrendingDown, ExternalLink } from "lucide-react";

export default function MarketTicker() {
  const { marketData, fetchMarkets, settings } = useGlobalStore();

  useEffect(() => {
    fetchMarkets();
    const interval = setInterval(fetchMarkets, 60000);
    return () => clearInterval(interval);
  }, [fetchMarkets]);

  if (!settings.showMarketTicker || marketData.length === 0) return null;

  const formatPrice = (price: number, type: string) => {
    if (type === 'crypto') return price.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    if (type === 'commodity' && price < 10) return price.toFixed(2);
    if (price > 1000) return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return price.toFixed(2);
  };

  // Double the data for seamless loop
  const doubled = [...marketData, ...marketData];

  return (
    <div className="absolute top-11 left-0 right-0 z-40 pointer-events-auto overflow-hidden">
      <div className="glass border-t-0 border-l-0 border-r-0 border-b border-white/5 h-7 flex items-center">
        <div className="flex items-center animate-ticker whitespace-nowrap">
          {doubled.map((tick, i) => (
            <a
              key={`${tick.symbol}_${i}`}
              href={tick.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-4 group hover:bg-white/5 h-7 transition-colors"
            >
              <span className="text-[10px] font-bold text-white/70 tracking-wider group-hover:text-white transition-colors">
                {tick.symbol}
              </span>
              <span className="text-[10px] font-mono text-white/50">
                ${formatPrice(tick.price, tick.type)}
              </span>
              <span className={`flex items-center gap-0.5 text-[10px] font-mono font-bold ${
                tick.changePercent >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}>
                {tick.changePercent >= 0 ? (
                  <TrendingUp className="w-2.5 h-2.5" />
                ) : (
                  <TrendingDown className="w-2.5 h-2.5" />
                )}
                {tick.changePercent > 0 ? '+' : ''}{tick.changePercent}%
              </span>
              <ExternalLink className="w-2.5 h-2.5 text-white/0 group-hover:text-pink-400/60 transition-all" />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
