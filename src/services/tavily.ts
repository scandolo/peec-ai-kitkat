import { cacheKey, withCache } from './cache';
import type { Platform } from '../types';

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
}

const PLATFORM_DOMAIN: Record<Platform, string> = {
  reddit: 'reddit.com',
  linkedin: 'linkedin.com',
  x: 'twitter.com',
};

export async function tavilySearch(opts: TavilySearchOpts): Promise<TavilyResult[]> {
  const key = cacheKey(['tavily', opts.platform, opts.timeRange, opts.query]);
  return withCache(key, async () => {
    if (!API_KEY) return mockResults(opts);
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
        console.warn(`tavily ${res.status}; falling back to mock`);
        return mockResults(opts);
      }
      const data = (await res.json()) as { results?: TavilyResult[] };
      return data.results ?? [];
    } catch (err) {
      console.warn('tavily error; falling back to mock', err);
      return mockResults(opts);
    }
  });
}

/**
 * Search across multiple platforms in parallel. Each platform call respects
 * the cache (so pre-computed results show instantly).
 */
export async function tavilySearchMulti(
  queries: Array<{ query: string; platform: Platform }>,
  timeRange: 'day' | 'week' | 'month' = 'week',
): Promise<Array<TavilyResult & { platform: Platform; query: string }>> {
  const results = await Promise.all(
    queries.map(async (q) => {
      const r = await tavilySearch({ query: q.query, platform: q.platform, timeRange });
      return r.map((res) => ({ ...res, platform: q.platform, query: q.query }));
    }),
  );
  return results.flat();
}

// ────────────────────────────────────────────────────────────
// MOCK RESULTS — used when no key, or API error
// Hand-curated, demo-ready posts for Attio
// ────────────────────────────────────────────────────────────

function mockResults(opts: TavilySearchOpts): TavilyResult[] {
  const platform = opts.platform ?? 'reddit';
  const pool = MOCK_POOL[platform] ?? [];
  return pool.slice(0, opts.maxResults ?? 10);
}

