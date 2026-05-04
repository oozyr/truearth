"use client";

import { useState } from "react";
import { useGlobalStore } from "@/store/useGlobalStore";
import {
  Layers, Search, Eye, EyeOff,
  Swords, TrendingUp, Pickaxe, CloudRain,
  Shield, Landmark, HeartPulse, ChevronLeft,
  Satellite, Plane, Ship, Radio, Navigation,
  Cloud, FlaskConical, ShieldAlert, Truck, Anchor, Crosshair,
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

interface AssetFilterItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  group: 'satellites' | 'aircraft' | 'maritime';
}

const ASSET_FILTERS: AssetFilterItem[] = [
  { id: 'sat_communication', label: 'COMMS',       icon: <Radio className="w-3 h-3" />,        color: '#22d3ee', group: 'satellites' },
  { id: 'sat_navigation',    label: 'NAV/GPS',     icon: <Navigation className="w-3 h-3" />,   color: '#34d399', group: 'satellites' },
  { id: 'sat_weather',       label: 'WEATHER',     icon: <Cloud className="w-3 h-3" />,        color: '#f59e0b', group: 'satellites' },
  { id: 'sat_research',      label: 'RESEARCH',    icon: <FlaskConical className="w-3 h-3" />, color: '#a855f7', group: 'satellites' },
  { id: 'sat_military',      label: 'MILITARY',    icon: <ShieldAlert className="w-3 h-3" />,  color: '#ef4444', group: 'satellites' },
  { id: 'sat_other',         label: 'OTHER',       icon: <Satellite className="w-3 h-3" />,    color: '#6b7280', group: 'satellites' },
  { id: 'air_commercial',    label: 'COMMERCIAL',  icon: <Plane className="w-3 h-3" />,        color: '#f59e0b', group: 'aircraft' },
  { id: 'air_cargo',         label: 'CARGO',       icon: <Truck className="w-3 h-3" />,        color: '#fb923c', group: 'aircraft' },
  { id: 'air_military',      label: 'MILITARY',    icon: <Crosshair className="w-3 h-3" />,    color: '#ef4444', group: 'aircraft' },
  { id: 'ship_cargo',        label: 'CARGO',       icon: <Ship className="w-3 h-3" />,         color: '#3b82f6', group: 'maritime' },
  { id: 'ship_tanker',       label: 'TANKER',      icon: <Anchor className="w-3 h-3" />,       color: '#60a5fa', group: 'maritime' },
  { id: 'ship_military',     label: 'MILITARY',    icon: <ShieldAlert className="w-3 h-3" />,  color: '#ef4444', group: 'maritime' },
];

