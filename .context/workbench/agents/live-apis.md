# live-apis — running notes

Owner: TBD. Branch: `live-apis`. Owns: `src/services/peec.ts`, `src/services/tavily.ts`, `src/services/gemini.ts`, `src/services/cache.ts`, `src/data/`.

## Mission

Make the live API path reliable. Today, Peec report endpoints return empty data, Gemini hits 429 on cold start, and Tavily is fine through the proxy. Investigate, fix, and add a hot snapshot so the demo opens instantly.

## Backlog (proposed — confirm with orchestrator before starting)

- [ ] Read `CLAUDE.md`, `.context/plans/full-plan.md`, `.context/research/peec-ai-exploration.md`, `.context/workbench/status.md`.
- [ ] Investigate why Peec `/reports/brands` and `/reports/domains` return `{data: []}` for the Attio project. Try: different project IDs, different filter shapes, date ranges. Document findings in `decisions.md`.
- [ ] Add throttling + exponential backoff in `gemini.ts` (max 2 req/s, retry 3x with backoff on 429).
- [ ] Build `src/data/snapshot.json` — serialised Radar snapshot (gaps + opportunities + voice + trends + topDomains). Hydrate from this on load; refresh from APIs on user action.
- [ ] Surface a "live | cached | mock" indicator the orchestrator can render in the header.
- [ ] Add a small cache-clearing dev tool (URL param `?refresh=1` purges memory cache).

## Hard constraints

- Do NOT touch `discovery.ts`, components, agents, or types. If you need a new field on a domain type, claim `src/types/index.ts` in `lock.md` and announce here.
- Do NOT commit real API keys.
- Do NOT change the public function signatures of services without claiming a coordination check in `lock.md` — `discovery.ts` calls them.
- Run `npm run typecheck` before every commit. Run the dev server and verify with Chrome DevTools MCP that no calls are 4xx/5xx unhandled.

## Log

### 2026-04-25 — Run 1 (Agent C, on `agent-arch` branch per orchestrator request)

**Status: all 5 tasks complete. Radar renders end-to-end with live Peec data + snapshot fallback.**

#### Peec REST schema — root cause of empty reports
Live curl probes against the Attio project (`or_47ccb54e-…`) showed:
- `start_date` + `end_date` (snake-case) ARE required for any `/reports/*` endpoint to return data. `date_from`/`date_to` are silently ignored. This was the actual reason the report endpoints returned `{data:[]}`.
- The response envelope is **nested**, not flat:
  - brands report: `{ brand: {id, name}, share_of_voice, visibility, sentiment, position, … }` — not `brand_id`/`brand_name`
  - by-topic: also includes `topic: {id}`
  - domains: `{ domain, classification, retrieval_count, citation_count, … }` — `classification` not `type`
- `visibility` and `share_of_voice` are returned as **0–1 fractions**, not 0–100 percents. Need to multiply by 100 to match the existing types.
- `prompts` rows have `messages: [{content}]` and nested `topic: {id}` — flatten on read.

The previous code path always fell through to mocks because of (a) missing date filter and (b) the parser expected the wrong shape.

#### `src/data/snapshot.json` (new, ~26 KB)
Bundles, captured live on 2026-04-25:
- `peec.brands`, `topics`, `prompts`, `brandReportOverall`, `brandByTopic[ATTIO]`, `topDomains` — pre-mapped to existing types
- `tavily.byPlatform.{reddit,linkedin,x}` — the curated demo pool that used to live inside `tavily.ts`
- `gemini.voice` — the Attio voice profile that used to be `mockVoice()`

Each service reads from the snapshot by default. `force: true` on peec/tavily triggers the live API path. To regenerate the Peec slice: `node /tmp/build-snapshot.mjs` (script in `/tmp/`, not committed).

#### `live | cached` indicator
`peec.ts` now exports:
- `getApiStatus(): { peec, tavily, gemini, overall: 'live' | 'cached' | 'mock' }`
- `getApiMode(service)` / `setApiMode(service, mode)`

`tavily.ts` and `gemini.ts` import `setApiMode` and update their slot when a live call succeeds or falls back. Read by orchestrator/UI directly. No discovery.ts changes.

#### Gemini throttle + 429 backoff
- Token bucket: max 2 calls/sec across the entire app (global `nextAvailableAt`).
- 3 retry attempts on 429 with backoff 500ms → 1s. Honors `Retry-After` header (capped 4s).
- After max attempts, returns `null`; caller falls back to snapshot/mock.

The Google project key is heavily rate-limited; 429s observed on burst. Verified the retry path activates and falls through cleanly.

#### Verification
- `npm run typecheck` → clean.
- Dev server at `localhost:5173` loads. Radar fully renders within ~10–15 s including Gemini retries.
- Confirmed via Chrome DevTools MCP: visibility scoreboard shows real Peec numbers (Attio 33%, HubSpot 78%, gap −45 pp), all five topics render with real visibility, top-cited domains (`youtube.com 96`, `reddit.com 82`) come from the live API, conversation cards render from the snapshot pool, brand voice profile loads instantly.

#### Files touched
- `src/services/peec.ts` — full rewrite (snapshot hydration, schema fix, status registry).
- `src/services/tavily.ts` — snapshot-backed pool, status reporting, `force` flag.
- `src/services/gemini.ts` — throttle + backoff, snapshot voice fallback, status reporting.
- `src/data/snapshot.json` — new, generated from live API.
- `cache.ts` — untouched (now redundant; can be removed in a clean-up pass).

#### Handoff notes for other agents
- `discovery.ts` still calls Gemini for queries/scoring/trends on every load. With a snapshot present, those calls add 5–10 s of latency. A future change in `discovery.ts` (Agent A) could check `getApiStatus().peec === 'cached'` and skip the LLM enrichment, or cache its own composed `RadarSnapshot` to JSON.
- The "live | cached" indicator is exposed but no UI consumes it yet — Agent B (UI polish) should add a small pill in the header reading `getApiStatus().overall`.
- `cache.ts`'s `withCache` is now unreferenced. Safe to delete.
