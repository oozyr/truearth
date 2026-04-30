"use client";

import { useGlobalStore } from "@/store/useGlobalStore";
import { RSS_SOURCES } from "@/lib/rss-sources";
import {
  X, RotateCcw, Globe2, Satellite, Wind, TrendingUp,
  Newspaper, Layers, Monitor, Palette,
} from "lucide-react";
import { DEFAULT_SETTINGS } from "@/types/global";

export default function SettingsPanel() {
  const { settings, updateSettings, settingsOpen, setSettingsOpen } = useGlobalStore();

  if (!settingsOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-auto">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => setSettingsOpen(false)}
      />

      {/* Panel */}
      <div className="relative glass-strong rounded-2xl w-[420px] max-h-[80vh] overflow-hidden animate-slide-up shadow-2xl pink-glow">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
          <div className="flex items-center gap-2">
            <Monitor className="w-4 h-4 text-pink-400" />
            <h2 className="text-sm font-bold text-white tracking-wider">SETTINGS</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => updateSettings(DEFAULT_SETTINGS)}
              className="text-[10px] text-white/30 hover:text-white/60 transition-colors flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              Reset
            </button>
            <button
              onClick={() => setSettingsOpen(false)}
              className="p-1 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto custom-scrollbar max-h-[calc(80vh-60px)]">
          {/* ── View Section ── */}
          <SettingsSection title="View" icon={<Globe2 className="w-3.5 h-3.5" />}>
            <ToggleRow
              label="Auto Rotate (3D)"
              enabled={settings.autoRotate}
              onChange={() => updateSettings({ autoRotate: !settings.autoRotate })}
            />
            <ToggleRow
              label="Show Atmosphere"
              enabled={settings.showAtmosphere}
              onChange={() => updateSettings({ showAtmosphere: !settings.showAtmosphere })}
            />
            <ToggleRow
              label="Show Satellites"
              icon={<Satellite className="w-3 h-3 text-indigo-400" />}
              enabled={settings.showSatellites}
              onChange={() => updateSettings({ showSatellites: !settings.showSatellites })}
            />
          </SettingsSection>

          {/* ── Data Section ── */}
          <SettingsSection title="Data Panels" icon={<TrendingUp className="w-3.5 h-3.5" />}>
            <ToggleRow
              label="Market Ticker"
              icon={<TrendingUp className="w-3 h-3 text-emerald-400" />}
              enabled={settings.showMarketTicker}
              onChange={() => updateSettings({ showMarketTicker: !settings.showMarketTicker })}
            />
            <ToggleRow
              label="News Feed"
              icon={<Newspaper className="w-3 h-3 text-cyan-400" />}
              enabled={settings.showNewsFeed}
              onChange={() => updateSettings({ showNewsFeed: !settings.showNewsFeed })}
            />
            <ToggleRow
              label="Layers Panel"
              icon={<Layers className="w-3 h-3 text-pink-400" />}
              enabled={settings.showLayersPanel}
              onChange={() => updateSettings({ showLayersPanel: !settings.showLayersPanel })}
            />
          </SettingsSection>

          {/* ── News Sources ── */}
          <SettingsSection title="News Sources" icon={<Newspaper className="w-3.5 h-3.5" />}>
            <p className="text-[10px] text-white/30 mb-3 px-1">
              Select which sources appear in the news feed. All enabled by default.
            </p>
            <div className="space-y-1">
              {RSS_SOURCES.map(src => {
                const isFiltered = settings.newsSourceFilter.includes(src.id);
                return (
                  <button
                    key={src.id}
                    onClick={() => {
                      const current = settings.newsSourceFilter;
                      const updated = isFiltered
                        ? current.filter(id => id !== src.id)
                        : [...current, src.id];
                      updateSettings({ newsSourceFilter: updated });
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all ${
                      !isFiltered ? 'hover:bg-white/5' : 'opacity-40 hover:opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: !isFiltered ? src.color : 'rgba(255,255,255,0.2)' }}
                      />
                      <span className="text-[11px] font-semibold text-white/80">{src.name}</span>
                      <span className="text-[9px] text-white/30 font-mono">{src.region}</span>
                    </div>
                    <span className="text-[8px] font-bold tracking-wider text-white/20 uppercase">
                      {src.bias}
                    </span>
                  </button>
                );
              })}
            </div>
          </SettingsSection>

          {/* ── Theme Section ── */}
          <SettingsSection title="Theme" icon={<Palette className="w-3.5 h-3.5" />}>
            <div className="flex gap-2">
              {(['midnight', 'dark', 'terminal'] as const).map(theme => (
                <button
                  key={theme}
                  onClick={() => updateSettings({ theme })}
                  className={`flex-1 px-3 py-2.5 rounded-lg border text-[10px] font-bold tracking-wider uppercase transition-all ${
                    settings.theme === theme
                      ? 'border-pink-500/40 bg-pink-500/10 text-pink-300'
                      : 'border-white/10 text-white/40 hover:border-white/20 hover:text-white/60'
                  }`}
                >
                  {theme}
                </button>
              ))}
            </div>
          </SettingsSection>

          <div className="px-5 py-4">
            <p className="text-[9px] text-white/15 text-center font-mono">
              TRUEARTH v2.0 — Settings persist locally
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function SettingsSection({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="px-5 py-4 border-b border-white/5">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-pink-400/70">{icon}</span>
        <h3 className="text-[10px] font-bold text-white/50 tracking-[0.15em] uppercase">{title}</h3>
      </div>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function ToggleRow({
  label,
  icon,
  enabled,
  onChange,
}: {
  label: string;
  icon?: React.ReactNode;
  enabled: boolean;
  onChange: () => void;
}) {
  return (
    <button
      onClick={onChange}
      className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/5 transition-all"
    >
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-[11px] text-white/70">{label}</span>
      </div>
      {/* Toggle Switch */}
      <div
        className={`w-8 h-4 rounded-full relative transition-all ${
          enabled ? 'bg-pink-500/40' : 'bg-white/10'
        }`}
      >
        <div
          className={`absolute top-0.5 w-3 h-3 rounded-full transition-all ${
            enabled ? 'left-4.5 bg-pink-400' : 'left-0.5 bg-white/30'
          }`}
        />
      </div>
    </button>
  );
}
