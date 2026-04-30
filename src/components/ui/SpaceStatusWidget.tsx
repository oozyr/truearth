"use client";

import { Satellite, Activity } from "lucide-react";
import { STARLINK_TLES } from "@/lib/tle-data";

export default function SpaceStatusWidget() {
  return (
    <div className="absolute left-6 top-6 bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex flex-col z-10 shadow-2xl pointer-events-auto">
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-indigo-500/20 p-2 rounded-lg border border-indigo-500/30">
          <Satellite className="w-5 h-5 text-indigo-400" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-white tracking-wider">SPACE LAYER</h2>
          <div className="flex items-center gap-1.5 text-xs text-emerald-400">
            <Activity className="w-3 h-3 animate-pulse" />
            <span>ONLINE</span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center gap-6 border-t border-white/10 pt-3">
          <span className="text-xs text-white/60">Active Assets</span>
          <span className="text-sm font-mono font-bold text-white">{STARLINK_TLES.length + 1}</span>
        </div>
        <div className="flex justify-between items-center gap-6">
          <span className="text-xs text-white/60">Orbit Class</span>
          <span className="text-xs font-mono text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
            LEO
          </span>
        </div>
        <div className="flex justify-between items-center gap-6">
          <span className="text-xs text-white/60">Tracking</span>
          <span className="text-xs font-mono text-cyan-300">REAL-TIME</span>
        </div>
      </div>
    </div>
  );
}
