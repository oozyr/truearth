"use client";

import { useGlobalStore } from "@/store/useGlobalStore";
import { X, Satellite, Plane, Ship, Activity, MapPin } from "lucide-react";

export default function AssetDetailsPopup() {
  const { selectedAsset, setSelectedAsset } = useGlobalStore();

  if (!selectedAsset) return null;

  const Icon = selectedAsset.type === 'satellite' ? Satellite :
               selectedAsset.type === 'aircraft' ? Plane :
               Ship;

  const typeLabel = selectedAsset.type === 'satellite' ? 'SATELLITE' :
                    selectedAsset.type === 'aircraft' ? 'AIRCRAFT' : 'MARITIME VESSEL';

  const categoryColor = selectedAsset.category === 'military' ? 'text-red-400' :
                        selectedAsset.category === 'comms' || selectedAsset.category === 'commercial' ? 'text-cyan-400' :
                        selectedAsset.category === 'weather' || selectedAsset.category === 'research' ? 'text-emerald-400' :
                        'text-pink-400';

  return (
    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-80 bg-[#0a1128]/90 backdrop-blur-md border border-cyan-500/30 rounded-xl overflow-hidden shadow-2xl z-50 animate-in slide-in-from-bottom-8 fade-in duration-300">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/5">
        <div className="flex items-center gap-2">
          <Icon className={`w-4 h-4 ${categoryColor}`} />
          <span className="text-xs font-mono font-bold tracking-widest text-slate-300">
            {typeLabel}
          </span>
        </div>
        <button 
          onClick={() => setSelectedAsset(null)}
          className="text-slate-400 hover:text-white transition-colors p-1"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4 space-y-4">
        <div>
          <h3 className="text-lg font-bold text-white font-mono break-words leading-tight">
            {selectedAsset.name}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-xs font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-white/10 ${categoryColor}`}>
              {selectedAsset.category}
            </span>
            <span className="flex items-center gap-1 text-xs text-slate-400 font-mono">
              <Activity className="w-3 h-3" />
              {selectedAsset.status}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/10">
          <div>
            <span className="block text-[10px] text-slate-500 font-bold tracking-wider mb-1">LOCATION</span>
            <span className="flex items-center gap-1 text-xs text-slate-300 font-mono">
              <MapPin className="w-3 h-3 text-cyan-400" />
              {selectedAsset.location}
            </span>
          </div>
          <div>
            <span className="block text-[10px] text-slate-500 font-bold tracking-wider mb-1">DATA STREAM</span>
            <span className="flex items-center gap-1 text-xs text-emerald-400 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              ENCRYPTED
            </span>
          </div>
        </div>
      </div>

      {/* Decorative scanning line */}
      <div className="absolute top-0 left-0 w-full h-0.5 bg-cyan-400/50 shadow-[0_0_8px_2px_rgba(34,211,238,0.5)] animate-scan"></div>
    </div>
  );
}
