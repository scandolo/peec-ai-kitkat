import type { VisibilityGap } from '../types';
import snapshot from '../data/snapshot.json';

const PEEC_BASE = 'https://api.peec.ai/customer/v1';
const API_KEY = import.meta.env.VITE_PEEC_API_KEY as string | undefined;
const PROJECT_ID =
  (import.meta.env.VITE_PEEC_PROJECT_ID as string | undefined) ??
  snapshot.peec.projectId;

const DATE_START = snapshot.peec.dateRange.start;
const DATE_END = snapshot.peec.dateRange.end;

export interface PeecBrand {
  id: string;
  name: string;
  domains?: string[];
  is_own?: boolean;
  color?: string;
}

export interface PeecTopic {
  id: string;
  name: string;
}

export interface PeecPrompt {
  id: string;
  text: string;
  topic_id?: string;
}

export interface PeecBrandReportRow {
  brand_id: string;
  brand_name: string;
  share_of_voice: number;
  visibility: number;
  sentiment: number;
  position: number;
}

export interface PeecDomainReportRow {
  domain: string;
  type: 'OWN' | 'COMPETITOR' | 'UGC' | 'CORPORATE' | 'NEWS' | string;
  retrieval_count: number;
  citation_count: number;
}

// ────────────────────────────────────────────────────────────
// Status registry — peec/tavily/gemini each report their own
// freshness so the orchestrator (or UI) can render a tiny
// "live | cached" indicator.
// ────────────────────────────────────────────────────────────

export type ApiMode = 'live' | 'cached' | 'mock';

const status: Record<'peec' | 'tavily' | 'gemini', ApiMode> = {
  peec: 'cached',
  tavily: 'cached',
  gemini: 'cached',
};

export function setApiMode(service: keyof typeof status, mode: ApiMode): void {
  status[service] = mode;
}

export function getApiMode(service: keyof typeof status): ApiMode {
  return status[service];
}

export function getApiStatus(): { peec: ApiMode; tavily: ApiMode; gemini: ApiMode; overall: ApiMode } {
  const modes = [status.peec, status.tavily, status.gemini];
  const overall: ApiMode = modes.every((m) => m === 'live')
    ? 'live'
    : modes.some((m) => m === 'live')
      ? 'cached' // mixed → call it cached so the indicator reads conservatively
      : modes.some((m) => m === 'cached')
        ? 'cached'
        : 'mock';
  return { ...status, overall };
}

// ────────────────────────────────────────────────────────────
// REST client
// ────────────────────────────────────────────────────────────

interface RawBrandRow {
  brand: { id: string; name: string };
  topic?: { id: string };
  share_of_voice: number;
  visibility: number;
  sentiment: number;
  position: number;
}

interface RawDomainRow {
  domain: string;
  classification: string;
  retrieval_count: number;
  citation_count: number;
}

async function call<T>(path: string, init: RequestInit = {}): Promise<T | null> {
  if (!API_KEY) return null;
  try {
    const res = await fetch(`${PEEC_BASE}${path}`, {
      ...init,
      headers: {
        'X-API-Key': API_KEY,
        'Content-Type': 'application/json',
        ...(init.headers ?? {}),
      },
    });
    if (!res.ok) {
      const body = await res.text();
      console.warn(`peec ${path} ${res.status} — falling back. ${body.slice(0, 200)}`);
      return null;
    }
    return (await res.json()) as T;
  } catch (err) {
    console.warn(`peec ${path} threw — falling back`, err);
    return null;
  }
}

interface FetchOpts {
  /** Force live API call, bypassing the bundled snapshot. */
  force?: boolean;
}

// ────────────────────────────────────────────────────────────
// Public API
// ────────────────────────────────────────────────────────────

export async function listBrands(opts: FetchOpts = {}): Promise<PeecBrand[]> {
  if (!opts.force) return snapshot.peec.brands as PeecBrand[];
  const data = await call<{ data: PeecBrand[] }>(`/brands?project_id=${PROJECT_ID}`);
  if (!data?.data?.length) {
    setApiMode('peec', 'cached');
    return snapshot.peec.brands as PeecBrand[];
  }
  setApiMode('peec', 'live');
  return data.data;
}

export async function listTopics(opts: FetchOpts = {}): Promise<PeecTopic[]> {
  if (!opts.force) return snapshot.peec.topics as PeecTopic[];
  const data = await call<{ data: PeecTopic[] }>(`/topics?project_id=${PROJECT_ID}`);
  if (!data?.data?.length) {
    setApiMode('peec', 'cached');
    return snapshot.peec.topics as PeecTopic[];
  }
  setApiMode('peec', 'live');
  return data.data;
}

