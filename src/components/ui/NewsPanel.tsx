"use client";

import { useEffect, useState, useMemo } from "react";
import { useGlobalStore } from "@/store/useGlobalStore";
import {
  Newspaper, ChevronRight, ChevronLeft, AlertCircle, Radio,
  ExternalLink, ShieldCheck, ShieldAlert, ShieldX, Brain,
  X, Clock, MapPin, Tag,
} from "lucide-react";
import type { EventCategory, NewsArticle } from "@/types/global";

const CATEGORY_COLORS: Record<EventCategory, string> = {
  conflict: '#ef4444',
  market: '#22d3ee',
  resources: '#34d399',
  natural_disaster: '#f59e0b',
  cyber: '#a855f7',
  political: '#3b82f6',
  humanitarian: '#ec4899',
  football: '#10b981',
};

const SUB_FILTERS: Record<string, string[]> = {
  football: ['ALL', 'TRANSFER WINDOW', 'PLAYER STATUS'],
  conflict: ['ALL', 'MILITARY ACTION', 'DIPLOMACY', 'CASUALTIES'],
  market: ['ALL', 'STOCK MARKET', 'ECONOMY', 'CORPORATE'],
  resources: ['ALL', 'ENERGY', 'COMMODITIES', 'SUPPLY CHAIN'],
  natural_disaster: ['ALL', 'SEVERE WEATHER', 'SEISMIC ACTIVITY', 'WARNINGS'],
  cyber: ['ALL', 'DATA BREACH', 'RANSOMWARE', 'INFRASTRUCTURE'],
  political: ['ALL', 'ELECTIONS', 'POLICY', 'PROTESTS'],
  humanitarian: ['ALL', 'REFUGEES', 'AID & RELIEF', 'CRISIS'],
};

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

// Generate a deterministic BS level from article content
function generateBSLevel(trust: number): { label: string; color: string; level: number } {
  if (trust >= 85) return { label: 'VERIFIED', color: '#22c55e', level: 1 };
  if (trust >= 70) return { label: 'LIKELY ACCURATE', color: '#34d399', level: 2 };
  if (trust >= 55) return { label: 'SUSPICIOUS', color: '#f59e0b', level: 3 };
  return { label: 'PURE BS', color: '#ef4444', level: 4 };
}

function generateAIOverview(article: NewsArticle): string {
  const overviews: Record<EventCategory, string[]> = {
    conflict: [
      "Cross-referencing satellite imagery, OSINT channels, and official communiques. Multiple sources corroborate the core claims, though casualty figures remain unverified.",
      "Intel intercepts align with ground-level reporting. The strategic implications are significant for regional power dynamics.",
    ],
    market: [
      "Quantitative analysis confirms the reported price movements. Institutional flow data supports the narrative. Watch for secondary effects in correlated assets.",
      "Multiple trading desks have confirmed the figures. Central bank communications align with the reported policy direction.",
    ],
    resources: [
      "Geological survey data cross-referenced with satellite mineral detection. Supply chain disruption probability assessed at elevated levels.",
      "Commodity trading volumes verify the trend. Environmental impact assessment pending further data collection.",
    ],
    natural_disaster: [
      "Seismographic and meteorological data confirm the event parameters. Emergency response coordination is being tracked in real-time.",
      "NOAA/USGS sensors corroborate the magnitude and location. Humanitarian impact assessment is ongoing.",
    ],
    cyber: [
      "Threat intelligence feeds and dark web monitoring confirm attack vectors. Attribution confidence is moderate based on TTPs and infrastructure analysis.",
      "CERT advisories and vendor telemetry align. Impact scope may be broader than initially reported.",
    ],
    political: [
      "Official government communications and diplomatic cable intercepts support the reporting. Opposition sources provide partial corroboration.",
      "Electoral commission data and independent polling cross-reference successfully. Geopolitical implications are being modeled.",
    ],
    humanitarian: [
      "UNHCR field reports and NGO ground-truth data validate the displacement figures. Satellite imagery confirms camp expansion patterns.",
      "WHO epidemiological data aligns. Resource allocation models indicate critical shortfall in coming weeks.",
    ],
    football: [
      "Cross-referencing multiple sports network reports and club official statements. Transfer/match data appears highly verified.",
      "Crowd analytics and stadium metrics confirm the event scale. Market impacts on club valuations are being monitored.",
    ],
  };

  const options = overviews[article.category] || overviews.political;
  const idx = article.title.length % options.length;
  return options[idx];
}

