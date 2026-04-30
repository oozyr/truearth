"use client";

import { useEffect, useState } from "react";
import { useGlobalStore } from "@/store/useGlobalStore";
import { Globe, Settings, Map, Globe2, Activity, Satellite } from "lucide-react";
import { STARLINK_TLES } from "@/lib/tle-data";

export default function HeaderBar() {
  const { settings, setViewMode, setSettingsOpen, events } = useGlobalStore();
  const [utcTime, setUtcTime] = useState("");

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setUtcTime(
        now.toUTCString().replace("GMT", "UTC").toUpperCase()
      );
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  // Calculate highest severity from events
  const severityOrder = ['critical', 'high', 'elevated', 'moderate', 'low'] as const;
  const highestSeverity = events.reduce((highest, evt) => {
    const evtIdx = severityOrder.indexOf(evt.severity);
    const highIdx = severityOrder.indexOf(highest);
    return evtIdx < highIdx ? evt.severity : highest;
  }, 'low' as (typeof severityOrder)[number]);

  const severityConfig = {
    critical: { label: 'CRITICAL', color: 'bg-red-500', text: 'text-red-400', glow: 'shadow-[0_0_12px_rgba(239,68,68,0.5)]' },
    high:     { label: 'HIGH',     color: 'bg-orange-500', text: 'text-orange-400', glow: 'shadow-[0_0_12px_rgba(249,115,22,0.4)]' },
    elevated: { label: 'ELEVATED', color: 'bg-yellow-500', text: 'text-yellow-400', glow: '' },
    moderate: { label: 'MODERATE', color: 'bg-blue-500', text: 'text-blue-400', glow: '' },
    low:      { label: 'LOW',      color: 'bg-green-500', text: 'text-green-400', glow: '' },
  };

  const sev = severityConfig[highestSeverity];

  return (
    <header className="absolute top-0 left-0 right-0 z-50 pointer-events-auto">
      <div className="glass-strong flex items-center justify-between px-4 h-11">
        {/* ── Left: Brand ── */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Globe2 className="w-5 h-5 text-pink-400" />
            <span className="text-sm font-black tracking-[0.2em] text-white">
              TRUE<span className="text-pink-400">EARTH</span>
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-2 ml-4 pl-4 border-l border-white/10">
            <div className="flex items-center gap-1.5">
              <Satellite className="w-3 h-3 text-indigo-400" />
              <span className="text-[10px] text-white/50 font-mono">{STARLINK_TLES.length + 1} ASSETS</span>
            </div>
            <div className="flex items-center gap-1.5 ml-2">
              <Activity className="w-3 h-3 text-emerald-400 animate-pulse" />
              <span className="text-[10px] text-emerald-400 font-mono">LIVE</span>
            </div>
          </div>
        </div>

        {/* ── Center: Status ── */}
        <div className="flex items-center gap-4">
          {/* Severity Badge */}
          <div className={`flex items-center gap-2 px-2.5 py-1 rounded-md border border-white/10 ${sev.glow}`}>
            <div className={`w-2 h-2 rounded-full ${sev.color} animate-pulse`} />
            <span className={`text-[10px] font-bold tracking-widest ${sev.text}`}>{sev.label}</span>
          </div>

          {/* UTC Clock */}
          <div className="hidden md:block text-[10px] font-mono text-white/50 tracking-wider">
            {utcTime}
          </div>

          {/* Event Count */}
          <div className="hidden lg:flex items-center gap-1.5 px-2 py-0.5 rounded bg-white/5 border border-white/5">
            <Globe className="w-3 h-3 text-pink-400/70" />
            <span className="text-[10px] font-mono text-white/50">{events.length} EVENTS</span>
          </div>
        </div>

        {/* ── Right: Controls ── */}
        <div className="flex items-center gap-2">
          {/* 2D / 3D Toggle */}
          <div className="flex items-center rounded-lg overflow-hidden border border-white/10">
            <button
              onClick={() => setViewMode('2d')}
              className={`flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold tracking-wider transition-all ${
                settings.viewMode === '2d'
                  ? 'bg-pink-500/20 text-pink-300 border-r border-pink-500/30'
                  : 'text-white/40 hover:text-white/60 border-r border-white/10'
              }`}
            >
              <Map className="w-3 h-3" />
              2D
            </button>
            <button
              onClick={() => setViewMode('3d')}
              className={`flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold tracking-wider transition-all ${
                settings.viewMode === '3d'
                  ? 'bg-pink-500/20 text-pink-300'
                  : 'text-white/40 hover:text-white/60'
              }`}
            >
              <Globe2 className="w-3 h-3" />
              3D
            </button>
          </div>

          {/* Settings */}
          <button
            onClick={() => setSettingsOpen(true)}
            className="p-1.5 rounded-lg text-white/40 hover:text-white/80 hover:bg-white/5 transition-all"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
