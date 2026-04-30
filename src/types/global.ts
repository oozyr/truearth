// ─── View ────────────────────────────────────────────────────
export type ViewMode = '2d' | '3d';

// ─── Categories & Severity ──────────────────────────────────
export type EventCategory =
  | 'conflict'
  | 'market'
  | 'resources'
  | 'natural_disaster'
  | 'cyber'
  | 'political'
  | 'humanitarian';

export type SeverityLevel = 'critical' | 'high' | 'elevated' | 'moderate' | 'low';

// Legacy alias (backward compat)
export type ModeTag = 'market' | 'war' | 'resources';

// ─── Layer System ───────────────────────────────────────────
export interface LayerConfig {
  id: string;
  label: string;
  icon: string;
  color: string;
  enabled: boolean;
  category: EventCategory;
}

// ─── Market Data ────────────────────────────────────────────
export interface MarketTicker {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  changePercent: number;
  type: 'stock' | 'crypto' | 'commodity' | 'index';
  url: string;
}

// ─── News ───────────────────────────────────────────────────
export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  source: string;
  sourceUrl: string;
  publishedAt: string;
  category: EventCategory;
  region: string;
  imageUrl?: string;
}

// ─── Coordinates ────────────────────────────────────────────
export interface Coordinates {
  lat: number;
  lon: number;
}

// ─── Market Impact ──────────────────────────────────────────
export interface MarketImpact {
  ticker: string;
  changePercent: number;
  correlation: 'high' | 'medium' | 'low';
}

// ─── Global Event ───────────────────────────────────────────
export interface GlobalEvent {
  id: string;
  coordinates: Coordinates;
  category: EventCategory;
  severity: SeverityLevel;
  title: string;
  summary: string;
  truthScore: number;
  truthAnalysis?: string;
  marketImpact: MarketImpact;
  sources: string[];
  timestamp: string;
  // Legacy compat
  modeTag?: ModeTag;
}

// ─── User Settings ──────────────────────────────────────────
export interface UserSettings {
  viewMode: ViewMode;
  autoRotate: boolean;
  autoRotateSpeed: number;
  showAtmosphere: boolean;
  showSatellites: boolean;
  showMarketTicker: boolean;
  showNewsFeed: boolean;
  showLayersPanel: boolean;
  newsSourceFilter: string[];
  theme: 'midnight' | 'dark' | 'terminal';
}

export const DEFAULT_SETTINGS: UserSettings = {
  viewMode: '3d',
  autoRotate: true,
  autoRotateSpeed: 0.4,
  showAtmosphere: true,
  showSatellites: true,
  showMarketTicker: true,
  showNewsFeed: true,
  showLayersPanel: true,
  newsSourceFilter: [],
  theme: 'midnight',
};

// ─── Default Layers ─────────────────────────────────────────
export const DEFAULT_LAYERS: LayerConfig[] = [
  { id: 'conflict',          label: 'Conflict Zones',      icon: 'Swords',      color: '#ef4444', enabled: true,  category: 'conflict' },
  { id: 'market',            label: 'Market Hotspots',     icon: 'TrendingUp',  color: '#22d3ee', enabled: true,  category: 'market' },
  { id: 'resources',         label: 'Resource Sites',      icon: 'Pickaxe',     color: '#34d399', enabled: true,  category: 'resources' },
  { id: 'natural_disaster',  label: 'Natural Disasters',   icon: 'CloudRain',   color: '#f59e0b', enabled: true,  category: 'natural_disaster' },
  { id: 'cyber',             label: 'Cyber Threats',       icon: 'Shield',      color: '#a855f7', enabled: false, category: 'cyber' },
  { id: 'political',         label: 'Political Events',    icon: 'Landmark',    color: '#3b82f6', enabled: true,  category: 'political' },
  { id: 'humanitarian',      label: 'Humanitarian Crises', icon: 'HeartPulse',  color: '#ec4899', enabled: false, category: 'humanitarian' },
];