export async function listPrompts(opts: FetchOpts = {}): Promise<PeecPrompt[]> {
  if (!opts.force) return snapshot.peec.prompts as PeecPrompt[];
  const data = await call<{ data: Array<{ id: string; messages?: Array<{ content: string }>; topic?: { id: string } }> }>(
    `/prompts?project_id=${PROJECT_ID}`,
  );
  if (!data?.data?.length) {
    setApiMode('peec', 'cached');
    return snapshot.peec.prompts as PeecPrompt[];
  }
  setApiMode('peec', 'live');
  return data.data.map((p) => ({
    id: p.id,
    text: p.messages?.[0]?.content ?? '',
    topic_id: p.topic?.id,
  }));
}

export async function brandReportByTopic(
  brandId: string,
  opts: FetchOpts = {},
): Promise<Array<{ topicId: string; visibility: number; shareOfVoice: number; sentiment: number }>> {
  const cached = (snapshot.peec.brandByTopic as Record<string, Array<{ topicId: string; visibility: number; shareOfVoice: number; sentiment: number }>>)[brandId];
  if (!opts.force && cached) return cached;

  const data = await call<{ data: RawBrandRow[] }>(`/reports/brands`, {
    method: 'POST',
    body: JSON.stringify({
      project_id: PROJECT_ID,
      dimensions: ['topic_id'],
      start_date: DATE_START,
      end_date: DATE_END,
      filters: [{ field: 'brand_id', operator: 'in', values: [brandId] }],
      order_by: [{ field: 'visibility', direction: 'desc' }],
    }),
  });
  if (!data?.data?.length) {
    setApiMode('peec', 'cached');
    return cached ?? [];
  }
  setApiMode('peec', 'live');
  return data.data.map((r) => ({
    topicId: r.topic?.id ?? '',
    visibility: +(r.visibility * 100).toFixed(1),
    shareOfVoice: +(r.share_of_voice * 100).toFixed(1),
    sentiment: r.sentiment,
  }));
}

export async function brandReportOverall(opts: FetchOpts = {}): Promise<PeecBrandReportRow[]> {
  if (!opts.force) return snapshot.peec.brandReportOverall as PeecBrandReportRow[];
  const data = await call<{ data: RawBrandRow[] }>(`/reports/brands`, {
    method: 'POST',
    body: JSON.stringify({
      project_id: PROJECT_ID,
      dimensions: [],
      start_date: DATE_START,
      end_date: DATE_END,
      order_by: [{ field: 'visibility', direction: 'desc' }],
    }),
  });
  if (!data?.data?.length) {
    setApiMode('peec', 'cached');
    return snapshot.peec.brandReportOverall as PeecBrandReportRow[];
  }
  setApiMode('peec', 'live');
  return data.data.map((r) => ({
    brand_id: r.brand.id,
    brand_name: r.brand.name,
    share_of_voice: +(r.share_of_voice * 100).toFixed(1),
    visibility: +(r.visibility * 100).toFixed(1),
    sentiment: r.sentiment,
    position: +r.position.toFixed(2),
  }));
}

export async function topCitedDomains(opts: FetchOpts = {}): Promise<PeecDomainReportRow[]> {
  if (!opts.force) return snapshot.peec.topDomains as PeecDomainReportRow[];
  const data = await call<{ data: RawDomainRow[] }>(`/reports/domains`, {
    method: 'POST',
    body: JSON.stringify({
      project_id: PROJECT_ID,
      dimensions: [],
      start_date: DATE_START,
      end_date: DATE_END,
      order_by: [{ field: 'citation_count', direction: 'desc' }],
      limit: 20,
    }),
  });
  if (!data?.data?.length) {
    setApiMode('peec', 'cached');
    return snapshot.peec.topDomains as PeecDomainReportRow[];
  }
  setApiMode('peec', 'live');
  return data.data.map((r) => ({
    domain: r.domain,
    type: r.classification,
    retrieval_count: r.retrieval_count,
    citation_count: r.citation_count,
  }));
}

/**
 * Compose a list of visibility gaps the OWN brand has versus competitor average,
 * per topic.
 */
export async function visibilityGaps(brandId: string, opts: FetchOpts = {}): Promise<VisibilityGap[]> {
  const [topics, ownByTopic, allOverall] = await Promise.all([
    listTopics(opts),
    brandReportByTopic(brandId, opts),
    brandReportOverall(opts),
  ]);
  const others = allOverall.filter((b) => b.brand_id !== brandId);
  const competitorAvg =
    others.length > 0 ? others.reduce((s, b) => s + b.visibility, 0) / others.length : 0;

  return topics.map((t) => {
    const own = ownByTopic.find((r) => r.topicId === t.id);
    return {
      topicId: t.id,
      topicName: t.name,
      visibility: own?.visibility ?? 0,
      competitorAvg,
      shareOfVoice: own?.shareOfVoice ?? 0,
    };
  });
}

export const ATTIO_BRAND_ID = snapshot.peec.ownBrandId;
export const SNAPSHOT_GENERATED_AT = snapshot.generatedAt;
