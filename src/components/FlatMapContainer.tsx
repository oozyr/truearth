"use client";

import { useEffect, useRef, useMemo } from "react";
import { MapContainer as LeafletMap, TileLayer, CircleMarker, Popup, ZoomControl } from "react-leaflet";
import { useGlobalStore } from "@/store/useGlobalStore";
import type { GlobalEvent, EventCategory } from "@/types/global";
import "leaflet/dist/leaflet.css";

const CATEGORY_COLORS: Record<EventCategory, string> = {
  conflict: '#ef4444',
  market: '#22d3ee',
  resources: '#34d399',
  natural_disaster: '#f59e0b',
  cyber: '#a855f7',
  political: '#3b82f6',
  humanitarian: '#ec4899',
};

const SEVERITY_RADIUS: Record<string, number> = {
  critical: 10,
  high: 8,
  elevated: 6,
  moderate: 5,
  low: 4,
};

export default function FlatMapContainer() {
  const { events, layers } = useGlobalStore();

  const enabledCategories = useMemo(() => {
    return new Set(layers.filter(l => l.enabled).map(l => l.category));
  }, [layers]);

  const filteredEvents = useMemo(() => {
    return events.filter(e => enabledCategories.has(e.category));
  }, [events, enabledCategories]);

  return (
    <div className="absolute inset-0 bg-[#000511]">
      <LeafletMap
        center={[20, 0]}
        zoom={2}
        minZoom={2}
        maxZoom={12}
        zoomControl={false}
        attributionControl={true}
        className="w-full h-full"
        style={{ background: '#000511' }}
      >
        <ZoomControl position="topright" />
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org">OSM</a> &copy; <a href="https://carto.com">CARTO</a>'
          maxZoom={19}
        />

        {filteredEvents.map(event => (
          <EventMarker key={event.id} event={event} />
        ))}
      </LeafletMap>
    </div>
  );
}

function EventMarker({ event }: { event: GlobalEvent }) {
  const color = CATEGORY_COLORS[event.category] || '#6366f1';
  const radius = SEVERITY_RADIUS[event.severity] || 5;
  const { setSelectedEvent } = useGlobalStore();

  return (
    <CircleMarker
      center={[event.coordinates.lat, event.coordinates.lon]}
      radius={radius}
      pathOptions={{
        color: color,
        fillColor: color,
        fillOpacity: 0.6,
        weight: 2,
        opacity: 0.8,
      }}
      eventHandlers={{
        click: () => setSelectedEvent(event.id),
      }}
    >
      <Popup>
        <div className="min-w-[200px]">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="text-[8px] font-bold px-1.5 py-0.5 rounded tracking-wider"
              style={{ backgroundColor: color + '30', color: color }}
            >
              {event.category.toUpperCase().replace('_', ' ')}
            </span>
            <span
              className="text-[8px] font-bold px-1.5 py-0.5 rounded tracking-wider"
              style={{
                color: event.severity === 'critical' ? '#ef4444' : event.severity === 'high' ? '#f97316' : '#eab308',
              }}
            >
              {event.severity.toUpperCase()}
            </span>
          </div>
          <h3 className="text-[12px] font-bold text-white mb-1">{event.title}</h3>
          <p className="text-[10px] text-white/60 leading-relaxed">{event.summary}</p>
          <div className="flex items-center gap-2 mt-2 text-[9px] text-white/30 font-mono">
            <span>TRUTH: {(event.truthScore * 100).toFixed(0)}%</span>
            <span>•</span>
            <span>{event.sources.length} SOURCES</span>
          </div>
        </div>
      </Popup>
    </CircleMarker>
  );
}
