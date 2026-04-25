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

- 2026-04-25 — Bootstrapped workbench, copied Peec screenshots to `.context/peec-references/`, copied logo to `public/peec-logo.jpg`. Branch `agent-arch` created from `main` (SHA `8ffb983`). Next: scaffold `src/agents/` modules.
