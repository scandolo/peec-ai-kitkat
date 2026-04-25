import type { ConversationOpportunity, Trend, VisibilityGap, VoiceProfile } from '../types';
import {
  ATTIO_BRAND_ID,
  brandReportOverall,
  listBrands,
  topCitedDomains,
  visibilityGaps,
} from './peec';
import {
  extractVoice,
  generateQueries,
  scoreResults,
  summarizeTrends,
} from './gemini';
import { tavilySearch, tavilySearchMulti } from './tavily';

export interface RadarSnapshot {
  brand: { name: string; domain: string; competitors: string[]; brandId: string };
  overall: Awaited<ReturnType<typeof brandReportOverall>>;
  gaps: VisibilityGap[];
  topDomains: Awaited<ReturnType<typeof topCitedDomains>>;
  voice: VoiceProfile;
  trends: Trend[];
  opportunities: ConversationOpportunity[];
}

/**
 * Build the full Radar state for a brand. Used both:
 *  - offline (pre-compute and serialize to data/attio-cache.json), and
 *  - live (called from the UI when keys are present).
 *
 * Each section degrades gracefully — missing keys → mocks.
 */
export async function buildRadar(opts: { brandId?: string } = {}): Promise<RadarSnapshot> {
  const brandId = opts.brandId ?? ATTIO_BRAND_ID;

  // 1. Strategic intelligence (Peec)
  const [brands, overall, topDomains, gaps] = await Promise.all([
    listBrands(),
    brandReportOverall(),
    topCitedDomains(),
    visibilityGaps(brandId),
  ]);

  const own = brands.find((b) => b.id === brandId) ?? brands[0];
  const competitors = brands.filter((b) => b.id !== brandId).map((b) => b.name);
  const brand = {
    name: own?.name ?? 'Attio',
    domain: own?.domain ?? 'attio.com',
    competitors,
    brandId,
  };

  // 2. Brand voice + context (Gemini, optional corpus)
  const voiceCorpus: Array<{ source: string; text: string }> = [];
  const voice = await extractVoice({ name: brand.name, domain: brand.domain }, voiceCorpus);

  // 3. Conversation interception
  const sortedGaps = [...gaps].sort((a, b) => a.visibility - b.visibility).slice(0, 4);
  const queries = await generateQueries(
    { name: brand.name, domain: brand.domain, competitors },
    sortedGaps,
  );

  const tavilyResults = await tavilySearchMulti(
    queries.map((q) => ({ query: q.query, platform: q.platform })),
    'week',
  );

  const queryById = new Map(queries.map((q) => [q.query, q]));
  const enriched = tavilyResults.map((r) => {
    const q = queryById.get(r.query);
    const gap = gaps.find((g) => g.topicId === q?.topicId) ?? sortedGaps[0];
    return {
      ...r,
      topicId: gap?.topicId ?? '',
      topicName: gap?.topicName ?? 'Unknown',
      topicVisibility: gap?.visibility ?? 0,
    };
  });

  const scored = await scoreResults({ name: brand.name, domain: brand.domain }, enriched);
  const scoredByUrl = new Map(scored.map((s) => [s.url, s]));

  const opportunities: ConversationOpportunity[] = enriched
    .map((r) => {
      const s = scoredByUrl.get(r.url);
      const id = btoa(r.url).slice(0, 16);
      return {
        id,
        platform: r.platform,
        url: r.url,
        title: r.title,
        content: r.content,
        author: extractAuthor(r),
        publishedAt: r.published_date ?? new Date().toISOString(),
        relevanceScore: s?.relevanceScore ?? Math.round((r.score ?? 0.7) * 100),
        connectionType: s?.connectionType ?? 'direct',
        relatedTopicId: r.topicId,
        peecInsight: s?.peecInsight ?? `Engaging here connects to "${r.topicName}".`,
        estimatedVisibilityLift: s?.estimatedVisibilityLift ?? 1.5,
      };
    })
    .filter((o) => o.relevanceScore >= 60)
    .sort((a, b) => b.relevanceScore - a.relevanceScore);

  // 4. Trends agent (uses a separate broader sweep)
  const trendsCorpus = await tavilySearch({
    query: `${brand.name} OR ${competitors.slice(0, 2).join(' OR ')} CRM trends`,
    platform: 'reddit',
    timeRange: 'month',
    maxResults: 15,
  });
  const trends = await summarizeTrends({ name: brand.name }, sortedGaps, trendsCorpus);

  return { brand, overall, gaps, topDomains, voice, trends, opportunities };
}

function extractAuthor(r: { url: string; title: string }): string {
  if (r.url.includes('linkedin.com/posts/')) {
    const m = r.url.match(/posts\/([^_/]+)/);
    if (m) return m[1].replace(/-/g, ' ');
  }
  if (r.url.includes('reddit.com/r/')) {
    const m = r.url.match(/reddit\.com\/r\/([^/]+)/);
    if (m) return `r/${m[1]}`;
  }
  if (r.url.includes('x.com/') || r.url.includes('twitter.com/')) {
    const m = r.url.match(/(?:x|twitter)\.com\/([^/]+)/);
    if (m) return `@${m[1]}`;
  }
  return 'unknown';
}
