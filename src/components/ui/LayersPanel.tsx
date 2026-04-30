"use client";

import { useState } from "react";
import { useGlobalStore } from "@/store/useGlobalStore";
import {
  Layers, Search, Eye, EyeOff,
  Swords, TrendingUp, Pickaxe, CloudRain,
  Shield, Landmark, HeartPulse, ChevronLeft,
} from "lucide-react";
import type { LayerConfig } from "@/types/global";

const ICON_MAP: Record<string, React.ReactNode> = {
  Swords:     <Swords className="w-3.5 h-3.5" />,
  TrendingUp: <TrendingUp className="w-3.5 h-3.5" />,
  Pickaxe:    <Pickaxe className="w-3.5 h-3.5" />,
  CloudRain:  <CloudRain className="w-3.5 h-3.5" />,
  Shield:     <Shield className="w-3.5 h-3.5" />,
  Landmark:   <Landmark className="w-3.5 h-3.5" />,
  HeartPulse: <HeartPulse className="w-3.5 h-3.5" />,
};

export default function LayersPanel() {
  const { layers, toggleLayer, setAllLayers, settings, events } = useGlobalStore();
  const [search, setSearch] = useState("");
  const [collapsed, setCollapsed] = useState(false);

  if (!settings.showLayersPanel) return null;

  const filtered = search
    ? layers.filter(l => l.label.toLowerCase().includes(search.toLowerCase()))
    : layers;

  const enabledCount = layers.filter(l => l.enabled).length;
  const allEnabled = enabledCount === layers.length;

  // Count events per category
  const countByCategory = (cat: string) =>
    events.filter(e => e.category === cat).length;

  if (collapsed) {
    return (
      <button
        onClick={() => setCollapsed(false)}
        className="absolute left-3 top-[76px] z-30 glass rounded-lg p-2 pointer-events-auto hover:bg-white/10 transition-all group"
        title="Show layers"
      >
        <Layers className="w-4 h-4 text-white/60 group-hover:text-pink-400 transition-colors" />
      </button>
    );
  }

  return (
    <div className="absolute left-3 top-[76px] z-30 w-56 glass rounded-xl pointer-events-auto animate-fade-in flex flex-col max-h-[calc(100vh-200px)]">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-white/5">
        <div className="flex items-center gap-2">
          <Layers className="w-3.5 h-3.5 text-pink-400" />
          <span className="text-[11px] font-bold text-white tracking-wider">LAYERS</span>
          <span className="text-[9px] font-mono text-white/30 bg-white/5 px-1.5 py-0.5 rounded">
            {enabledCount}/{layers.length}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setAllLayers(!allEnabled)}
            className="p-1 rounded text-white/30 hover:text-white/70 transition-colors"
            title={allEnabled ? "Hide all" : "Show all"}
          >
            {allEnabled ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
          </button>
          <button
            onClick={() => setCollapsed(true)}
            className="p-1 rounded text-white/30 hover:text-white/70 transition-colors"
          >
            <ChevronLeft className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="px-3 py-2 border-b border-white/5">
        <div className="flex items-center gap-2 bg-white/5 rounded-lg px-2.5 py-1.5">
          <Search className="w-3 h-3 text-white/30" />
          <input
            type="text"
            placeholder="Search layers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-[10px] text-white/80 placeholder:text-white/20 outline-none w-full font-mono"
          />
        </div>
      </div>

      {/* Layer List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar py-1">
        {filtered.map((layer) => (
          <LayerRow
            key={layer.id}
            layer={layer}
            count={countByCategory(layer.category)}
            onToggle={() => toggleLayer(layer.id)}
          />
        ))}
      </div>
    </div>
  );
}

function LayerRow({ layer, count, onToggle }: { layer: LayerConfig; count: number; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={`w-full flex items-center gap-2.5 px-3 py-2 text-left transition-all group ${
        layer.enabled
          ? 'hover:bg-white/5'
          : 'opacity-40 hover:opacity-70'
      }`}
    >
      {/* Checkbox */}
      <div
        className={`w-4 h-4 rounded flex items-center justify-center border transition-all flex-shrink-0 ${
          layer.enabled
            ? 'border-transparent'
            : 'border-white/20'
        }`}
        style={{
          backgroundColor: layer.enabled ? layer.color + '30' : 'transparent',
          borderColor: layer.enabled ? layer.color + '60' : undefined,
        }}
      >
        {layer.enabled && (
          <svg className="w-2.5 h-2.5" viewBox="0 0 12 12" fill="none">
            <path d="M2 6L5 9L10 3" stroke={layer.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>

      {/* Icon */}
      <span style={{ color: layer.enabled ? layer.color : 'rgba(255,255,255,0.3)' }}>
        {ICON_MAP[layer.icon] || <Layers className="w-3.5 h-3.5" />}
      </span>

      {/* Label */}
      <span className={`text-[10px] font-semibold tracking-wide flex-1 ${
        layer.enabled ? 'text-white/80' : 'text-white/30'
      }`}>
        {layer.label.toUpperCase()}
      </span>

      {/* Count */}
      {count > 0 && layer.enabled && (
        <span
          className="text-[9px] font-mono px-1.5 py-0.5 rounded-full"
          style={{ backgroundColor: layer.color + '20', color: layer.color }}
        >
          {count}
        </span>
      )}
    </button>
  );
}
