# agent-arch — running notes

Owner: federico + claude (this chat). Branch: `agent-arch`. Owns: `src/agents/`, `src/services/discovery.ts`, `src/types/index.ts`, `.context/plans/full-plan.md`, `.context/workbench/status.md`, `.context/workbench/ownership.md`.

Goal: build the three SWARM agents (Trends / Brand Context RAG / Conversation Interception) as proper backend modules, refactor `discovery.ts` to be a thin orchestrator over them, and keep the workbench in sync.

## Backlog

- [ ] Create `src/agents/trends.ts` — weekly deep research producing `Trend[]` anchored to Peec topics + expected lift.
- [ ] Create `src/agents/context.ts` — Brand Context RAG: ingest brand corpus (own site, founder LI, sample posts), build embedded index, expose `retrieveRelevant(query) → BrandContextChunk[]`.
- [ ] Create `src/agents/interception.ts` — current Conversation Interception logic moved out of `discovery.ts`.
- [ ] Refactor `src/services/discovery.ts` to call the three agents and compose their outputs.
- [ ] Update `src/types/index.ts` with `BrandContextChunk` and any new agent contracts.
- [ ] Add a deterministic Peec impact estimator (`estimateLift(post, gap, voice) → pp`) shared across agents.

## Notes

- Voice profile feeds the system prompt of every Gemini call (decided 2026-04-25). Brand Context RAG is the retrieval layer that grounds every reply in real positioning, not generic Gemini knowledge.
- Agents must surface a quantitative Peec metric or be cut.

## Log

- 2026-04-25 — Bootstrapped workbench, copied Peec screenshots to `.context/peec-references/`, copied logo to `public/peec-logo.jpg`. Branch `agent-arch` created from `main` (SHA `8ffb983`).
- 2026-04-25 — `live-apis` shipped `src/data/snapshot.json` and made services snapshot-default with `force` opts to refresh. `getApiStatus()` registry exposed. `ui-polish` polished ConversationCard, added `.peec-row` table-row hover, modal scrim/animations, btn variants, SWARM logo classes. Both look solid.
- 2026-04-25 — Starting agent-arch refactor: split `discovery.ts` into `src/agents/{trends,context,interception}.ts`, add `BrandContextChunk` type, build a hardcoded Attio brand-context index for the RAG layer, fix the `own.domain → own.domains[0]` bug introduced by live-apis' new `PeecBrand.domains: string[]` shape, wire `force` through.
- 2026-04-25 — Shipped on `agent-arch`: 3 agent modules + `discovery.ts` orchestrator + `BrandContextIndex` types + Attio context corpus (8 hand-written chunks). Verified my slice typechecks BOTH against live-apis's new service signatures AND against the older signatures at HEAD (so the branch is mergeable independently). Stripped `force` opts from service calls — services own snapshot/live decision today; reintroduce when live-apis lands `FetchOpts`. Ready to merge once live-apis lands.
