"use client";

import { useState } from "react";
import { useGlobalStore } from "@/store/useGlobalStore";
import { ModeTag } from "@/types/global";
import { Globe, ShieldAlert, TrendingUp, Pickaxe, Loader2 } from "lucide-react";
import clsx from "clsx";

export default function NewsSidebar() {
  const { events, activeMode, setActiveMode, updateEvent } = useGlobalStore();
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);
  const [isLoadingTruth, setIsLoadingTruth] = useState(false);

  const handleEventClick = async (eventId: string) => {
    if (expandedEventId === eventId) {
      setExpandedEventId(null);
      return;
    }
    
    setExpandedEventId(eventId);
    
    const event = events.find(e => e.id === eventId);
    if (event && !event.truthAnalysis) {
      setIsLoadingTruth(true);
      try {
        const res = await fetch(`/api/events/${eventId}/truth`);
        if (res.ok) {
          const data = await res.json();
          updateEvent(eventId, { truthAnalysis: data.truthAnalysis });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoadingTruth(false);
      }
    }
  };

  const getModeIcon = (mode: ModeTag) => {
    switch (mode) {
      case "market":
        return <TrendingUp className="w-4 h-4" />;
      case "war":
        return <ShieldAlert className="w-4 h-4" />;
      case "resources":
        return <Pickaxe className="w-4 h-4" />;
      default:
        return <Globe className="w-4 h-4" />;
    }
  };

  const getModeColor = (mode: ModeTag) => {
    switch (mode) {
      case "market":
        return "text-cyan-400 bg-cyan-400/10 border-cyan-400/20";
      case "war":
        return "text-amber-400 bg-amber-400/10 border-amber-400/20";
      case "resources":
        return "text-emerald-400 bg-emerald-400/10 border-emerald-400/20";
      default:
        return "text-white bg-white/10 border-white/20";
    }
  };

  return (
    <div className="absolute right-6 top-6 bottom-6 w-80 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex flex-col z-20 overflow-hidden shadow-2xl pointer-events-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white tracking-wider flex items-center gap-2">
          <Globe className="w-5 h-5 text-indigo-400" />
          OSINT FEED
        </h2>
        <div className="flex gap-1">
          {(['market', 'war', 'resources'] as ModeTag[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setActiveMode(mode)}
              className={clsx(
                "p-2 rounded-full border transition-all duration-300",
                activeMode === mode 
                  ? getModeColor(mode) 
                  : "text-white/50 border-transparent hover:bg-white/5"
              )}
            >
              {getModeIcon(mode)}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
        {events.filter(e => e.modeTag === activeMode).map((event) => (
          <div 
            key={event.id} 
            className={clsx(
              "bg-white/5 border rounded-xl p-4 transition-all duration-300 cursor-pointer overflow-hidden backdrop-blur-sm",
              expandedEventId === event.id ? "border-white/30 bg-white/10" : "border-white/10 hover:bg-white/10"
            )}
            onClick={() => handleEventClick(event.id)}
          >
            <div className="flex justify-between items-start mb-2">
              <span className={clsx("text-[10px] font-bold px-2 py-0.5 rounded border tracking-tighter", getModeColor(event.modeTag))}>
                {event.modeTag.toUpperCase()}
              </span>
              <span className="text-[10px] text-white/40 font-mono">
                {event.id}
              </span>
            </div>
            
            <h3 className={clsx(
              "text-sm font-bold text-white transition-all leading-snug",
              expandedEventId === event.id ? "mb-3" : "mb-0"
            )}>
              {event.title}
            </h3>
            
            {/* Expanded Content */}
            {expandedEventId === event.id && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-500">
                {/* Summary */}
                <p className="text-xs text-white/70 mb-4 border-l-2 border-indigo-500/30 pl-3 italic">
                  {event.summary}
                </p>

                {/* Truth Score Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest">Truth Consensus</span>
                    <span className="text-[10px] font-mono text-indigo-400">{(event.truthScore * 100).toFixed(0)}%</span>
                  </div>
                  <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 shadow-[0_0_8px_rgba(99,102,241,0.6)] transition-all duration-1000"
                      style={{ width: `${event.truthScore * 100}%` }}
                    />
                  </div>
                </div>

                {/* Quant Impact Section */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="bg-white/5 rounded-lg p-2 border border-white/5">
                    <div className="text-[9px] text-white/40 uppercase mb-0.5">Ticker</div>
                    <div className="text-xs font-bold text-white tracking-wider">{event.marketImpact.ticker}</div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-2 border border-white/5">
                    <div className="text-[9px] text-white/40 uppercase mb-0.5">Volatility</div>
                    <div className={clsx(
                      "text-xs font-bold",
                      event.marketImpact.changePercent >= 0 ? "text-emerald-400" : "text-rose-400"
                    )}>
                      {event.marketImpact.changePercent > 0 ? "+" : ""}{event.marketImpact.changePercent}%
                    </div>
                  </div>
                </div>

                {/* Truth Analysis Section */}
                <div className="mt-4 pt-3 border-t border-white/5">
                  <h4 className="text-[10px] font-bold text-indigo-300 mb-2 flex items-center gap-2 uppercase tracking-widest">
                    <ShieldAlert className="w-3 h-3" />
                    Intelligence Analysis
                  </h4>
                  {isLoadingTruth && !event.truthAnalysis ? (
                    <div className="flex items-center gap-2 text-xs text-white/30 py-2">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Vectoring data...
                    </div>
                  ) : (
                    <div 
                      className="text-[11px] text-white/60 prose prose-invert prose-p:my-1 prose-headings:my-2 leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: event.truthAnalysis?.replace(/\n/g, '<br/>') || 'Analysis pending...' }}
                    />
                  )}
                </div>
                
                <div className="mt-4 pt-3 border-t border-white/5 flex justify-between items-center text-[10px] text-white/30 font-mono">
                  <span>LOC: {event.coordinates.lat.toFixed(2)}, {event.coordinates.lon.toFixed(2)}</span>
                  <span className="uppercase">{event.marketImpact.correlation} correlation</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