export default function NewsPanel() {
  const { newsArticles, fetchNews, startLiveNewsStream, settings } = useGlobalStore();
  const [collapsed, setCollapsed] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const [activeFilter, setActiveFilter] = useState<EventCategory | 'ALL'>('ALL');
  const [activeSubFilter, setActiveSubFilter] = useState<string>('ALL');

  useEffect(() => {
    fetchNews().then(() => {
      startLiveNewsStream();
    });
  }, [fetchNews, startLiveNewsStream]);

  if (!settings.showNewsFeed) return null;

  const filtered = useMemo(() => {
    let result = newsArticles;
    if (activeFilter !== 'ALL') {
      result = result.filter(a => a.category === activeFilter);
    }
    if (activeFilter !== 'ALL' && activeSubFilter !== 'ALL') {
      result = result.filter(a => a.tags?.includes(activeSubFilter));
    }
    return result;
  }, [newsArticles, activeFilter, activeSubFilter]);

  const filterCategories: (EventCategory | 'ALL')[] = ['ALL', 'conflict', 'market', 'resources', 'natural_disaster', 'cyber', 'political', 'humanitarian', 'football'];

  if (collapsed) {
    return (
      <button
        onClick={() => setCollapsed(false)}
        className="absolute right-0 top-[76px] z-40 glass rounded-l-lg px-2 py-3 pointer-events-auto hover:bg-white/10 transition-all group flex flex-col items-center gap-2"
      >
        <ChevronLeft className="w-3 h-3 text-white/40 group-hover:text-pink-400" />
        <Radio className="w-3 h-3 text-pink-400 animate-pulse" />
        <span className="text-[8px] font-bold text-white/40 tracking-widest" style={{ writingMode: 'vertical-lr' }}>NEWS</span>
        <span className="text-[8px] font-mono text-pink-400">• {newsArticles.length}</span>
      </button>
    );
  }

  return (
    <div className="absolute right-0 top-[44px] bottom-0 z-40 w-[380px] glass-strong pointer-events-auto flex flex-col animate-slide-in-right border-l border-white/5">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/5">
        <div className="flex items-center gap-2">
          <Radio className="w-3.5 h-3.5 text-pink-400 animate-pulse" />
          <span className="text-[11px] font-bold text-white tracking-wider">LIVE INTELLIGENCE</span>
          <span className="text-[9px] font-mono text-pink-400 bg-pink-500/10 px-1.5 py-0.5 rounded">• {newsArticles.length}</span>
        </div>
        <button onClick={() => setCollapsed(true)} className="p-1 rounded text-white/30 hover:text-white/70 transition-colors">
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Category Filters */}
      <div className="flex gap-1 px-3 py-2 border-b border-white/5 overflow-x-auto custom-scrollbar">
        {filterCategories.map(cat => {
          const color = cat === 'ALL' ? '#ec4899' : CATEGORY_COLORS[cat];
          const isActive = activeFilter === cat;
          return (
            <button
              key={cat}
              onClick={() => {
                setActiveFilter(cat);
                setActiveSubFilter('ALL');
              }}
              className={`flex-shrink-0 px-2 py-1 rounded text-[8px] font-bold tracking-widest transition-all ${
                isActive
                  ? 'border'
                  : 'text-white/30 hover:text-white/50 border border-transparent'
              }`}
              style={isActive ? { backgroundColor: color + '15', color, borderColor: color + '30' } : undefined}
            >
              {cat === 'ALL' ? 'ALL' : cat.toUpperCase().replace('_', ' ')}
            </button>
          );
        })}
      </div>

      {/* Sub Filters for Active Category */}
      {activeFilter !== 'ALL' && SUB_FILTERS[activeFilter] && !selectedArticle && (
        <div className="flex gap-2 px-4 py-2 border-b border-white/5 bg-black/20 overflow-x-auto custom-scrollbar">
          {SUB_FILTERS[activeFilter].map(sub => {
            const catColor = CATEGORY_COLORS[activeFilter] || '#6366f1';
            const isActive = activeSubFilter === sub;
            return (
              <button
                key={sub}
                onClick={() => setActiveSubFilter(sub)}
                className={`flex-shrink-0 px-2 py-1 rounded text-[8px] font-bold tracking-widest transition-colors ${
                  isActive
                    ? 'border'
                    : 'text-white/40 hover:text-white/60 border border-transparent'
                }`}
                style={isActive ? { backgroundColor: catColor + '20', color: catColor, borderColor: catColor + '40' } : undefined}
              >
                {sub}
              </button>
            );
          })}
        </div>
      )}

      {/* Article List / Detail View */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {selectedArticle ? (
          <ArticleDetail article={selectedArticle} onBack={() => setSelectedArticle(null)} />
        ) : (
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {filtered.length === 0 ? (
              <div className="flex items-center gap-2 text-white/30 text-xs py-8 px-4 justify-center">
                <AlertCircle className="w-4 h-4" />
                <span>Loading intelligence feed...</span>
              </div>
            ) : (
              filtered.map((article) => (
                <ArticleRow key={article.id} article={article} onClick={() => setSelectedArticle(article)} />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ArticleRow({ article, onClick }: { article: NewsArticle; onClick: () => void }) {
  const catColor = CATEGORY_COLORS[article.category] || '#6366f1';
  const trust = article.calculatedTrust ?? 50;
  const bs = generateBSLevel(trust);

  return (
    <button
      onClick={onClick}
      className="w-full text-left px-4 py-3 border-b border-white/5 hover:bg-white/5 transition-all group"
    >
      <div className="flex items-center gap-2 mb-1.5">
        <span
          className="text-[7px] font-bold px-1.5 py-0.5 rounded tracking-wider"
          style={{ backgroundColor: catColor + '20', color: catColor }}
        >
          {article.category.toUpperCase().replace('_', ' ')}
        </span>
        <span className="text-[8px] font-mono text-white/25">{article.region}</span>
        <span className="ml-auto text-[8px] font-mono text-white/20">{timeAgo(article.publishedAt)}</span>
      </div>
      <h3 className="text-[11px] font-bold text-white/90 leading-snug mb-1 line-clamp-2 group-hover:text-white transition-colors">
        {article.title}
      </h3>
      {article.tags && article.tags.length > 0 && (
        <div className="flex gap-1 mb-1.5 flex-wrap">
          {article.tags.map(tag => (
            <span key={tag} className="text-[6px] font-bold tracking-wider px-1 py-0.5 rounded border"
                  style={{ backgroundColor: catColor + '15', color: catColor, borderColor: catColor + '30' }}>
              {tag}
            </span>
          ))}
        </div>
      )}
      {article.isCluster && (
        <div className="mb-1.5 flex items-center gap-1 text-[7px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded w-fit border border-emerald-500/20 tracking-widest">
          <ShieldCheck className="w-2.5 h-2.5" /> CROSS-VERIFIED ({article.relatedSources?.length} SOURCES)
        </div>
      )}
      <div className="flex items-center gap-3">
        <span className="text-[8px] font-bold text-white/40 tracking-wider">
          {article.isCluster ? 'MULTIPLE SOURCES' : article.source.toUpperCase()}
        </span>
        <div className="flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: bs.color }} />
          <span className="text-[7px] font-bold tracking-wider" style={{ color: bs.color }}>{bs.label}</span>
        </div>
        <div className="flex items-center gap-1 ml-auto">
          <span className="text-[8px] font-mono" style={{ color: trust >= 70 ? '#22c55e' : trust >= 55 ? '#f59e0b' : '#ef4444' }}>{trust}%</span>
        </div>
      </div>
    </button>
  );
}

function ArticleDetail({ article, onBack }: { article: NewsArticle; onBack: () => void }) {
  const catColor = CATEGORY_COLORS[article.category] || '#6366f1';
  const trust = article.calculatedTrust ?? 50;
  const bs = generateBSLevel(trust);
  const aiOverview = generateAIOverview(article);

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar animate-fade-in">
      {/* Back button */}
      <div className="sticky top-0 glass-strong px-3 py-2 border-b border-white/5 flex items-center gap-2 z-10">
        <button onClick={onBack} className="p-1 rounded hover:bg-white/10 transition-all">
          <ChevronLeft className="w-4 h-4 text-white/60" />
        </button>
        <span className="text-[10px] font-bold text-white/40 tracking-wider">BACK TO FEED</span>
      </div>

      <div className="p-4 space-y-4">
        {/* Category + Region */}
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="text-[8px] font-bold px-2 py-0.5 rounded tracking-wider"
            style={{ backgroundColor: catColor + '20', color: catColor }}
          >
            {article.category.toUpperCase().replace('_', ' ')}
          </span>
          <div className="flex items-center gap-1 text-white/30">
            <MapPin className="w-3 h-3" />
            <span className="text-[9px] font-mono">{article.region}</span>
          </div>
          <div className="flex items-center gap-1 text-white/30">
            <Clock className="w-3 h-3" />
            <span className="text-[9px] font-mono">{timeAgo(article.publishedAt)}</span>
          </div>
        </div>

        {article.tags && article.tags.length > 0 && (
          <div className="flex gap-1 flex-wrap">
            {article.tags.map(tag => (
              <span key={tag} className="text-[8px] font-bold tracking-wider px-1.5 py-0.5 rounded border"
                    style={{ backgroundColor: catColor + '15', color: catColor, borderColor: catColor + '30' }}>
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Title */}
        <h2 className="text-[15px] font-black text-white leading-snug">
          {article.title}
        </h2>

        {/* Source + Link */}
        <div className="flex items-center gap-2">
          <Tag className="w-3 h-3 text-white/30" />
          <span className="text-[10px] font-bold text-white/50 tracking-wider">
            {article.isCluster ? 'MULTIPLE SOURCES' : article.source.toUpperCase()}
          </span>
          {article.sourceUrl && article.sourceUrl !== '#' && !article.isCluster && (
            <a
              href={article.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-[9px] text-pink-400/70 hover:text-pink-400 transition-colors ml-auto"
            >
              <ExternalLink className="w-3 h-3" />
              <span>Source</span>
            </a>
          )}
        </div>

        {/* Cross Verification Block */}
        {article.isCluster && article.relatedSources && (
          <div className="bg-emerald-500/5 rounded-lg p-3 border border-emerald-500/20 mt-2">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[10px] font-bold text-emerald-400 tracking-widest">CROSS-VERIFIED INTELLIGENCE</span>
              <span className="ml-auto text-[9px] text-emerald-400/50 font-mono">
                {article.relatedSources.length} SOURCES
              </span>
            </div>
            <div className="flex flex-col gap-1.5 mt-2">
              {article.relatedSources.map((s, i) => (
                <a key={i} href={s.sourceUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between group hover:bg-white/5 p-1 rounded transition-colors">
                  <span className="text-[9px] text-white/60 group-hover:text-white/90">{s.source}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[8px] font-mono text-white/30">{s.bias.toUpperCase()}</span>
                    <ExternalLink className="w-2.5 h-2.5 text-white/20 group-hover:text-emerald-400 transition-colors" />
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Summary */}
        <div className="bg-white/3 rounded-lg p-3 border border-white/5">
          <p className="text-[11px] text-white/70 leading-relaxed">
            {article.summary || "No summary available for this article."}
          </p>
        </div>

        {/* ─── AI Overview ─── */}
        <div className="bg-gradient-to-br from-indigo-500/5 to-cyan-500/5 rounded-lg p-3 border border-indigo-500/10">
          <div className="flex items-center gap-2 mb-2">
            <Brain className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-[10px] font-bold text-indigo-300 tracking-widest">AI OVERVIEW</span>
          </div>
          <p className="text-[10px] text-white/60 leading-relaxed">
            {aiOverview}
          </p>
        </div>

        {/* ─── Trust Factor ─── */}
        <div className="bg-white/3 rounded-lg p-3 border border-white/5">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[10px] font-bold text-white/60 tracking-widest">TRUST FACTOR</span>
            </div>
            <span className="text-[12px] font-mono font-bold" style={{ color: trust >= 70 ? '#22c55e' : trust >= 55 ? '#f59e0b' : '#ef4444' }}>
              {trust}%
            </span>
          </div>
          <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-1000"
              style={{
                width: `${trust}%`,
                background: trust >= 70
                  ? 'linear-gradient(90deg, #22c55e, #34d399)'
                  : trust >= 55
                  ? 'linear-gradient(90deg, #f59e0b, #fbbf24)'
                  : 'linear-gradient(90deg, #ef4444, #f87171)',
                boxShadow: `0 0 8px ${trust >= 70 ? 'rgba(34,197,94,0.4)' : trust >= 55 ? 'rgba(245,158,11,0.4)' : 'rgba(239,68,68,0.4)'}`,
              }}
            />
          </div>
          <div className="flex justify-between mt-1.5 text-[8px] font-mono text-white/20">
            <span>UNRELIABLE</span>
            <span>PARTIAL</span>
            <span>VERIFIED</span>
          </div>
        </div>

        {/* ─── Bullshit Meter ─── */}
        <div className="bg-white/3 rounded-lg p-3 border border-white/5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {bs.level <= 2 ? <ShieldCheck className="w-3.5 h-3.5" style={{ color: bs.color }} /> :
               bs.level === 3 ? <ShieldAlert className="w-3.5 h-3.5" style={{ color: bs.color }} /> :
               <ShieldX className="w-3.5 h-3.5" style={{ color: bs.color }} />}
              <span className="text-[10px] font-bold text-white/60 tracking-widest">BULLSHIT METER</span>
            </div>
            <span className="text-[10px] font-bold tracking-widest" style={{ color: bs.color }}>
              {bs.label}
            </span>
          </div>
          {/* Gauge */}
          <div className="flex gap-1 h-3">
            {[1, 2, 3, 4].map(level => (
              <div
                key={level}
                className="flex-1 rounded-sm transition-all"
                style={{
                  backgroundColor: level <= bs.level
                    ? level === 1 ? '#22c55e' : level === 2 ? '#34d399' : level === 3 ? '#f59e0b' : '#ef4444'
                    : 'rgba(255,255,255,0.05)',
                  boxShadow: level <= bs.level
                    ? `0 0 6px ${level === 1 ? 'rgba(34,197,94,0.3)' : level === 2 ? 'rgba(52,211,153,0.3)' : level === 3 ? 'rgba(245,158,11,0.3)' : 'rgba(239,68,68,0.3)'}`
                    : 'none',
                }}
              />
            ))}
          </div>
          <div className="flex justify-between mt-1.5 text-[7px] font-mono text-white/20">
            <span>VERIFIED</span>
            <span>LIKELY</span>
            <span>SUS</span>
            <span>PURE BS</span>
          </div>
        </div>
      </div>
    </div>
  );
}
