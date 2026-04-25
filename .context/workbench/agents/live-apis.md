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

- _empty — agent has not started yet._
