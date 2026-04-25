# ui-polish — running notes

Owner: TBD. Branch: `ui-polish`. Owns: `src/components/`, `src/styles/`, `public/` (asset additions only).

## Mission

Make SWARM feel like a true Peec AI extension. The current Radar uses Peec's CSS tokens but composes them in a generic way. The actual Peec UI (see `.context/peec-references/` and `visual-references.md`) has a dark sidebar + cream content area + filter chip bar + breadcrumbs + denser tables. Close the gap.

## Backlog (proposed — confirm with orchestrator before starting)

- [ ] Read `CLAUDE.md`, `.context/plans/full-plan.md`, `.claude/commands/design-system.md`, `.context/workbench/status.md`, `.context/workbench/visual-references.md`. Look at all 4 screenshots in `.context/peec-references/`.
- [ ] Build `src/components/Sidebar.tsx` — dark left rail matching the Peec layout.
- [ ] Replace the white top bar in `src/App.tsx` with a thin dark top bar (need to claim `App.tsx` in `lock.md` — it's orchestrator-owned).
- [ ] Add `src/components/FilterBar.tsx` — pill-shaped dropdown filters above the feed.
- [ ] Build out `src/components/DraftPanel.tsx` (currently a stub) so clicking "Open draft" on a card opens a real modal with original-post / draft-scaffold / regenerate / 3 angle options.
- [ ] Make cards denser, add hover-row pattern for the feed.
- [ ] Wire the real `peec-logo.jpg` into the header (replace placeholder dots).
- [ ] Polish: card hover lift, pill press states, sidebar sticky behaviour.

## Hard constraints

- Do NOT touch services, agents, types, or config. If you must, claim in `lock.md` and announce here.
- Run `npm run typecheck` before every commit.
- Use Chrome DevTools MCP to verify each change visually. Take a screenshot before and after.
- Append a dated bullet to this file at the end of every turn.

## Log

- _empty — agent has not started yet._
