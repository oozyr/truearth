"use client";

import { useEffect } from "react";
import { useGlobalStore } from "@/store/useGlobalStore";
import dynamic from "next/dynamic";
import HeaderBar from "@/components/ui/HeaderBar";
import MarketTicker from "@/components/ui/MarketTicker";
import LayersPanel from "@/components/ui/LayersPanel";
import NewsFeed from "@/components/ui/NewsFeed";
import SettingsPanel from "@/components/ui/SettingsPanel";

const MapContainer = dynamic(() => import("@/components/MapContainer"), { ssr: false });

export default function Home() {
  const { fetchEvents, fetchNews, fetchMarkets } = useGlobalStore();

  useEffect(() => {
    fetchEvents();
    fetchNews();
    fetchMarkets();
  }, [fetchEvents, fetchNews, fetchMarkets]);

  return (
    <main className="relative w-full h-full min-h-screen bg-[#000511] overflow-hidden">
      {/* 3D/2D Map Background */}
      <MapContainer />

      {/* ── UI Overlay Stack ── */}

      {/* Header Bar (top) */}
      <HeaderBar />

      {/* Market Ticker (below header) */}
      <MarketTicker />

      {/* Layers Panel (left sidebar) */}
      <div className="absolute inset-0 pointer-events-none z-20">
        <LayersPanel />
      </div>

      {/* News Feed (bottom) */}
      <NewsFeed />

      {/* Settings Modal */}
      <SettingsPanel />
    </main>
  );
}
