import { NextResponse } from 'next/server';
import type { GlobalEvent, EventCategory, SeverityLevel, MarketImpact } from '@/types/global';

// ─── Mock Global Events (expanded with categories & severity) ─
const MOCK_EVENTS: Array<{
  id: string;
  title: string;
  summary: string;
  lat: number;
  lon: number;
  category: EventCategory;
  severity: SeverityLevel;
  sources: string[];
  truthScore: number;
}> = [
  {
    id: 'evt_1',
    title: 'Global Semiconductor Shortage Intensifies',
    summary: 'Major tech firms scramble as supply chains bottleneck in Southeast Asia. TSMC and Samsung report 12-week delays.',
    lat: 1.3521, lon: 103.8198,
    category: 'market', severity: 'high',
    sources: ['Reuters', 'Bloomberg', 'Nikkei Asia'],
    truthScore: 0.92,
  },
  {
    id: 'evt_2',
    title: 'Border Tensions Escalate in Eastern Europe',
    summary: 'Unconfirmed reports of artillery fire near border regions. NATO activates rapid response consultations.',
    lat: 50.4501, lon: 30.5234,
    category: 'conflict', severity: 'critical',
    sources: ['BBC', 'Al Jazeera', 'DW News'],
    truthScore: 0.68,
  },
  {
    id: 'evt_3',
    title: 'Massive Lithium Deposit Discovered',
    summary: 'A deposit in the Atacama region could contain 2.5M tonnes of lithium carbonate equivalent.',
    lat: -23.5505, lon: -46.6333,
    category: 'resources', severity: 'moderate',
    sources: ['Reuters', 'Mining Weekly', 'France 24'],
    truthScore: 0.95,
  },
  {
    id: 'evt_4',
    title: 'Magnitude 7.1 Earthquake Hits Indonesian Coast',
    summary: 'Tsunami warnings issued for Sulawesi and surrounding islands. Emergency teams deployed.',
    lat: -1.2, lon: 120.8,
    category: 'natural_disaster', severity: 'critical',
    sources: ['USGS', 'NHK World', 'Reuters'],
    truthScore: 0.99,
  },
  {
    id: 'evt_5',
    title: 'Ransomware Attack on European Energy Grid',
    summary: 'Critical infrastructure in 3 countries affected. Authorities suspect state-sponsored actor.',
    lat: 52.5200, lon: 13.4050,
    category: 'cyber', severity: 'high',
    sources: ['The Guardian', 'DW News', 'Wired'],
    truthScore: 0.74,
  },
  {
    id: 'evt_6',
    title: 'OPEC+ Emergency Meeting Called',
    summary: 'Production cut discussions amid falling demand forecasts. Brent crude volatile.',
    lat: 25.2048, lon: 55.2708,
    category: 'market', severity: 'elevated',
    sources: ['Reuters', 'Bloomberg', 'Al Jazeera'],
    truthScore: 0.88,
  },
  {
    id: 'evt_7',
    title: 'Mass Displacement Crisis in Horn of Africa',
    summary: 'Over 2 million displaced by combined drought and armed conflict. UN appeals for $1.2B.',
    lat: 9.0250, lon: 38.7469,
    category: 'humanitarian', severity: 'critical',
    sources: ['UN News', 'Al Jazeera', 'BBC Africa'],
    truthScore: 0.91,
  },
  {
    id: 'evt_8',
    title: 'Contested Election Results Spark Protests',
    summary: 'Opposition alleges widespread irregularities. International observers report "concerns".',
    lat: 14.5995, lon: 120.9842,
    category: 'political', severity: 'elevated',
    sources: ['AP News', 'France 24', 'NHK World'],
    truthScore: 0.63,
  },
  {
    id: 'evt_9',
    title: 'Arctic Shipping Route Opens Two Months Early',
    summary: 'Northern Sea Route accessible in record-early thaw. Geopolitical implications for trade.',
    lat: 72.0, lon: 40.0,
    category: 'resources', severity: 'moderate',
    sources: ['Reuters', 'BBC', 'Guardian'],
    truthScore: 0.96,
  },
  {
    id: 'evt_10',
    title: 'Federal Reserve Signals Emergency Rate Review',
    summary: 'Unscheduled FOMC meeting rumored as bond yields spike across maturities.',
    lat: 38.8951, lon: -77.0364,
    category: 'market', severity: 'high',
    sources: ['Bloomberg', 'Reuters', 'CNBC'],
    truthScore: 0.72,
  },
];

function generateMarketImpact(category: EventCategory): MarketImpact {
  const impacts: Record<EventCategory, MarketImpact> = {
    conflict:         { ticker: 'DEF-IDX',  changePercent: 5.0,   correlation: 'high' },
    market:           { ticker: 'GLB-TECH', changePercent: -2.5,  correlation: 'high' },
    resources:        { ticker: 'RES-LITH', changePercent: 12.5,  correlation: 'high' },
    natural_disaster: { ticker: 'INS-CAT',  changePercent: 3.2,   correlation: 'medium' },
    cyber:            { ticker: 'CYB-SEC',  changePercent: 8.1,   correlation: 'medium' },
    political:        { ticker: 'VOL-IDX',  changePercent: -1.8,  correlation: 'low' },
    humanitarian:     { ticker: 'AID-FND',  changePercent: 0.5,   correlation: 'low' },
  };
  return impacts[category] || impacts.political;
}

export async function GET() {
  try {
    const formattedEvents: GlobalEvent[] = MOCK_EVENTS.map(evt => ({
      id: evt.id,
      coordinates: { lat: evt.lat, lon: evt.lon },
      category: evt.category,
      severity: evt.severity,
      title: evt.title,
      summary: evt.summary,
      truthScore: evt.truthScore,
      sources: evt.sources,
      timestamp: new Date(Date.now() - Math.random() * 7200000).toISOString(),
      marketImpact: generateMarketImpact(evt.category),
      // Legacy compat
      modeTag: evt.category === 'conflict' ? 'war' : evt.category === 'resources' ? 'resources' : 'market',
    }));

    return Response.json(formattedEvents, { status: 200 });
  } catch (error) {
    console.error('[TRUEARTH] Events fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}
