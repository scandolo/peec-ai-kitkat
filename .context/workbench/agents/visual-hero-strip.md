# visual-hero-strip — running notes

Agent owns:
- `src/components/InboxHero.tsx` (new)
- `src/styles/inbox-hero.css` (new)
- `src/pages/Inbox.tsx` (small surgical edit only — claimed in `lock.md`)

## Log

- 2026-04-26 — branch renamed to `visual-hero-strip`. Read full-plan, design-system, ownership, status, lock, visual-references. Reviewed `src/pages/Inbox.tsx` and `src/components/InboxRow.tsx` for the `InboxTask` shape. Claimed `src/pages/Inbox.tsx` in `lock.md`. Starting build of `InboxHero` (visibility score + sparkline, weekly opportunity lift, top topic gap with mini bar, agent activity pulse). Inline-mocked `visibility_runs` for the sparkline; everything else derives from `tasks`. Plan: SVG only, CSS keyframes for the agent pulse, single horizontal row sitting on `#fafafa`.
- 2026-04-26 — built `src/components/InboxHero.tsx` and `src/styles/inbox-hero.css`. Four cells: brand visibility (24px headline + delta pill + 7-day sparkline as SVG path/area), queued lift this week (count + summed `estimated_lift × score` × 100 as pp), top topic gap (label + 6px bar with our share filled and a leader-share marker), agent pulse (animated dual-ring pulse via CSS keyframes when latest task <1h old). Topic display uses a per-topic-id lookup so the bar reflects the demo narrative (e.g. PLG CRM 11% vs HubSpot 47%). Surgical edit to `src/pages/Inbox.tsx`: import + render `<InboxHero tasks={tasks} />` directly above `swarm-inbox-page` (no removals — kept the existing header). `npm run typecheck` clean. Vite dev server boots and serves 200 on localhost:5173. Chrome DevTools MCP not available in this session; visual verification deferred to federico (browser open at http://localhost:5173). Ready to merge.
