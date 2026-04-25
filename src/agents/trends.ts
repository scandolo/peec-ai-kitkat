/**
 * Trends Agent — weekly deep research.
 *
 * Sweeps Reddit (and a sampling of LinkedIn/X via Tavily) for emerging
 * conversations and surfaces the trends most likely to move a measured
 * Peec gap. Each output trend is anchored to a Peec topic with an expected
 * pp lift if engaged this week — that's the wedge vs Peec's static
 * recommendations.
 */

import type { AgentRunOptions, Trend, VisibilityGap } from '../types';
import { tavilySearch } from '../services/tavily';
import { summarizeTrends } from '../services/gemini';

export interface TrendsAgentInput {
  brand: { name: string; competitors: string[] };
  gaps: VisibilityGap[];
}

export async function runTrendsAgent(
  input: TrendsAgentInput,
  opts: AgentRunOptions = {},
): Promise<Trend[]> {
  const { brand, gaps } = input;
  const sortedGaps = [...gaps].sort((a, b) => a.visibility - b.visibility).slice(0, 4);

  // opts.force is reserved for when live-apis lands FetchOpts on tavily.
  void opts;
  const corpus = await tavilySearch({
    query: `${brand.name} OR ${brand.competitors.slice(0, 2).join(' OR ')} CRM trends 2026`,
    platform: 'reddit',
    timeRange: 'month',
    maxResults: 15,
  });

  const trends = await summarizeTrends({ name: brand.name }, sortedGaps, corpus);
  return rankTrendsByPeecLeverage(trends, sortedGaps);
}

/**
 * Re-rank by leverage: higher pp lift × lower current visibility = more
 * urgent. Stable when leverage ties.
 */
function rankTrendsByPeecLeverage(trends: Trend[], gaps: VisibilityGap[]): Trend[] {
  const gapById = new Map(gaps.map((g) => [g.topicId, g]));
  return [...trends].sort((a, b) => {
    const ga = gapById.get(a.relatedTopicId);
    const gb = gapById.get(b.relatedTopicId);
    const la = a.expectedLiftPp * (100 - (ga?.visibility ?? 0));
    const lb = b.expectedLiftPp * (100 - (gb?.visibility ?? 0));
    return lb - la;
  });
}
