import type { VisibilityGap } from '../types';

const PEEC_BASE = 'https://api.peec.ai/customer/v1';
const API_KEY = import.meta.env.VITE_PEEC_API_KEY as string | undefined;
const PROJECT_ID = (import.meta.env.VITE_PEEC_PROJECT_ID as string | undefined) ?? '';

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

function emptyToNull<T>(data: { data?: T[] } | null): T[] | null {
  if (!data?.data || data.data.length === 0) return null;
  return data.data;
}

export async function listBrands(): Promise<PeecBrand[]> {
  const data = await call<{ data: PeecBrand[] }>(`/brands?project_id=${PROJECT_ID}`);
  return emptyToNull(data) ?? MOCK_BRANDS;
}

export async function listTopics(): Promise<PeecTopic[]> {
  const data = await call<{ data: PeecTopic[] }>(`/topics?project_id=${PROJECT_ID}`);
  return emptyToNull(data) ?? MOCK_TOPICS;
}

export async function listPrompts(): Promise<PeecPrompt[]> {
  const data = await call<{ data: PeecPrompt[] }>(`/prompts?project_id=${PROJECT_ID}`);
  return emptyToNull(data) ?? MOCK_PROMPTS;
}

export async function brandReportByTopic(brandId: string): Promise<
  Array<{ topicId: string; visibility: number; shareOfVoice: number; sentiment: number }>
> {
  const data = await call<{ data: Array<{ topic_id: string; visibility: number; share_of_voice: number; sentiment: number }> }>(
    `/reports/brands`,
    {
      method: 'POST',
      body: JSON.stringify({
        project_id: PROJECT_ID,
        dimensions: ['topic_id'],
        filters: [{ field: 'brand_id', operator: 'in', values: [brandId] }],
        order_by: [{ field: 'visibility', direction: 'desc' }],
      }),
    },
  );
  const rows = emptyToNull(data);
  if (!rows) return MOCK_BRAND_BY_TOPIC;
  return rows.map((r) => ({
    topicId: r.topic_id,
    visibility: r.visibility,
    shareOfVoice: r.share_of_voice,
    sentiment: r.sentiment,
  }));
}

export async function brandReportOverall(): Promise<PeecBrandReportRow[]> {
  const data = await call<{ data: PeecBrandReportRow[] }>(`/reports/brands`, {
    method: 'POST',
    body: JSON.stringify({
      project_id: PROJECT_ID,
      dimensions: [],
      order_by: [{ field: 'visibility', direction: 'desc' }],
    }),
  });
  return emptyToNull(data) ?? MOCK_BRAND_OVERALL;
}

export async function topCitedDomains(): Promise<PeecDomainReportRow[]> {
  const data = await call<{ data: PeecDomainReportRow[] }>(`/reports/domains`, {
    method: 'POST',
    body: JSON.stringify({
      project_id: PROJECT_ID,
      dimensions: [],
      order_by: [{ field: 'citation_count', direction: 'desc' }],
      limit: 20,
    }),
  });
  return emptyToNull(data) ?? MOCK_DOMAINS;
}

/**
 * Compose a list of visibility gaps the OWN brand has versus competitor average,
 * per topic.
 */
