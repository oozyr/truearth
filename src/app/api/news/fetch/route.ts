import { NextResponse } from 'next/server';
import type { NewsArticle, EventCategory } from '@/types/global';
import { RSS_SOURCES } from '@/lib/rss-sources';

// Revalidate every 60 seconds to keep live feed fresh
export const revalidate = 60;

// ─── Keyword-based categorization ───────────────────────────
const CATEGORY_KEYWORDS: Record<EventCategory, string[]> = {
  conflict:         ['war', 'attack', 'military', 'strike', 'bomb', 'missile', 'troops', 'artillery', 'combat', 'killed', 'soldier', 'airstrike', 'ceasefire', 'invasion'],
  market:           ['stock', 'market', 'economy', 'inflation', 'trade', 'tariff', 'gdp', 'recession', 'bank', 'fed', 'interest rate', 'dow', 'nasdaq', 'shares'],
  resources:        ['oil', 'gas', 'lithium', 'mining', 'water', 'energy', 'coal', 'uranium', 'pipeline', 'opec', 'commodity', 'rare earth'],
  natural_disaster: ['earthquake', 'tsunami', 'hurricane', 'flood', 'wildfire', 'volcano', 'storm', 'cyclone', 'tornado', 'drought'],
  cyber:            ['cyber', 'hack', 'malware', 'ransomware', 'breach', 'phishing', 'data leak'],
  political:        ['election', 'president', 'parliament', 'sanction', 'diplomacy', 'summit', 'treaty', 'legislation', 'vote', 'protest', 'coup'],
  humanitarian:     ['refugee', 'famine', 'aid', 'humanitarian', 'displaced', 'crisis', 'poverty', 'unicef'],
  football:         ['football', 'soccer', 'premier league', 'champions league', 'fifa', 'uefa', 'goal', 'stadium', 'match', 'tournament', 'world cup'],
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

// ─── Tag detection for specific sub-categories ──────────────
function detectTags(text: string): string[] {
  const lower = text.toLowerCase();
  const tags: string[] = [];
  
  // Football specific tags
  if (/(transfer|signing|loan|contract|deal|bid|fee|medical|agreement|fabrizio|rumour|move to)/.test(lower)) tags.push('TRANSFER WINDOW');
  if (/(injury|fitness|surgery|ruled out|recovery|squad|suspended|hamstring|knee|acl)/.test(lower)) tags.push('PLAYER STATUS');

  // Conflict
  if (/(troops|military|strike|bomb|missile|artillery|airstrike|invasion|offensive)/.test(lower)) tags.push('MILITARY ACTION');
  if (/(ceasefire|diplomacy|treaty|negotiation|talks|peace)/.test(lower)) tags.push('DIPLOMACY');
  if (/(killed|casualties|dead|injured|civilian)/.test(lower)) tags.push('CASUALTIES');

  // Market
  if (/(stock|dow|nasdaq|shares|wall street|index|bull|bear)/.test(lower)) tags.push('STOCK MARKET');
  if (/(economy|inflation|gdp|recession|interest rate|fed|central bank)/.test(lower)) tags.push('ECONOMY');
  if (/(earnings|ceo|merger|acquisition|corporate|bankruptcy)/.test(lower)) tags.push('CORPORATE');

  // Resources
  if (/(oil|gas|energy|coal|uranium|pipeline|opec|solar|wind)/.test(lower)) tags.push('ENERGY');
  if (/(lithium|mining|water|commodity|rare earth|gold|copper)/.test(lower)) tags.push('COMMODITIES');
  if (/(supply chain|shortage|export|import|tariff)/.test(lower)) tags.push('SUPPLY CHAIN');

  // Natural Disaster
  if (/(hurricane|flood|storm|cyclone|tornado|weather|rain)/.test(lower)) tags.push('SEVERE WEATHER');
  if (/(earthquake|tsunami|volcano|seismic|tremor)/.test(lower)) tags.push('SEISMIC ACTIVITY');
  if (/(warning|evacuation|alert|shelter|emergency)/.test(lower)) tags.push('WARNINGS');

  // Cyber
  if (/(breach|leak|stolen|hacked|password|phishing)/.test(lower)) tags.push('DATA BREACH');
  if (/(ransomware|malware|virus|ddos)/.test(lower)) tags.push('RANSOMWARE');
  if (/(infrastructure|grid|hospital|server|network)/.test(lower)) tags.push('INFRASTRUCTURE');

  // Political
  if (/(election|vote|poll|campaign|candidate|ballot)/.test(lower)) tags.push('ELECTIONS');
  if (/(legislation|law|bill|parliament|congress|senate|policy)/.test(lower)) tags.push('POLICY');
  if (/(protest|strike|riot|demonstration|rally)/.test(lower)) tags.push('PROTESTS');

  // Humanitarian
  if (/(refugee|displaced|asylum|camp|border)/.test(lower)) tags.push('REFUGEES');
  if (/(aid|relief|fund|donation|unicef|red cross|supply)/.test(lower)) tags.push('AID & RELIEF');
  if (/(famine|starvation|poverty|crisis|shortage)/.test(lower)) tags.push('CRISIS');
  
  return tags;
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

// ─── Similarity & Clustering ────────────────────────────────
function calculateJaccardSimilarity(s1: string, s2: string): number {
  const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(w => w.length > 3);
  const words1 = new Set(normalize(s1));
  const words2 = new Set(normalize(s2));
  
  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const union = new Set([...words1, ...words2]);
  
  if (union.size === 0) return 0;
  return intersection.size / union.size;
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
        const timeout = setTimeout(() => controller.abort(), 8000);

        try {
          const res = await fetch(source.feedUrl, {
            signal: controller.signal,
            headers: { 'User-Agent': 'TruearthBot/1.0' },
          });
          clearTimeout(timeout);

          if (!res.ok) return [];

          const xml = await res.text();
          const items = parseRSSItems(xml);

          return items.slice(0, 10).map((item, i): NewsArticle & { _bias?: string } => {
            const fullText = item.title + ' ' + item.description;
            return {
              id: `${source.id}_${i}_${Date.now()}`,
              title: item.title,
              summary: item.description,
              source: source.name,
              sourceUrl: item.link || source.feedUrl,
              publishedAt: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
              category: categorize(fullText),
              region: detectRegion(fullText),
              tags: detectTags(fullText),
              _bias: source.bias,
            };
          });
        } catch {
          clearTimeout(timeout);
          return [];
        }
      })
    );

    const rawArticles = results
      .filter((r): r is PromiseFulfilledResult<(NewsArticle & { _bias?: string })[]> => r.status === 'fulfilled')
      .flatMap(r => r.value);

    // If we got live data, cluster it
    if (rawArticles.length > 0) {
      const clustered: NewsArticle[] = [];
      const usedIndices = new Set<number>();

      for (let i = 0; i < rawArticles.length; i++) {
        if (usedIndices.has(i)) continue;
        const base = rawArticles[i];
        const clusterMembers = [base];
        usedIndices.add(i);

        for (let j = i + 1; j < rawArticles.length; j++) {
          if (usedIndices.has(j)) continue;
          const candidate = rawArticles[j];
          
          if (base.category !== candidate.category) continue;

          // Simple semantic overlap
          const sim = calculateJaccardSimilarity(base.title, candidate.title);
          if (sim > 0.3) {
            clusterMembers.push(candidate);
            usedIndices.add(j);
          }
        }

        // The longest summary becomes the lead article
        clusterMembers.sort((a, b) => b.summary.length - a.summary.length);
        const lead = clusterMembers[0];
        
        // Build related sources (deduplicated by source name)
        const uniqueRelated: {source: string, sourceUrl: string, bias: string}[] = [];
        const seenSources = new Set<string>();
        for (const m of clusterMembers) {
          if (!seenSources.has(m.source)) {
            seenSources.add(m.source);
            uniqueRelated.push({
              source: m.source,
              sourceUrl: m.sourceUrl,
              bias: m._bias || 'center'
            });
          }
        }

        // Calculate actual trust factor based on cross-verification
        let trust = 50; // base score
        const numSources = uniqueRelated.length;
        trust += (numSources - 1) * 15;
        
        const biases = new Set(uniqueRelated.map(r => r.bias));
        if (biases.size > 1) trust += 15; // corroborated by different viewpoints
        if (biases.size > 2) trust += 10;
        
        trust = Math.min(99, trust);

        const finalArticle: NewsArticle = {
          ...lead,
          isCluster: numSources > 1,
          relatedSources: uniqueRelated,
          calculatedTrust: trust,
        };
        // @ts-ignore - removing internal tracking field
        delete finalArticle._bias;

        clustered.push(finalArticle);
      }

      clustered.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
      return Response.json(clustered.slice(0, 100), { status: 200 });
    }

    console.warn('[TRUEARTH] Real news fetch resulted in 0 articles. Falling back to mock data.');
    // Fallback to mock data
    return Response.json(MOCK_NEWS, { status: 200 });
  } catch (error) {
    console.error('[TRUEARTH] News fetch error:', error);
    return Response.json(MOCK_NEWS, { status: 200 });
  }
}
