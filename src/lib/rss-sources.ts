/**
 * RSS Feed Sources — curated for geopolitical diversity / minimal bias
 * Each source is fetched server-side and normalized into NewsArticle[]
 */
export interface RSSSource {
  id: string;
  name: string;
  feedUrl: string;
  region: string;
  bias: 'left-center' | 'center' | 'right-center' | 'mixed';
  color: string;
}

export const RSS_SOURCES: RSSSource[] = [
  {
    id: 'bbc',
    name: 'BBC World',
    feedUrl: 'https://feeds.bbci.co.uk/news/world/rss.xml',
    region: 'Global',
    bias: 'center',
    color: '#bb1919',
  },
  {
    id: 'aljazeera',
    name: 'Al Jazeera',
    feedUrl: 'https://www.aljazeera.com/xml/rss/all.xml',
    region: 'Middle East',
    bias: 'mixed',
    color: '#d4a843',
  },
  {
    id: 'france24',
    name: 'France 24',
    feedUrl: 'https://www.france24.com/en/rss',
    region: 'Europe',
    bias: 'center',
    color: '#00a7e1',
  },
  {
    id: 'dw',
    name: 'DW News',
    feedUrl: 'https://rss.dw.com/rdf/rss-en-all',
    region: 'Europe',
    bias: 'center',
    color: '#0098db',
  },
  {
    id: 'guardian',
    name: 'The Guardian',
    feedUrl: 'https://www.theguardian.com/world/rss',
    region: 'Global',
    bias: 'left-center',
    color: '#052962',
  },
  {
    id: 'nhk',
    name: 'NHK World',
    feedUrl: 'https://www3.nhk.or.jp/rss/news/cat0.xml',
    region: 'Asia',
    bias: 'center',
    color: '#5c0d12',
  },
  {
    id: 'bbc_football',
    name: 'BBC Football',
    feedUrl: 'https://feeds.bbci.co.uk/sport/football/rss.xml',
    region: 'Global',
    bias: 'center',
    color: '#10b981',
  },
  {
    id: 'espn_soccer',
    name: 'ESPN FC',
    feedUrl: 'https://www.espn.com/espn/rss/soccer/news',
    region: 'Global',
    bias: 'center',
    color: '#10b981',
  },
  {
    id: 'skysports_transfers',
    name: 'Sky Sports',
    feedUrl: 'https://www.skysports.com/rss/12040',
    region: 'Europe',
    bias: 'center',
    color: '#10b981',
  },
  {
    id: 'cnn_world',
    name: 'CNN International',
    feedUrl: 'http://rss.cnn.com/rss/edition.rss',
    region: 'Global',
    bias: 'left-center',
    color: '#cc0000',
  },
  {
    id: 'nyt_world',
    name: 'New York Times',
    feedUrl: 'https://rss.nytimes.com/services/xml/rss/nyt/World.xml',
    region: 'Global',
    bias: 'left-center',
    color: '#000000',
  },
];
