/**
 * Brand Context Agent — the RAG layer.
 *
 * Indexes everything public the brand has said about itself so every Gemini
 * call we make is grounded in real positioning rather than generic Gemini
 * knowledge. Output: a small in-memory index. Future: replace the keyword
 * scoring with embeddings.
 */

import type { BrandContextChunk, BrandContextIndex } from '../types';

const STOPWORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should',
  'to', 'of', 'in', 'on', 'at', 'for', 'with', 'by', 'from', 'about', 'as',
  'this', 'that', 'these', 'those', 'it', 'its', 'we', 'our', 'you', 'your',
  'i', 'me', 'my', 'so', 'than', 'then', 'just', 'not', 'no', 'yes',
]);

function keywordize(text: string): string[] {
  return Array.from(
    new Set(
      text
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter((w) => w.length > 2 && !STOPWORDS.has(w)),
    ),
  );
}

/**
 * Build the index from a brand corpus. Each chunk is small (1-3 sentences),
 * tagged with the topic IDs it speaks to, and pre-tokenized for retrieval.
 */
export function buildContextIndexFromCorpus(
  brand: { name: string; domain: string },
  corpus: Array<Omit<BrandContextChunk, 'id' | 'keywords'>>,
  summary: string,
): BrandContextIndex {
  const chunks: BrandContextChunk[] = corpus.map((c, i) => ({
    ...c,
    id: `${brand.name.toLowerCase()}-${i}`,
    keywords: keywordize(`${c.text} ${(c.topicIds ?? []).join(' ')}`),
  }));
  return { brandName: brand.name, brandDomain: brand.domain, chunks, summary };
}

/**
 * Retrieve the top-k chunks most relevant to a query (the user's post text,
 * the topic name, etc.). Simple keyword overlap with a tiny topic-match boost.
 */
export function retrieveRelevant(
  index: BrandContextIndex,
  query: string,
  opts: { k?: number; topicId?: string } = {},
): BrandContextChunk[] {
  const k = opts.k ?? 3;
  const queryTokens = new Set(keywordize(query));
  if (queryTokens.size === 0) return index.chunks.slice(0, k);

  const scored = index.chunks
    .map((chunk) => {
      let score = chunk.keywords.reduce((acc, kw) => (queryTokens.has(kw) ? acc + 1 : acc), 0);
      if (opts.topicId && chunk.topicIds?.includes(opts.topicId)) score += 2;
      return { chunk, score };
    })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, k).map((s) => s.chunk);
}

/**
 * The Attio brand context corpus. Hand-curated for the demo, but shaped like
 * what a future ingestion pipeline would produce (homepage / blog / founder
 * posts / customer quotes). Each chunk references real Attio messaging.
 */
export const ATTIO_CONTEXT_CORPUS: Array<Omit<BrandContextChunk, 'id' | 'keywords'>> = [
  {
    source: 'https://attio.com',
    sourceType: 'homepage',
    text: 'Attio is the modern, customizable CRM that scales with your business. Powerful, flexible, and data-driven — built for teams that want a CRM that feels like the rest of their stack.',
    topicIds: ['to_c48a31d6-58be-4738-8d02-b88d5df3d0ab', 'to_28f787cc-6d83-40ce-a3c6-ead428c6dfa1'],
  },
  {
    source: 'https://attio.com/customers',
    sourceType: 'case_study',
    text: 'Modal, Replicate, Vercel, Granola, and other category-defining startups run their pipeline on Attio. Setup takes minutes, not weeks. No admin required.',
    topicIds: ['to_8f9381cf-7c52-4277-b326-1fbd4d9782d8', 'to_c48a31d6-58be-4738-8d02-b88d5df3d0ab'],
  },
  {
    source: 'https://attio.com/automations',
    sourceType: 'blog',
    text: 'Attio Automations let you trigger AI agents on real-time data. Enrich contacts, route leads, draft replies — without piping data through Zapier or Salesforce Flow.',
    topicIds: ['to_1580a71e-41c3-4313-9f83-ff330a1d48dc', 'to_c48a31d6-58be-4738-8d02-b88d5df3d0ab'],
  },
  {
    source: 'https://attio.com/blog/why-now',
    sourceType: 'blog',
    text: 'CRMs were built when data was static and reps did the typing. The next generation is API-first, AI-native, and respects your time. We are building Attio for that world.',
    topicIds: ['to_1580a71e-41c3-4313-9f83-ff330a1d48dc', 'to_97cdc70b-1d51-468f-8248-662bd2714176'],
  },
  {
    source: 'https://www.linkedin.com/in/nicolasdessaigne',
    sourceType: 'founder_post',
    text: 'Spent 14 hours last week trying to bend Salesforce to a basic workflow. The reason modern teams pick Attio: it bends to you, not the other way around.',
    topicIds: ['to_c48a31d6-58be-4738-8d02-b88d5df3d0ab'],
  },
  {
    source: 'https://attio.com/data-model',
    sourceType: 'docs',
    text: 'Attio\'s data model is fully customizable — every object, every attribute. Sync from any source: stripe, calendar, email, your product DB. RevOps without spreadsheets.',
    topicIds: ['to_28f787cc-6d83-40ce-a3c6-ead428c6dfa1', 'to_97cdc70b-1d51-468f-8248-662bd2714176'],
  },
  {
    source: 'https://attio.com/blog/funded-companies',
    sourceType: 'blog',
    text: 'Series A and B teams switch to Attio when their existing CRM stops growing with them. Modern UI, transparent pricing, no contractual lock-in. The CRM the next decade is built on.',
    topicIds: ['to_8f9381cf-7c52-4277-b326-1fbd4d9782d8', 'to_97cdc70b-1d51-468f-8248-662bd2714176'],
  },
  {
    source: 'https://attio.com/pricing',
    sourceType: 'homepage',
    text: 'Pricing scales linearly with seats. No 3-year contracts, no surprise add-ons. Free tier for early-stage, growth plan for funded teams. The opposite of enterprise procurement.',
    topicIds: ['to_8f9381cf-7c52-4277-b326-1fbd4d9782d8', 'to_c48a31d6-58be-4738-8d02-b88d5df3d0ab'],
  },
];

export const ATTIO_CONTEXT_SUMMARY =
  'Attio is the modern, design-led, API-first CRM positioned against Salesforce/HubSpot. Used by Modal, Replicate, Vercel, Granola. Strengths: speed of setup, customizable data model, AI-native automations, transparent pricing. Anti-enterprise, builder-first, witty.';

export function buildAttioContextIndex(): BrandContextIndex {
  return buildContextIndexFromCorpus(
    { name: 'Attio', domain: 'attio.com' },
    ATTIO_CONTEXT_CORPUS,
    ATTIO_CONTEXT_SUMMARY,
  );
}