const MOCK_POOL: Record<Platform, TavilyResult[]> = {
  reddit: [
    {
      url: 'https://www.reddit.com/r/startups/comments/1abc123/whats_your_tech_stack_for_a_10person_b2b_saas/',
      title: "What's your tech stack for a 10-person B2B SaaS?",
      content:
        "We're scaling fast and Salesforce feels like overkill. Looking for something modern that doesn't require a full-time admin. Tech stack so far: Linear for issues, Notion for docs, Slack for everything. CRM is the gap.",
      score: 0.92,
      published_date: '2026-04-22T14:00:00Z',
    },
    {
      url: 'https://www.reddit.com/r/SaaS/comments/1def456/hubspot_alternatives_for_a_funded_seed_stage/',
      title: 'HubSpot alternatives for a funded seed stage company',
      content:
        "Just raised our seed and the HubSpot quote came in at $1,800/month for the bare minimum. That's nuts. What are people using that's modern, fast, and doesn't lock you into a yearly contract?",
      score: 0.88,
      published_date: '2026-04-21T09:00:00Z',
    },
    {
      url: 'https://www.reddit.com/r/sales/comments/1ghi789/sick_of_my_crm_taking_30_minutes_a_day/',
      title: "Sick of my CRM taking 30 minutes a day to update",
      content:
        "Every morning I spend 30 minutes copy-pasting from email into Salesforce. There has to be a better way. AI tools that actually update the CRM for you?",
      score: 0.85,
      published_date: '2026-04-20T07:30:00Z',
    },
    {
      url: 'https://www.reddit.com/r/RevOps/comments/1jkl012/revops_stack_post_series_a/',
      title: 'RevOps stack post Series A — what would you change?',
      content:
        "We just closed a $12M Series A and the existing CRM (Pipedrive) is creaking. We need something that scales but isn't Salesforce. Open to suggestions.",
      score: 0.83,
      published_date: '2026-04-23T11:00:00Z',
    },
    {
      url: 'https://www.reddit.com/r/B2BSaaS/comments/1mno345/scaling_chaos_50_to_150_people/',
      title: 'Scaling chaos — going from 50 to 150 people',
      content:
        "Hit 50 last quarter, hiring 100 more this year. Every system that worked at 20 is breaking. CRM, ATS, comp, you name it. What survives the 100-person threshold?",
      score: 0.81,
      published_date: '2026-04-19T16:30:00Z',
    },
    {
      url: 'https://www.reddit.com/r/founders/comments/1pqr678/just_raised_seed_dont_buy_salesforce/',
      title: "Just raised seed — please don't buy Salesforce",
      content:
        "Watching another founder friend get sold a $50k Salesforce contract. They have 8 customers. Why does this keep happening?",
      score: 0.86,
      published_date: '2026-04-22T08:00:00Z',
    },
    {
      url: 'https://www.reddit.com/r/startups/comments/1stu901/ai_writes_my_crm_updates_now/',
      title: 'AI writes my CRM updates now — sharing the workflow',
      content:
        "Spent 3 weeks building this. Every meeting transcribed, every email parsed, CRM auto-fills. Saving ~7 hours/week per rep. Happy to share details.",
      score: 0.79,
      published_date: '2026-04-23T19:00:00Z',
    },
  ],
  linkedin: [
    {
      url: 'https://www.linkedin.com/posts/scott-martinis_on-crm-complexity-and-vibe-coding-your-own-activity-7388040482645368832-Klpl',
      title: 'On CRM complexity and vibe-coding your own',
      content:
        "Spent the weekend trying to bend Salesforce to my will. 14 hours of clicks. Decided I'd rather vibe-code my own CRM in Lovable than touch another formula field. Anyone else done this?",
      score: 0.91,
      published_date: '2026-04-19T15:00:00Z',
    },
    {
      url: 'https://www.linkedin.com/posts/joe-petruzzi-b2b6a29b_this-is-not-sponsored-but-attio-crm-is-absolutely-activity-7158620628458045440-96_O',
      title: 'This is not sponsored, but Attio CRM is absolutely insane',
      content:
        "Migrated our entire pipeline over the weekend. The interface feels like it was designed in this decade. 21 of my reps replied saying they want to switch. The Salesforce/HubSpot duopoly cannot end soon enough.",
      score: 0.95,
      published_date: '2026-04-18T08:30:00Z',
    },
    {
      url: 'https://www.linkedin.com/posts/founder-x_my-startup-just-hit-50-employees-and-everything-activity-7400000000000000000-aaaa',
      title: 'My startup just hit 50 employees and everything is chaos',
      content:
        "Hiring is a blur. Our pipeline is a mess of tabs. Engineering is on Linear, Sales is on a spreadsheet, Marketing is on a different spreadsheet. We need to grow up — but I refuse to spend my Sunday in Salesforce admin land.",
      score: 0.87,
      published_date: '2026-04-22T17:00:00Z',
    },
    {
      url: 'https://www.linkedin.com/posts/series-a-founder_just-closed-our-12m-series-a-10-things-activity-7401000000000000000-bbbb',
      title: 'Just closed our $12M Series A. 10 things I wish I had known.',
      content:
        "1. Hire ops before sales. 2. Pick a CRM you can change in a week. 3. Don't sign a 3-year SaaS contract before PMF. 4. Your first RevOps hire is a force multiplier...",
      score: 0.9,
      published_date: '2026-04-20T11:00:00Z',
    },
    {
      url: 'https://www.linkedin.com/posts/saas-vc_the-end-of-the-crm-monolith-activity-7402000000000000000-cccc',
      title: 'The end of the CRM monolith',
      content:
        "Three founders this month told me their CRM is the worst tool in their stack. Not because of features — because it's a different design language than the rest of their software. Aesthetic is a buying signal now.",
      score: 0.84,
      published_date: '2026-04-21T14:00:00Z',
    },
  ],
  x: [
    {
      url: 'https://x.com/founder/status/1780000000000000000',
      title: 'Unpopular opinion: Salesforce is the new legacy ERP',
      content:
        "Unpopular opinion: Salesforce is the new legacy ERP. The product hasn't shipped a usable feature in 10 years. The only reason it's still around is contractual lock-in. Cambrian moment for CRM is now.",
      score: 0.89,
      published_date: '2026-04-22T20:15:00Z',
    },
    {
      url: 'https://x.com/founder/status/1781000000000000000',
      title: 'POV: manually copy-pasting contacts between 4 apps',
      content:
        "POV: it's 2026 and you're manually copy-pasting contacts between 4 apps because your CRM was built in 2008.",
      score: 0.84,
      published_date: '2026-04-21T13:00:00Z',
    },
    {
      url: 'https://x.com/builder/status/1782000000000000000',
      title: 'Spent 4 hours setting up Salesforce. Still not working.',
      content:
        "Spent 4 hours setting up Salesforce. Still not working. Spent 12 minutes setting up Attio. Already shipping. The future is in modern tools.",
      score: 0.86,
      published_date: '2026-04-23T07:45:00Z',
    },
    {
      url: 'https://x.com/revops/status/1783000000000000000',
      title: 'AI agents are eating the SDR job',
      content:
        "AI agents are eating the SDR job and the CRM is the integration point. Whoever wins the modern, API-first CRM wins the next decade of B2B sales.",
      score: 0.82,
      published_date: '2026-04-19T22:00:00Z',
    },
  ],
};