export default function LayersPanel() {
  const { layers, toggleLayer, setAllLayers, settings, updateSettings, events } = useGlobalStore();
  const [search, setSearch] = useState("");
  const [collapsed, setCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<'events' | 'assets'>('events');

  if (!settings.showLayersPanel) return null;

  const filtered = search
    ? layers.filter(l => l.label.toLowerCase().includes(search.toLowerCase()))
    : layers;

  const enabledCount = layers.filter(l => l.enabled).length;
  const allEnabled = enabledCount === layers.length;

  const countByCategory = (cat: string) =>
    events.filter(e => e.category === cat).length;

  const toggleAssetFilter = (filterId: string) => {
    const newFilters = { ...settings.assetFilters, [filterId]: !settings.assetFilters[filterId] };
    updateSettings({ assetFilters: newFilters });
  };

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
    <div className="absolute left-3 top-[76px] z-30 w-60 glass rounded-xl pointer-events-auto animate-fade-in flex flex-col max-h-[calc(100vh-200px)]">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-white/5">
        <div className="flex items-center gap-2">
          <Layers className="w-3.5 h-3.5 text-pink-400" />
          <span className="text-[11px] font-bold text-white tracking-wider">LAYERS</span>
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

      {/* Tab Switcher */}
      <div className="flex border-b border-white/5">
        <button
          onClick={() => setActiveTab('events')}
          className={`flex-1 text-[9px] font-bold tracking-widest py-2 transition-all ${
            activeTab === 'events' ? 'text-pink-400 border-b-2 border-pink-400' : 'text-white/30 hover:text-white/50'
          }`}
        >
          EVENTS
        </button>
        <button
          onClick={() => setActiveTab('assets')}
          className={`flex-1 text-[9px] font-bold tracking-widest py-2 transition-all ${
            activeTab === 'assets' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-white/30 hover:text-white/50'
          }`}
        >
          ASSETS
        </button>
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

      {/* Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar py-1">
        {activeTab === 'events' ? (
          /* Event Layers */
          filtered.map((layer) => (
            <LayerRow
              key={layer.id}
              layer={layer}
              count={countByCategory(layer.category)}
              onToggle={() => toggleLayer(layer.id)}
            />
          ))
        ) : (
          /* Asset Filters */
          <>
            {/* Master toggles */}
            <div className="px-3 py-2 space-y-1.5 border-b border-white/5">
              <MasterToggle
                label="SATELLITES"
                icon={<Satellite className="w-3 h-3" />}
                color="#22d3ee"
                enabled={settings.showSatellites}
                onToggle={() => updateSettings({ showSatellites: !settings.showSatellites })}
              />
              <MasterToggle
                label="AIRCRAFT"
                icon={<Plane className="w-3 h-3" />}
                color="#f59e0b"
                enabled={settings.showPlanes}
                onToggle={() => updateSettings({ showPlanes: !settings.showPlanes })}
              />
              <MasterToggle
                label="MARITIME"
                icon={<Ship className="w-3 h-3" />}
                color="#3b82f6"
                enabled={settings.showShips}
                onToggle={() => updateSettings({ showShips: !settings.showShips })}
              />
            </div>

            {/* Satellite sub-filters */}
            {settings.showSatellites && (
              <div className="px-2 py-1">
                <div className="text-[8px] font-bold text-white/20 tracking-widest px-1 py-1">SATELLITE TYPES</div>
                {ASSET_FILTERS.filter(f => f.group === 'satellites').map(f => (
                  <AssetFilterRow key={f.id} filter={f} enabled={settings.assetFilters[f.id] ?? true} onToggle={() => toggleAssetFilter(f.id)} />
                ))}
              </div>
            )}

            {/* Aircraft sub-filters */}
            {settings.showPlanes && (
              <div className="px-2 py-1">
                <div className="text-[8px] font-bold text-white/20 tracking-widest px-1 py-1">AIRCRAFT TYPES</div>
                {ASSET_FILTERS.filter(f => f.group === 'aircraft').map(f => (
                  <AssetFilterRow key={f.id} filter={f} enabled={settings.assetFilters[f.id] ?? true} onToggle={() => toggleAssetFilter(f.id)} />
                ))}
              </div>
            )}

            {/* Maritime sub-filters */}
            {settings.showShips && (
              <div className="px-2 py-1">
                <div className="text-[8px] font-bold text-white/20 tracking-widest px-1 py-1">MARITIME TYPES</div>
                {ASSET_FILTERS.filter(f => f.group === 'maritime').map(f => (
                  <AssetFilterRow key={f.id} filter={f} enabled={settings.assetFilters[f.id] ?? true} onToggle={() => toggleAssetFilter(f.id)} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function MasterToggle({ label, icon, color, enabled, onToggle }: { label: string; icon: React.ReactNode; color: string; enabled: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg transition-all ${
        enabled ? 'bg-white/5 hover:bg-white/8' : 'opacity-40 hover:opacity-60'
      }`}
    >
      <div
        className="w-5 h-5 rounded flex items-center justify-center"
        style={{ backgroundColor: enabled ? color + '25' : 'transparent', border: `1px solid ${enabled ? color + '50' : 'rgba(255,255,255,0.15)'}` }}
      >
        <span style={{ color: enabled ? color : 'rgba(255,255,255,0.3)' }}>{icon}</span>
      </div>
      <span className={`text-[10px] font-bold tracking-widest flex-1 text-left ${enabled ? 'text-white/80' : 'text-white/30'}`}>
        {label}
      </span>
      <div className={`w-6 h-3 rounded-full transition-all ${enabled ? 'bg-white/20' : 'bg-white/5'}`}>
        <div className={`w-3 h-3 rounded-full transition-all ${enabled ? 'translate-x-3' : 'translate-x-0'}`} style={{ backgroundColor: enabled ? color : 'rgba(255,255,255,0.2)' }} />
      </div>
    </button>
  );
}

function AssetFilterRow({ filter, enabled, onToggle }: { filter: AssetFilterItem; enabled: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={`w-full flex items-center gap-2 px-2 py-1 rounded transition-all ${
        enabled ? 'hover:bg-white/5' : 'opacity-30 hover:opacity-50'
      }`}
    >
      <div
        className="w-3.5 h-3.5 rounded flex items-center justify-center"
        style={{ backgroundColor: enabled ? filter.color + '20' : 'transparent', border: `1px solid ${enabled ? filter.color + '40' : 'transparent'}` }}
      >
        {enabled && (
          <svg className="w-2 h-2" viewBox="0 0 12 12" fill="none">
            <path d="M2 6L5 9L10 3" stroke={filter.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
      <span style={{ color: enabled ? filter.color : 'rgba(255,255,255,0.3)' }}>{filter.icon}</span>
      <span className={`text-[9px] font-semibold tracking-wide flex-1 text-left ${enabled ? 'text-white/70' : 'text-white/30'}`}>
        {filter.label}
      </span>
    </button>
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
      <div
        className={`w-4 h-4 rounded flex items-center justify-center border transition-all flex-shrink-0 ${
          layer.enabled ? 'border-transparent' : 'border-white/20'
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
      <span style={{ color: layer.enabled ? layer.color : 'rgba(255,255,255,0.3)' }}>
        {ICON_MAP[layer.icon] || <Layers className="w-3.5 h-3.5" />}
      </span>
      <span className={`text-[10px] font-semibold tracking-wide flex-1 ${
        layer.enabled ? 'text-white/80' : 'text-white/30'
      }`}>
        {layer.label.toUpperCase()}
      </span>
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
