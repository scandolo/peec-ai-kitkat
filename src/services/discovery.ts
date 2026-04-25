/**
 * Discovery — the thin orchestrator over the three SWARM agents.
 *
 *  1. Pulls strategic intelligence from Peec (brands / topics / gaps / domains).
 *  2. Builds the Brand Context RAG index (used to ground every reply).
 *  3. Extracts the brand voice (system-prompt anchor for every Gemini call).
 *  4. Fans out to the Trends and Conversation Interception agents in parallel.
 *  5. Composes a RadarSnapshot for the UI to render.
 *
 * Snapshot-default — services hydrate from `src/data/snapshot.json` instantly
 * unless `force: true` is passed, in which case they refresh from live APIs.
 */

import type {
  AgentRunOptions,
  BrandContextIndex,
  ConversationOpportunity,
  Trend,
  VisibilityGap,
  VoiceProfile,
} from '../types';
import {
  ATTIO_BRAND_ID,
  brandReportOverall,
  listBrands,
  topCitedDomains,
  visibilityGaps,
  type PeecBrandReportRow,
  type PeecDomainReportRow,
} from './peec';
import { extractVoice } from './gemini';
import { buildAttioContextIndex, runInterceptionAgent, runTrendsAgent } from '../agents';

export interface RadarSnapshot {
  brand: { name: string; domain: string; competitors: string[]; brandId: string };
  overall: PeecBrandReportRow[];
  gaps: VisibilityGap[];
  topDomains: PeecDomainReportRow[];
  voice: VoiceProfile;
  contextIndex: BrandContextIndex;
  trends: Trend[];
  opportunities: ConversationOpportunity[];
}

export async function buildRadar(
  opts: AgentRunOptions & { brandId?: string } = {},
): Promise<RadarSnapshot> {
  const brandId = opts.brandId ?? ATTIO_BRAND_ID;

  // 1. Strategic intelligence (Peec).
  // Note: services own their own snapshot/live decision today. When `live-apis`
  // lands `FetchOpts.force`, thread `opts.force` through here.
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
    domain: own?.domains?.[0] ?? 'attio.com',
    competitors,
    brandId,
  };

  // 2. Brand Context RAG (hardcoded for the demo; future: ingest via Tavily extract)
  const contextIndex = buildAttioContextIndex();

  // 3. Voice profile (system-prompt anchor for every Gemini call)
  const voice = await extractVoice(
    { name: brand.name, domain: brand.domain },
    contextIndex.chunks.slice(0, 5).map((c) => ({ source: c.source, text: c.text })),
  );

  // 4. Run Trends + Interception agents in parallel
  const [trends, opportunities] = await Promise.all([
    runTrendsAgent({ brand: { name: brand.name, competitors }, gaps }, opts),
    runInterceptionAgent({ brand, gaps, voice, contextIndex }, opts),
  ]);

  return { brand, overall, gaps, topDomains, voice, contextIndex, trends, opportunities };
}
