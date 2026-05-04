import { create } from 'zustand';
import {
  GlobalEvent,
  NewsArticle,
  MarketTicker,
  UserSettings,
  LayerConfig,
  DEFAULT_SETTINGS,
  DEFAULT_LAYERS,
  ViewMode,
  EventCategory,
} from '../types/global';

// ─── Persistence Helpers ────────────────────────────────────
function loadSettings(): UserSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem('truearth_settings');
    if (raw) return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch { /* ignore parse errors */ }
  return DEFAULT_SETTINGS;
}

function saveSettings(settings: UserSettings) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('truearth_settings', JSON.stringify(settings));
  } catch { /* ignore quota errors */ }
}

function loadLayers(): LayerConfig[] {
  if (typeof window === 'undefined') return DEFAULT_LAYERS;
  try {
    const raw = localStorage.getItem('truearth_layers');
    if (raw) {
      const saved = JSON.parse(raw) as Record<string, boolean>;
      return DEFAULT_LAYERS.map(l => ({ ...l, enabled: saved[l.id] ?? l.enabled }));
    }
  } catch { /* ignore */ }
  return DEFAULT_LAYERS;
}

function saveLayers(layers: LayerConfig[]) {
  if (typeof window === 'undefined') return;
  try {
    const map: Record<string, boolean> = {};
    layers.forEach(l => { map[l.id] = l.enabled; });
    localStorage.setItem('truearth_layers', JSON.stringify(map));
  } catch { /* ignore */ }
}

// ─── Store Interface ────────────────────────────────────────
interface GlobalState {
  // Data
  events: GlobalEvent[];
  newsArticles: NewsArticle[];
  marketData: MarketTicker[];

  // UI State
  settings: UserSettings;
  layers: LayerConfig[];
  settingsOpen: boolean;
  selectedEventId: string | null;
  selectedAsset: { id: string; name: string; type: string; category: string; location: string; status: string } | null;

  // Actions — Data
  fetchEvents: () => Promise<void>;
  fetchNews: () => Promise<void>;
  fetchMarkets: () => Promise<void>;
  startLiveNewsStream: () => void;

  // Actions — UI
  setViewMode: (mode: ViewMode) => void;
  toggleLayer: (layerId: string) => void;
  setAllLayers: (enabled: boolean) => void;
  updateSettings: (partial: Partial<UserSettings>) => void;
  setSettingsOpen: (open: boolean) => void;
  setSelectedEvent: (id: string | null) => void;
  setSelectedAsset: (asset: any | null) => void;

  // Actions — Events
  updateEvent: (id: string, updates: Partial<GlobalEvent>) => void;
}

// ─── Store ──────────────────────────────────────────────────
export const useGlobalStore = create<GlobalState>((set, get) => ({
  // ── Initial State ──
  events: [],
  newsArticles: [],
  marketData: [],
  settings: loadSettings(),
  layers: loadLayers(),
  settingsOpen: false,
  selectedEventId: null,
  selectedAsset: null,

  // ── Data Fetchers ──
  fetchEvents: async () => {
    try {
      const res = await fetch('/api/events/fetch');
      if (res.ok) {
        const data = await res.json();
        set({ events: data });
      }
    } catch (err) {
      console.error('[TRUEARTH] Failed to fetch events:', err);
    }
  },

  fetchNews: async () => {
    try {
      const res = await fetch('/api/news/fetch');
      if (res.ok) {
        const data = await res.json();
        set({ newsArticles: data });
      }
    } catch (err) {
      console.error('[TRUEARTH] Failed to fetch news:', err);
    }
  },

  startLiveNewsStream: () => {
    // Poll for real news updates every 60 seconds
    const pollNews = async () => {
      try {
        const res = await fetch('/api/news/fetch');
        if (res.ok) {
          const data = await res.json();
          set((state) => {
            const existingIds = new Set(state.newsArticles.map(a => a.id));
            const newArticles = data.filter((a: NewsArticle) => !existingIds.has(a.id));
            if (newArticles.length > 0) {
              return { newsArticles: [...newArticles, ...state.newsArticles].slice(0, 100) };
            }
            return state;
          });
        }
      } catch (err) {
        console.error('[TRUEARTH] Live news poll failed:', err);
      }
      setTimeout(pollNews, 60000);
    };

    // Start the loop
    setTimeout(pollNews, 60000);
  },

  fetchMarkets: async () => {
    try {
      const res = await fetch('/api/markets/fetch');
      if (res.ok) {
        const data = await res.json();
        set({ marketData: data });
      }
    } catch (err) {
      console.error('[TRUEARTH] Failed to fetch markets:', err);
    }
  },

  // ── View Mode ──
  setViewMode: (mode) => {
    const settings = { ...get().settings, viewMode: mode };
    saveSettings(settings);
    set({ settings });
  },

  // ── Layers ──
  toggleLayer: (layerId) => {
    const layers = get().layers.map(l =>
      l.id === layerId ? { ...l, enabled: !l.enabled } : l
    );
    saveLayers(layers);
    set({ layers });
  },

  setAllLayers: (enabled) => {
    const layers = get().layers.map(l => ({ ...l, enabled }));
    saveLayers(layers);
    set({ layers });
  },

  // ── Settings ──
  updateSettings: (partial) => {
    const settings = { ...get().settings, ...partial };
    saveSettings(settings);
    set({ settings });
  },

  setSettingsOpen: (open) => set({ settingsOpen: open }),

  setSelectedEvent: (id) => set({ selectedEventId: id }),

  // ── Event Updates ──
  updateEvent: (id, updates) => set((state) => ({
    events: state.events.map((e) => (e.id === id ? { ...e, ...updates } : e)),
  })),
}));
