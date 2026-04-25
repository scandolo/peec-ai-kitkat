# Plan: SWARM — Conquer Every Conversation

## Context
Hackathon project for Big Berlin Hack 2026, Peec AI track (2,500 EUR). The challenge: help an early-stage brand win distribution against bigger competitors.

**Thesis**: Peec is the scoreboard. SWARM is the offense. AI engines learn from the internet — LinkedIn, Reddit, X, blogs. If your brand isn't in those conversations, you're invisible to the next generation of buyers. SWARM gets a 3-person marketing team into every conversation that moves the Peec scoreboard.

**Counter-positioning vs Peec's existing recommendations feature**: Peec already surfaces "get featured here" suggestions but they are static, surface-level, not agentic, and stop short. They don't quantify the visibility lift, don't tell you HOW to engage, and don't drive a next step. **That gap is the product.**

---

## Product: SWARM

**One-liner**: Three always-on AI agents that find every conversation where your brand should show up — quantify the visibility lift in Peec's terms — and hand your team a voice-aware draft scaffold to ship.

**Demo line**: "HubSpot has 78% AI search visibility. Attio has 33%. HubSpot has 200 marketers. Attio has 5. How do 5 people compete? They don't. They SWARM."

---

## Architecture: Three Always-On Agents

Every agent below must trace its output to a quantitative Peec metric. If a feature can't, cut it.

### Agent 1 — Trends Agent (weekly deep research)
- Runs weekly. Crawls world-level + niche-level trends to find where mass attention is heading.
- Output: a ranked list of emerging topics with a forward-looking Peec angle: *"If you publish on this in the next 7 days, expected lift on topic 'Revenue Operations' = +N pp visibility."*
- Why this isn't generic social listening: each trend is scored against the brand's Peec topic gap profile. We only surface trends that move a measured weakness.

### Agent 2 — Brand Context RAG (every mention of us, ever)
- Crawls every public mention of the brand across the web (own content, press, podcasts, founder posts, customer reviews, Reddit threads).
- Builds an embedded context layer the system can RAG into.
- Powers two things:
  1. **Voice grounding** — feeds every Gemini prompt as system-prompt anchor (we are NOT generating polished drafts cold; voice profile is always in context).
  2. **Positioning grounding** — when generating a reply, the agent retrieves the most relevant brand evidence (case studies, real claims, real wording) so suggested angles are factually true and on-message.

### Agent 3 — Conversation Interception (real-time)
- Triggered by Peec visibility gaps. Watches LinkedIn, Reddit, X for live conversations on weak topics, on competitor mentions, and on adjacent/cultural pain points.
- Each opportunity card carries a quantitative Peec impact estimate ("engaging here moves 'CRM Automation' visibility by ~X pp at scale Y") and a draft scaffold in brand voice.
- This is the daily driver. The Radar.

---

## The Flywheel

```
Peec detects invisibility → Trends agent picks high-leverage topics →
Conversation agent finds live posts on those topics →
Brand Context RAG grounds the engagement →
Team ships in the brand's voice →
More mentions in places AI engines crawl →
Peec visibility goes up → loop tightens
```

---

## UX Flow

### Screen 1: Brand Setup (one-time, run *before* demo)
- Brand name, domain, 2-3 competitors
- Sources for voice + context: website URL, founder LinkedIn, sample posts, blog
- On submit: Peec data pulled + Brand Context RAG indexed + Voice Profile extracted
- **Latency note**: this is slow (~2-3 min). We do NOT demo this live. Demo opens on screen 2 with pre-built state, then narrates "this ran overnight."

### Screen 2: The Radar (daily driver, demo opens here)

**Top bar — Visibility Gaps (Peec data)**
```
[CRM Automation: 18%] [AI in Sales: 22%] [Revenue Ops: 15%]
```
Topic chips, click to filter the feed. Anchored to Peec's actual topic IDs.

**Left rail — Trends Agent panel**
- This week's surfaced trends, each with: trend description, related Peec topic, expected lift, "find conversations on this trend" button.

