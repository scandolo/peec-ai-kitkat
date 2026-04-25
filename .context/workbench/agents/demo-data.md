# demo-data — running notes

Owner: TBD. Branch: `demo-data`. Owns: `src/data/curated/`, `.context/demo/`. Optional workstream — fire only after `agent-arch` and `ui-polish` are stabilising.

## Mission

Hand-curate the perfect Attio demo seed: 12 cards (4 DIRECT / 4 ADJACENT / 4 CULTURAL) with bulletproof copy, real-looking timestamps, and quantitative Peec impact numbers that judges can't poke holes in. Write the final 90s demo script.

## Backlog

- [ ] Read everything in `.context/`, especially `.context/research/peec-ai-exploration.md` and `.context/plans/full-plan.md`.
- [ ] Curate 12 cards in `src/data/curated/attio.json` — each card must include real-looking author, platform, post body, score, peec insight, lift estimate, and a draft scaffold.
- [ ] Cross-check: does each card's lift estimate make sense given the topic gap? Use the formula in `full-plan.md`.
- [ ] Write `.context/demo/script.md` — final 90s spoken script with timing marks, a fallback if a live call fails, and the "Refresh" beat.
- [ ] Suggest the camera pacing for screenshare (which card to scroll to, when to click "Regenerate", etc.).

## Hard constraints

- Do NOT touch services, components, agents, or types.
- Read others' files but never edit them.
- Append a dated bullet to this file at the end of every turn.

## Log

### 2026-04-25 — Initial pass (turn 1)

**Done**

- `src/data/attio-curated.json` — 12 hand-curated Attio cards committed.
  - 4 DIRECT, 4 ADJACENT, 4 CULTURAL — verified via python counter.
  - 5 LinkedIn / 4 Reddit / 3 X — biased toward LinkedIn because the hero card is LinkedIn and Attio's voice fits there. Reddit is where Tavily lands live so 4 is the sweet spot.
  - All 5 mock topic IDs from `peec.ts` covered (CRM Automation 18, Data Integration 31, PLG 28, RevOps 15, AI in Sales 22).
  - All 12 carry `draftScaffold` (opener / angle / supporting / cta + bolder/technical/shorter alternates) so the demo never depends on a live Gemini call landing.
  - Lift values match the formula in `gemini.ts` (`clamp((100 - topicVisibility) * (relevanceScore/100) * 0.04, 0.5, 6)`) — recomputed all 12 by hand.
  - **Hero card**: `swarm-attio-001` — LinkedIn "50 employees and everything is chaos" — CULTURAL, score 94, lift +2.7pp on PLG. Highest score so it sorts to the top of the feed automatically.
- `.context/demo/script.md` — final 90s script with timing marks, pre-flight checklist, and backup cut lines.
  - One live moment: "Regenerate" on hero card scaffold (~2s Gemini call).
  - Hard cap 1:45, target 1:30, 15s buffer.

**Path note for orchestrator**

User prompt specified `src/data/attio-curated.json`; the workbench backlog says `src/data/curated/attio.json`. I followed the user prompt. If you want the directory layout, easy rename — flag and I'll move it next turn.

**Decisions made**

- Cards include `draftScaffold` even though `DraftPanel.tsx` always calls Gemini live today. Two reasons: (1) if Agent C wires a fallback that prefers the curated scaffold when the Gemini key is missing, the demo improves immediately; (2) it documents the "this is what good looks like" target for the live generator. Out of scope to wire — flagging for Agent A / C.
- `_meta` block at the top of the JSON documents the topic→visibility map and the demo hero ID. Future loaders can ignore it.
- Author names are plausibly real but invented; URLs are shaped like real ones but won't resolve. Intentional — we don't want a judge clicking through to a fake "Sarah Chen" post and finding nothing. Swap to real URLs pre-record if we want them.
- Posts dated 2026-04-15 → 2026-04-24 — all "this week" relative to demo day. `formatRelativeTime` in `ConversationCard.tsx` will render them as "1d ago" / "3d ago" etc.

**Open questions for orchestrator (Agent A)**

1. **Loader wiring**: nothing imports `src/data/attio-curated.json` yet. Either `discovery.ts` should prefer the file when keys are missing, or `App.tsx` should short-circuit to it for the demo. Out of my scope — flagging for A or C.
2. **Hero card swap**: if you'd rather lead with a DIRECT card (e.g. card #2 — Reddit "10-person tech stack") because it's more obviously CRM-shopping, the script's [0:50–1:15] section needs a 2-line edit. I think CULTURAL is the better wedge (Peec's static recs would never surface it) but flagging the call.

**Validation**

```
total: 12
by type: Counter({'cultural': 4, 'direct': 4, 'adjacent': 4})
by platform: Counter({'linkedin': 5, 'reddit': 4, 'x': 3})
topic ids unique: 5
all have drafts: True
```

JSON well-formed; lifts match formula; shape matches `ConversationOpportunity` from `src/types/index.ts` plus an optional `_meta`.

**Not done / out of scope this turn**

- No edits to components or services. Did not touch `App.tsx`, `discovery.ts`, `gemini.ts`, `Radar.tsx`, `DraftPanel.tsx`, `ConversationCard.tsx`.
- No real LinkedIn/Reddit/X URL hunting — left invented.
- No second-brand cards (Nothing, BYD) — Attio only per current plan.
- No video recording / asset prep.
