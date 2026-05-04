"use client";

import { useEffect, useState, useMemo } from "react";
import { useGlobalStore } from "@/store/useGlobalStore";
import { RSS_SOURCES } from "@/lib/rss-sources";
import {
  Newspaper, ExternalLink, ChevronDown, ChevronUp,
  AlertCircle, Radio,
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

export default function NewsFeed() {
  const { newsArticles, fetchNews, startLiveNewsStream, settings } = useGlobalStore();
  const [activeSource, setActiveSource] = useState("ALL");
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    fetchNews().then(() => {
      // Start the live stream simulator after the initial fetch
      startLiveNewsStream();
    });
    // We don't need the 5-min interval anymore since the live stream handles updates
  }, [fetchNews, startLiveNewsStream]);

  if (!settings.showNewsFeed) return null;

  const sources = useMemo(() => {
    const unique = new Set(newsArticles.map(a => a.source));
    return ['ALL', ...Array.from(unique)];
  }, [newsArticles]);

  const filtered = useMemo(() => {
    if (activeSource === 'ALL') return newsArticles;
    return newsArticles.filter(a => a.source === activeSource);
  }, [newsArticles, activeSource]);

  return (
    <div className="absolute bottom-0 left-0 right-0 z-40 pointer-events-auto">
      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -top-7 left-4 glass rounded-t-lg px-3 py-1 flex items-center gap-2 hover:bg-white/10 transition-all"
      >
        <Radio className="w-3 h-3 text-pink-400 animate-pulse" />
        <span className="text-[10px] font-bold text-white/70 tracking-wider">LIVE NEWS</span>
        <span className="text-[10px] font-mono text-pink-400">• {newsArticles.length}</span>
        {collapsed ? (
          <ChevronUp className="w-3 h-3 text-white/40" />
        ) : (
          <ChevronDown className="w-3 h-3 text-white/40" />
        )}
      </button>

      {!collapsed && (
        <div className="glass-strong border-t border-white/5 animate-slide-up">
          {/* Source Tabs */}
          <div className="flex items-center gap-1 px-4 py-1.5 border-b border-white/5 overflow-x-auto custom-scrollbar">
            {sources.map(src => {
              const srcConfig = RSS_SOURCES.find(r => r.name === src);
              return (
                <button
                  key={src}
                  onClick={() => setActiveSource(src)}
                  className={`flex-shrink-0 px-2.5 py-1 rounded text-[10px] font-bold tracking-wider transition-all ${
                    activeSource === src
                      ? 'bg-pink-500/20 text-pink-300 border border-pink-500/30'
                      : 'text-white/40 hover:text-white/60 hover:bg-white/5 border border-transparent'
                  }`}
                  style={activeSource === src && srcConfig ? { 
                    backgroundColor: srcConfig.color + '20', 
                    color: srcConfig.color,
                    borderColor: srcConfig.color + '40',
                  } : undefined}
                >
                  {src.toUpperCase()}
                </button>
              );
            })}
          </div>

          {/* Articles */}
          <div className="flex gap-2 px-4 py-2.5 overflow-x-auto custom-scrollbar">
            {filtered.length === 0 ? (
              <div className="flex items-center gap-2 text-white/30 text-xs py-4 px-2">
                <AlertCircle className="w-4 h-4" />
                <span>Loading intelligence feed...</span>
              </div>
            ) : (
              filtered.slice(0, 20).map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ArticleCard({ article }: { article: NewsArticle }) {
  const catColor = CATEGORY_COLORS[article.category] || '#6366f1';

  return (
    <a
      href={article.sourceUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="flex-shrink-0 w-72 glass rounded-lg p-3 hover:bg-white/8 transition-all group cursor-pointer border border-transparent hover:border-white/10"
    >
      {/* Top row */}
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <span
            className="text-[8px] font-bold px-1.5 py-0.5 rounded tracking-wider"
            style={{ backgroundColor: catColor + '20', color: catColor }}
          >
            {article.category.toUpperCase().replace('_', ' ')}
          </span>
          <span className="text-[9px] text-white/30 font-mono">{article.region}</span>
        </div>
        <ExternalLink className="w-3 h-3 text-white/0 group-hover:text-pink-400 transition-all" />
      </div>

      {/* Title */}
      <h3 className="text-[11px] font-bold text-white/90 leading-snug mb-1.5 line-clamp-2 group-hover:text-white transition-colors">
        {article.title}
      </h3>

      {/* Summary */}
      <p className="text-[10px] text-white/40 leading-relaxed line-clamp-2 mb-2">
        {article.summary}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <span className="text-[9px] font-bold text-white/50 tracking-wider">
          {article.source.toUpperCase()}
        </span>
        <span className="text-[9px] font-mono text-white/30">
          {timeAgo(article.publishedAt)}
        </span>
      </div>
    </a>
  );
}