**Main feed — Conversation Cards**
Each card:
- Platform icon (LinkedIn / Reddit / X)
- Post title, first line, author, timestamp
- Relevance score 0-100 with color
- Connection badge: `DIRECT` / `ADJACENT` / `CULTURAL`
- **Peec insight** (the SWARM differentiator vs Peec's static suggestions): "You are invisible for 'CRM Automation'. This thread has 847 views. Engaging here is estimated to lift visibility on this topic by ~X pp."
- "Open draft" button

**Right sidebar — Brand Voice Profile**
- Voice summary: "Witty, anti-enterprise, builder-first"
- Tone sliders (formal↔casual, technical↔accessible, bold↔measured)
- Signature phrases extracted from brand corpus
- "Brand context" section — recent mentions ingested, sample positioning extracts (proof the RAG layer is alive)

### Screen 3: Draft & Deploy (expand a card)
- Original post on the left
- Editable draft scaffold on the right (in brand voice)
  - **NOT a press-send full message.** A scaffold: opener, angle, supporting line, CTA — each editable.
  - 3 angle options below ("Bolder" / "More technical" / "Shorter")
  - "Why this opportunity?" panel linking the Peec gap to this post and citing Brand Context RAG evidence
- "Copy to clipboard" + "Open original" → human-in-the-loop ships it

---

## Voice Engine — honest framing

We are NOT trusting AI to write the final message. The Brand Voice Profile feeds the **system prompt** of every generation call. Output is a **scaffold**, not a finished message. Reframe the value: "SWARM gets you 80% of the way — opener right, angle right, voice right. Human ships."

This is more honest, more sellable, and avoids the live-demo embarrassment of an obviously-AI reply. If Gemini surprises us during build we can dial autonomy up. Start cautious.

---

## Discovery Engine

### Step 1 — Peec → strategic intelligence
- `/reports/brands` → visibility, share of voice, sentiment, position
- `/topics` + `/prompts` → topics where we're weak + the actual prompts buyers ask AI engines
- `/reports/domains` → top cited domains (proof Reddit, LinkedIn matter for AI citations)

### Step 2 — Gemini → query generation in 3 tiers
- **DIRECT**: "best CRM 2026", "HubSpot alternatives"
- **ADJACENT**: "sales pipeline frustration", "startup scaling chaos"
- **CULTURAL**: "spreadsheet CRM horror story", "enterprise software is ugly"

### Step 3 — Tavily → multi-platform search behind a cache layer
```
tavilySearch(query, { include_domains: ["reddit.com"], time_range: "week" })  // LIVE
tavilySearch(query, { include_domains: ["linkedin.com"], cache: "hot" })       // PRE-CACHED
tavilySearch(query, { include_domains: ["x.com"], cache: "hot" })               // PRE-CACHED
```
Cache layer makes the same code path serve live or replayed. Demo flips between live (Reddit) and cached (LinkedIn/X) without the user knowing.

### Step 4 — Gemini → batch relevance scoring (0-100) + Peec impact estimate per result

### 5 Demo-ready Examples (Attio)

| Post | Platform | Type | Why |
|------|----------|------|-----|
| "My startup just hit 50 employees and everything is chaos" | LinkedIn | CULTURAL | Scaling pain = CRM pain. Hits 'Product-Led Growth' gap. |
| "Unpopular opinion: Salesforce is the new legacy ERP" | X | ADJACENT | Anti-enterprise sentiment = Attio's positioning. |
| "What's your tech stack for a 10-person B2B SaaS?" | Reddit | DIRECT | Reddit threads get cited by AI engines (reddit.com = 82 citations in Peec). |
| "Just raised our Series A. 10 things I wish I'd known" | LinkedIn | CULTURAL | Post-raise = need real CRM. Hits 'Revenue Ops' gap. |
| "POV: manually copy-pasting contacts between 4 apps" | X | CULTURAL | Meme about data integration = Attio's value prop. |

---

## Platform Strategy

| Platform | What SWARM surfaces | Live or cached | Engagement style |
|----------|---------------------|----------------|------------------|
| **Reddit** | r/startups, r/SaaS, r/sales recommendation threads, competitor complaint threads | **Live** (Tavily handles Reddit well) | Casual, helpful, mention brand alongside alternatives |
| **LinkedIn** | Founder posts, hot takes, funding announcements | **Pre-cached** (Tavily LinkedIn coverage is uneven) | Substantive, first-person, data-driven |
| **X** | Hot takes, memes about workflow pain, conference commentary | **Pre-cached** | Under 280 chars, witty, personality-forward |

---

## Technical Architecture

No backend — all client-side. API keys in Vite env vars (fine for demo).

```
React Frontend
  ├── Peec AI REST API (X-API-Key auth)
  ├── Tavily Search API (with hot cache layer)
  └── Google Gemini API
```

### File structure
```
src/
  services/
    peec.ts          — Peec REST client
    tavily.ts        — Tavily client + cache layer
    gemini.ts        — Gemini client (queries, scoring, voice, drafts)
    discovery.ts     — Three-agent orchestrator
    cache.ts         — Hot cache for pre-computed Tavily/Gemini results
  agents/
    trends.ts        — Weekly trends agent
    context.ts       — Brand context RAG (build + retrieve)
    interception.ts  — Conversation interception
  components/
    BrandSetup.tsx
    Radar.tsx
    VisibilityBar.tsx
    TrendsRail.tsx
    ConversationCard.tsx
    DraftPanel.tsx
    VoiceProfile.tsx
  data/
    attio-cache.json — Pre-computed demo seed
  types/index.ts
  App.tsx
```

### Performance plan
- Demo opens on **pre-built Radar state** (loaded from `attio-cache.json`)
- One live moment in the demo: click "Regenerate" on a draft → real Gemini call (~2s, feels intentional)
- Optional "Refresh" button runs 1-2 fresh Tavily queries with shimmer loading

### Key data types
```typescript
interface VisibilityGap {
  topicId: string;
  topicName: string;
  visibility: number;        // 0-100, current Peec visibility
  competitorAvg: number;     // 0-100, what competitors hit
  shareOfVoice: number;
}

interface ConversationOpportunity {
  id: string;
  platform: 'linkedin' | 'reddit' | 'x';
  url: string;
  title: string;
  content: string;
  author: string;
  publishedAt: string;
  relevanceScore: number;          // 0-100 from Gemini
  connectionType: 'direct' | 'adjacent' | 'cultural';
  relatedTopicId: string;          // ties back to Peec topic
  peecInsight: string;             // human-readable
  estimatedVisibilityLift: number; // pp lift if we engage at scale
  draftScaffold?: DraftScaffold;
}

interface DraftScaffold {
  opener: string;
  angle: string;
  supporting: string;
  cta: string;
  alternates: { bolder: string; technical: string; shorter: string };
}

interface VoiceProfile {
  summary: string;
  traits: string[];
  toneSpectrum: { formality: number; technicality: number; boldness: number; humor: number; warmth: number };
  signaturePhrases: string[];
  taboos: string[];
  engagementStyle: string;
  brandContextSummary: string;     // RAG-derived positioning summary
}

interface Trend {
  id: string;
  title: string;
  description: string;
  surface: 'world' | 'niche';
  relatedTopicId: string;          // Peec topic
  expectedLiftPp: number;
  evidence: string[];              // URLs Tavily found
}
```

---

## Partner Tech (3 required)

1. **Google DeepMind (Gemini)** — query generation, relevance scoring, voice extraction, draft scaffolds, trend summarization
2. **Tavily** — discovery engine (Reddit live, LinkedIn/X pre-cached)
3. **Lovable** — used for UI iteration during build (we will iterate the Radar UI in Lovable, then port the polished components)

**Side challenge**: Aikido for "Most Secure Build" (free 1,000 EUR) — connect repo before demo

---

## Demo Flow (target 1:45, hard cap 2:00)

**[0:00-0:15] Hook**
"HubSpot has 78% AI search visibility. Attio has 33%. HubSpot has 200 marketers. Attio has 5. How do 5 people compete? They don't. They SWARM."

**[0:15-0:35] Problem framing — Peec is the scoreboard**
"Peec AI shows you which AI search topics you're losing. It even suggests where to engage. But it stops there — no impact estimate, no draft, no next step."
*Show real Peec data screenshot: Attio's low visibility, top cited domains.*

**[0:35-1:05] Product reveal — three agents working for you**
"SWARM picks up where Peec stops. Three always-on agents."
*Open the Radar (pre-built). Quick narrate:*
- Trends rail: "this week, your weak topics are trending — here's where attention is heading."
- Visibility gap pills (Peec data live).
- Feed of conversations.
- Voice profile sidebar with brand context.

**[1:05-1:30] The non-obvious magic + Peec quantification**
"It doesn't just find CRM posts. It finds THIS —"
*LinkedIn 50-employees post. CULTURAL badge. Peec insight: "Engaging here is estimated to lift 'Product-Led Growth' visibility by ~3pp."*
"— and generates THIS scaffold in Attio's voice."
*Click "Regenerate" — live Gemini call. ~2s.*

**[1:30-1:45] Flywheel + Close**
"Peec measures. SWARM moves the number. Three marketers, every conversation. SWARM."

---

## Build Sequence (Saturday + Sunday morning)

### Saturday morning — pipeline
- [ ] Scaffold Vite + React + TS with Peec design tokens
- [ ] `peec.ts` (Daavid) — fetch visibility gaps, topics, prompts, top domains using Attio project IDs
- [ ] `gemini.ts` (Scando) — queries, scoring, voice extraction, draft scaffolds
- [ ] `tavily.ts` (Muna) — search wrapper + cache layer
- [ ] `discovery.ts` — orchestrator wiring three agents
- [ ] Pre-process Attio dataset → curate 15 great cards into `attio-cache.json`

### Saturday afternoon — UI
- [ ] Radar feed + ConversationCard + VisibilityBar
- [ ] DraftPanel with scaffold generator
- [ ] VoiceProfile sidebar
- [ ] TrendsRail (basic — can be hardcoded with Gemini-summarized trends if time-tight)

### Saturday evening — polish
- [ ] Brand voice tuning for Attio (make scaffolds genuinely Attio-sounding)
- [ ] Loading states, badges, platform icons, score colors
- [ ] Aikido side-challenge wiring
- [ ] Run demo end-to-end on a clean state, time it

### Sunday morning — demo
- [ ] Record 2-min video as backup
- [ ] README with setup, architecture, partner tech
- [ ] Final pre-cache of Tavily results, sanity check

---

## Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| Tavily LinkedIn freshness flaky on stage | LinkedIn pre-cached; Reddit is the live demo platform |
| Gemini scaffolds sound generic | Voice profile + Brand Context RAG as system-prompt anchor; few-shot with real Attio posts |
| Quantitative Peec impact estimates feel made up | Use a transparent formula: lift = f(post reach × topic citation rate from `/reports/domains` × visibility gap). Show formula in tooltip. |
| Live API call during demo fails | Cache layer. Even "live" calls have a cached fallback. |
| Trends agent feels disconnected from Peec | Every trend output is anchored to a Peec topic ID with an expected lift number. No anchor, no surface. |
| 24h build slips | Trends agent is the most cuttable. Conversation interception (the Radar) is the hero. Build in priority order. |

---

## Open Decisions
- **Brand for demo**: Attio confirmed. Optional second brand (Nothing) as bonus only if time.
- **Name**: SWARM. Locked.
- **Visual identity**: matches Peec's design system (Geist, monochrome #171717 base, semantic accents). Positions us as a complement, not a competitor.