export async function visibilityGaps(brandId: string): Promise<VisibilityGap[]> {
  const [topics, ownByTopic, allOverall] = await Promise.all([
    listTopics(),
    brandReportByTopic(brandId),
    brandReportOverall(),
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

// ────────────────────────────────────────────────────────────
// MOCK DATA — sourced from peec-ai-exploration.md (Attio project snapshot)
// Used when API unreachable, key missing, or project has no recent crawl data.
// ────────────────────────────────────────────────────────────

const MOCK_BRANDS: PeecBrand[] = [
  { id: 'kw_aa69e6a9-2d6b-40be-84a7-77b8bb3a04aa', name: 'Attio', domains: ['attio.com'], is_own: true },
  { id: 'kw_2cb435a5-37da-4b01-9767-f7e878f7ecc2', name: 'HubSpot', domains: ['hubspot.com'] },
  { id: 'kw_5604d168-9e16-4b79-aeec-2628322bb240', name: 'Salesforce', domains: ['salesforce.com'] },
  { id: 'kw_0f576912-e163-4829-a15e-a70238d5fec7', name: 'Pipedrive', domains: ['pipedrive.com'] },
  { id: 'kw_f8720a05-a06d-4702-8fde-d73d071696de', name: 'Zoho', domains: ['zoho.com'] },
];

const MOCK_TOPICS: PeecTopic[] = [
  { id: 'to_c48a31d6-58be-4738-8d02-b88d5df3d0ab', name: 'CRM Automation' },
  { id: 'to_28f787cc-6d83-40ce-a3c6-ead428c6dfa1', name: 'Data Integration' },
  { id: 'to_8f9381cf-7c52-4277-b326-1fbd4d9782d8', name: 'Product-Led Growth' },
  { id: 'to_97cdc70b-1d51-468f-8248-662bd2714176', name: 'Revenue Operations' },
  { id: 'to_1580a71e-41c3-4313-9f83-ff330a1d48dc', name: 'AI in Sales' },
];

const MOCK_PROMPTS: PeecPrompt[] = [
  { id: 'p1', text: 'Best CRM for early-stage startups', topic_id: 'to_c48a31d6-58be-4738-8d02-b88d5df3d0ab' },
  { id: 'p2', text: 'HubSpot vs Salesforce vs Attio comparison', topic_id: 'to_c48a31d6-58be-4738-8d02-b88d5df3d0ab' },
  { id: 'p3', text: 'How to use AI to automate CRM updates', topic_id: 'to_1580a71e-41c3-4313-9f83-ff330a1d48dc' },
  { id: 'p4', text: 'RevOps stack for a 50-person company', topic_id: 'to_97cdc70b-1d51-468f-8248-662bd2714176' },
];

const MOCK_BRAND_BY_TOPIC: Array<{ topicId: string; visibility: number; shareOfVoice: number; sentiment: number }> = [
  { topicId: 'to_c48a31d6-58be-4738-8d02-b88d5df3d0ab', visibility: 18, shareOfVoice: 14, sentiment: 64 },
  { topicId: 'to_28f787cc-6d83-40ce-a3c6-ead428c6dfa1', visibility: 31, shareOfVoice: 19, sentiment: 66 },
  { topicId: 'to_8f9381cf-7c52-4277-b326-1fbd4d9782d8', visibility: 28, shareOfVoice: 22, sentiment: 70 },
  { topicId: 'to_97cdc70b-1d51-468f-8248-662bd2714176', visibility: 15, shareOfVoice: 11, sentiment: 62 },
  { topicId: 'to_1580a71e-41c3-4313-9f83-ff330a1d48dc', visibility: 22, shareOfVoice: 17, sentiment: 65 },
];

const MOCK_BRAND_OVERALL: PeecBrandReportRow[] = [
  { brand_id: 'kw_2cb435a5-37da-4b01-9767-f7e878f7ecc2', brand_name: 'HubSpot', share_of_voice: 30.6, visibility: 77.9, sentiment: 65, position: 2.5 },
  { brand_id: 'kw_5604d168-9e16-4b79-aeec-2628322bb240', brand_name: 'Salesforce', share_of_voice: 27.7, visibility: 73.2, sentiment: 63, position: 3.0 },
  { brand_id: 'kw_aa69e6a9-2d6b-40be-84a7-77b8bb3a04aa', brand_name: 'Attio', share_of_voice: 20.4, visibility: 32.9, sentiment: 64, position: 2.8 },
  { brand_id: 'kw_0f576912-e163-4829-a15e-a70238d5fec7', brand_name: 'Pipedrive', share_of_voice: 12.5, visibility: 36.7, sentiment: 68, position: 4.4 },
  { brand_id: 'kw_f8720a05-a06d-4702-8fde-d73d071696de', brand_name: 'Zoho', share_of_voice: 8.7, visibility: 35.6, sentiment: 68, position: 4.9 },
];

const MOCK_DOMAINS: PeecDomainReportRow[] = [
  { domain: 'youtube.com', type: 'UGC', retrieval_count: 196, citation_count: 96 },
  { domain: 'attio.com', type: 'OWN', retrieval_count: 238, citation_count: 167 },
  { domain: 'monday.com', type: 'CORPORATE', retrieval_count: 155, citation_count: 115 },
  { domain: 'reddit.com', type: 'UGC', retrieval_count: 104, citation_count: 82 },
  { domain: 'salesforce.com', type: 'COMPETITOR', retrieval_count: 81, citation_count: 52 },
  { domain: 'hubspot.com', type: 'COMPETITOR', retrieval_count: 67, citation_count: 62 },
];

export const ATTIO_BRAND_ID = 'kw_aa69e6a9-2d6b-40be-84a7-77b8bb3a04aa';
