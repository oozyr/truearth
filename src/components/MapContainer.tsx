"use client";

import { useGlobalStore } from "@/store/useGlobalStore";
import dynamic from "next/dynamic";

const GlobeContainer = dynamic(() => import("@/components/GlobeContainer"), { ssr: false });
const FlatMapContainer = dynamic(() => import("@/components/FlatMapContainer"), { ssr: false });

export default function MapContainer() {
  const { settings } = useGlobalStore();

  return (
    <div className="absolute inset-0">
      {settings.viewMode === '3d' ? <GlobeContainer /> : <FlatMapContainer />}
    </div>
  );
}
