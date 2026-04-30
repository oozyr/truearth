import { NextResponse } from 'next/server';
import type { NewsArticle, EventCategory } from '@/types/global';
import { RSS_SOURCES } from '@/lib/rss-sources';

// Revalidate every 5 minutes
export const revalidate = 300;

// ─── Keyword-based categorization ───────────────────────────
const CATEGORY_KEYWORDS: Record<EventCategory, string[]> = {
  conflict:         ['war', 'attack', 'military', 'strike', 'bomb', 'missile', 'troops', 'artillery', 'combat', 'killed', 'soldier', 'airstrike', 'ceasefire', 'invasion'],
  market:           ['stock', 'market', 'economy', 'inflation', 'trade', 'tariff', 'gdp', 'recession', 'bank', 'fed', 'interest rate', 'dow', 'nasdaq', 'shares'],
  resources:        ['oil', 'gas', 'lithium', 'mining', 'water', 'energy', 'coal', 'uranium', 'pipeline', 'opec', 'commodity', 'rare earth'],
  natural_disaster: ['earthquake', 'tsunami', 'hurricane', 'flood', 'wildfire', 'volcano', 'storm', 'cyclone', 'tornado', 'drought'],
  cyber:            ['cyber', 'hack', 'malware', 'ransomware', 'breach', 'phishing', 'data leak'],
  political:        ['election', 'president', 'parliament', 'sanction', 'diplomacy', 'summit', 'treaty', 'legislation', 'vote', 'protest', 'coup'],
  humanitarian:     ['refugee', 'famine', 'aid', 'humanitarian', 'displaced', 'crisis', 'poverty', 'unicef'],
};

function categorize(text: string): EventCategory {
  const lower = text.toLowerCase();
  let bestCat: EventCategory = 'political';
  let bestScore = 0;

  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    const score = keywords.filter(kw => lower.includes(kw)).length;
    if (score > bestScore) {
      bestScore = score;
      bestCat = cat as EventCategory;
    }
  }
  return bestCat;
}

// ─── Region detection ───────────────────────────────────────
function detectRegion(text: string): string {
  const lower = text.toLowerCase();
  const regions: Record<string, string[]> = {
    'Middle East':  ['iran', 'iraq', 'syria', 'yemen', 'lebanon', 'gaza', 'israel', 'saudi', 'qatar', 'uae'],
    'Europe':       ['ukraine', 'russia', 'france', 'germany', 'uk', 'britain', 'poland', 'nato', 'eu '],
    'Asia':         ['china', 'japan', 'india', 'korea', 'taiwan', 'philippines', 'vietnam', 'myanmar'],
    'Americas':     ['usa', 'mexico', 'brazil', 'canada', 'colombia', 'argentina', 'venezuela'],
    'Africa':       ['sudan', 'ethiopia', 'nigeria', 'kenya', 'congo', 'somalia', 'south africa', 'egypt'],
  };

  for (const [region, keywords] of Object.entries(regions)) {
    if (keywords.some(kw => lower.includes(kw))) return region;
  }
  return 'Global';
}

// ─── Simple RSS XML parser (no external dep for edge compat) ─
function parseRSSItems(xml: string): Array<{ title: string; link: string; description: string; pubDate: string }> {
  const items: Array<{ title: string; link: string; description: string; pubDate: string }> = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
  let match;

  while ((match = itemRegex.exec(xml)) !== null) {
    const itemXml = match[1];
    const getTag = (tag: string) => {
      const r = new RegExp(`<${tag}[^>]*>(?:<!\\[CDATA\\[)?(.*?)(?:\\]\\]>)?<\\/${tag}>`, 'is');
      const m = itemXml.match(r);
      return m ? m[1].trim() : '';
    };

    items.push({
      title: getTag('title'),
      link: getTag('link') || getTag('guid'),
      description: getTag('description').replace(/<[^>]+>/g, '').substring(0, 300),
      pubDate: getTag('pubDate') || getTag('dc:date'),
    });
  }
  return items;
}

