import type { Platform } from '../types';
import snapshot from '../data/snapshot.json';
import { setApiMode } from './peec';

const TAVILY_BASE = '/_tavily'; // Vite proxy → https://api.tavily.com
const API_KEY = import.meta.env.VITE_TAVILY_API_KEY as string | undefined;

export interface TavilyResult {
  url: string;
  title: string;
  content: string;
  score: number;
  published_date?: string;
  raw_content?: string;
}

export interface TavilySearchOpts {
  query: string;
  platform?: Platform;
  timeRange?: 'day' | 'week' | 'month' | 'year';
  maxResults?: number;
  searchDepth?: 'basic' | 'advanced';
  /** Force live API call, bypass the bundled snapshot. */
  force?: boolean;
}

const PLATFORM_DOMAIN: Record<Platform, string> = {
  reddit: 'reddit.com',
  linkedin: 'linkedin.com',
  x: 'twitter.com',
};

const SNAPSHOT_BY_PLATFORM = snapshot.tavily.byPlatform as Record<Platform, TavilyResult[]>;

function fromSnapshot(opts: TavilySearchOpts): TavilyResult[] {
  const platform = opts.platform ?? 'reddit';
  const pool = SNAPSHOT_BY_PLATFORM[platform] ?? [];
  return pool.slice(0, opts.maxResults ?? 10);
}

export async function tavilySearch(opts: TavilySearchOpts): Promise<TavilyResult[]> {
  if (!opts.force) return fromSnapshot(opts);
  if (!API_KEY) {
    setApiMode('tavily', 'cached');
    return fromSnapshot(opts);
  }
  try {
    const res = await fetch(`${TAVILY_BASE}/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: API_KEY,
        query: opts.query,
        search_depth: opts.searchDepth ?? 'advanced',
        max_results: opts.maxResults ?? 10,
        time_range: opts.timeRange ?? 'week',
        include_domains: opts.platform ? [PLATFORM_DOMAIN[opts.platform]] : undefined,
        include_raw_content: true,
      }),
    });
    if (!res.ok) {
      console.warn(`tavily ${res.status}; falling back to snapshot`);
      setApiMode('tavily', 'cached');
      return fromSnapshot(opts);
    }
    const data = (await res.json()) as { results?: TavilyResult[] };
    if (!data.results?.length) {
      setApiMode('tavily', 'cached');
      return fromSnapshot(opts);
    }
    setApiMode('tavily', 'live');
    return data.results;
  } catch (err) {
    console.warn('tavily error; falling back to snapshot', err);
    setApiMode('tavily', 'cached');
    return fromSnapshot(opts);
  }
}

/**
 * Search across multiple platforms in parallel. Defaults to snapshot for
 * instant hydration; pass `force: true` to refresh from live API.
 */
export async function tavilySearchMulti(
  queries: Array<{ query: string; platform: Platform }>,
  timeRange: 'day' | 'week' | 'month' = 'week',
  opts: { force?: boolean } = {},
): Promise<Array<TavilyResult & { platform: Platform; query: string }>> {
  const results = await Promise.all(
    queries.map(async (q) => {
      const r = await tavilySearch({
        query: q.query,
        platform: q.platform,
        timeRange,
        force: opts.force,
      });
      return r.map((res) => ({ ...res, platform: q.platform, query: q.query }));
    }),
  );
  return results.flat();
}
