# Status — SWARM build

Last updated: 2026-04-25 (orchestrator)

## Current state

- Vite + React + TS scaffold rendering on `localhost:5173`. Mock-fallback discovery returns 16 deduped opportunity cards, voice profile, trends rail, visibility scoreboard.
- Peec API key works for `/brands` and `/topics`. Report endpoints accept the schema but project has no chat data — services degrade to rich mocks (sourced from `peec-ai-exploration.md`).
- Tavily proxied through Vite at `/_tavily`; CORS resolved. Falls back to curated mock pool when API errors.
- Gemini hits 429 on cold start — services degrade gracefully, mocks render.
- Branch state: `main` and `swarm-build` at the same SHA. Orchestrator is on `agent-arch` continuing.

## Active workstreams

| Branch | Agent | Status | Owner |
|---|---|---|---|
| `agent-arch` | Agent architecture (Trends / Brand Context RAG / Conversation Interception) | in progress | federico + claude (this chat) |
| `ui-polish` | UI fidelity — make it feel like a Peec extension | pending dispatch | TBD |
| `live-apis` | Live API integration + reliability | pending dispatch | TBD |
| `demo-data` | Hand-curated demo dataset + script | not yet | TBD |

## Open blockers

- None right now. The mocks are good enough that any agent can render the full UI without live keys.

## Visual fidelity gap (notes for ui-polish)

Peec's actual UI (see `.context/peec-references/`) has:
- **Dark left sidebar** (~220px), dark top bar, cream/white content area. Our current Radar has a white top bar and no sidebar.
- **Filter chip bar** above content (`Fyxer ▾  All time ▾  All Tags ▾  All Models ▾`).
- **Breadcrumb** at top of content area (`Sources › Domains`).
- Cards sit on cream `#fafafa` page bg with subtle shadow, not on white.
- Sidebar has section labels (General / Sources / Actions / Agent analytics / Project / Company) with small icons.
- "Get set up" progress widget at bottom-left of sidebar.

The real Peec logo is in `public/peec-logo.jpg` (jpg, transparent-ish on light). Stacked rounded rectangles + "Peec AI" wordmark.

## Latest decisions

See `decisions.md`.