// ─── Mock fallback data ─────────────────────────────────────
const MOCK_NEWS: NewsArticle[] = [
  {
    id: 'news_1', title: 'Global Semiconductor Supply Chain Faces New Disruptions',
    summary: 'Major chipmakers warn of extended lead times as geopolitical tensions impact Southeast Asian manufacturing hubs.',
    source: 'Reuters', sourceUrl: 'https://reuters.com', publishedAt: new Date(Date.now() - 300000).toISOString(),
    category: 'market', region: 'Asia',
  },
  {
    id: 'news_2', title: 'NATO Defense Ministers Meet Amid Rising Tensions',
    summary: 'Emergency session called to address escalating military buildups along eastern borders.',
    source: 'BBC World', sourceUrl: 'https://bbc.com/news/world', publishedAt: new Date(Date.now() - 900000).toISOString(),
    category: 'conflict', region: 'Europe',
  },
  {
    id: 'news_3', title: 'Massive Lithium Reserves Confirmed in South America',
    summary: 'Geological survey confirms deposits that could reshape the global EV battery supply chain.',
    source: 'France 24', sourceUrl: 'https://france24.com', publishedAt: new Date(Date.now() - 1800000).toISOString(),
    category: 'resources', region: 'Americas',
  },
  {
    id: 'news_4', title: 'Magnitude 6.8 Earthquake Strikes Indonesia',
    summary: 'Tsunami warnings issued for coastal areas. Emergency services deployed across three provinces.',
    source: 'NHK World', sourceUrl: 'https://www3.nhk.or.jp', publishedAt: new Date(Date.now() - 600000).toISOString(),
    category: 'natural_disaster', region: 'Asia',
  },
  {
    id: 'news_5', title: 'Central Banks Signal Coordinated Rate Decisions',
    summary: 'Federal Reserve and ECB hint at synchronized policy moves as inflation data diverges across regions.',
    source: 'DW News', sourceUrl: 'https://dw.com', publishedAt: new Date(Date.now() - 2400000).toISOString(),
    category: 'market', region: 'Global',
  },
  {
    id: 'news_6', title: 'Cyberattack Disrupts Major European Pipeline Network',
    summary: 'Ransomware attack forces temporary shutdown of critical energy infrastructure across three countries.',
    source: 'The Guardian', sourceUrl: 'https://theguardian.com', publishedAt: new Date(Date.now() - 400000).toISOString(),
    category: 'cyber', region: 'Europe',
  },
  {
    id: 'news_7', title: 'UN Warns of Escalating Humanitarian Crisis in East Africa',
    summary: 'Drought and conflict displace millions as international aid organizations call for emergency funding.',
    source: 'Al Jazeera', sourceUrl: 'https://aljazeera.com', publishedAt: new Date(Date.now() - 3600000).toISOString(),
    category: 'humanitarian', region: 'Africa',
  },
  {
    id: 'news_8', title: 'Oil Prices Surge After OPEC+ Announces Production Cuts',
    summary: 'Brent crude jumps 4% as cartel agrees to reduce output by 1.2 million barrels per day.',
    source: 'Reuters', sourceUrl: 'https://reuters.com', publishedAt: new Date(Date.now() - 1200000).toISOString(),
    category: 'resources', region: 'Middle East',
  },
  {
    id: 'news_9', title: 'Snap Elections Called in Key Southeast Asian Nation',
    summary: 'Political turmoil deepens as incumbent government faces constitutional challenge from opposition coalition.',
    source: 'AP News', sourceUrl: 'https://apnews.com', publishedAt: new Date(Date.now() - 5400000).toISOString(),
    category: 'political', region: 'Asia',
  },
  {
    id: 'news_10', title: 'Bitcoin Surges Past $95K on Institutional Inflows',
    summary: 'Major financial institutions increase cryptocurrency allocations as regulatory clarity improves globally.',
    source: 'BBC World', sourceUrl: 'https://bbc.com/news/business', publishedAt: new Date(Date.now() - 7200000).toISOString(),
    category: 'market', region: 'Global',
  },
];

export async function GET() {
  try {
    // Attempt live RSS fetching
    const results = await Promise.allSettled(
      RSS_SOURCES.map(async (source) => {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);

        try {
          const res = await fetch(source.feedUrl, {
            signal: controller.signal,
            headers: { 'User-Agent': 'TruearthBot/1.0' },
          });
          clearTimeout(timeout);

          if (!res.ok) return [];

          const xml = await res.text();
          const items = parseRSSItems(xml);

          return items.slice(0, 10).map((item, i): NewsArticle => ({
            id: `${source.id}_${i}_${Date.now()}`,
            title: item.title,
            summary: item.description,
            source: source.name,
            sourceUrl: item.link || source.feedUrl,
            publishedAt: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
            category: categorize(item.title + ' ' + item.description),
            region: detectRegion(item.title + ' ' + item.description),
          }));
        } catch {
          clearTimeout(timeout);
          return [];
        }
      })
    );

    const articles: NewsArticle[] = results
      .filter((r): r is PromiseFulfilledResult<NewsArticle[]> => r.status === 'fulfilled')
      .flatMap(r => r.value);

    // If we got live data, return it sorted by date
    if (articles.length > 3) {
      articles.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
      return Response.json(articles.slice(0, 50), { status: 200 });
    }

    // Fallback to mock data
    return Response.json(MOCK_NEWS, { status: 200 });
  } catch (error) {
    console.error('[TRUEARTH] News fetch error:', error);
    return Response.json(MOCK_NEWS, { status: 200 });
  }
}
