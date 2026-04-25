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

- **2026-04-25 — first pass: density + DraftPanel + logo + micro-interactions.**
  - Read `CLAUDE.md`, `.context/plans/full-plan.md`, `.claude/commands/design-system.md`, `/tmp/attachments/Summary of Review Plan.md`. (No `status.md` existed at the time — workbench dispatch context lived only in the review-plan transcript.)
  - **Style primitives** (`src/styles/app.css`):
    - Added `.peec-row` for table-style hover (#f6f6f6 hover, #ececec active, 1px lift).
    - Added `.peec-input` (focus ring matches Peec's blue 2-ring focus pattern).
    - Added `.peec-eyebrow`, `.peec-section-head`, `.peec-divider`, `.peec-scrim` + modal enter animation.
    - Added `.peec-btn-sm` and `.peec-btn-ghost` variants. Tightened default `.peec-btn` (32→30px height, smaller font).
    - Added `button.peec-pill` press state (scale 0.97, brightness shift). Default pill size dropped to 11px to match Peec's caption scale.
    - Added `.swarm-logo` / `.swarm-wordmark` classes for the new mark.
  - **ConversationCard** rewritten to a dense table-row composition:
    - Whole card is now clickable (role=button, Enter/Space, Draft button stops propagation).
    - Platform glyph (R/in/𝕏) replaces wordy platform pill.
    - Tighter spacing, line-clamped body, integrated Peec impact callout with sparkle glyph + lift number on the right.
    - Score chip color-graded green/amber/muted.
  - **Radar** rewritten so the Conversations feed sits inside one card with a `peec-section-head` (matches Peec's panel header pattern). Active filter shows up as a removable chip in the header. Empty state has a "Clear filter" CTA. Grid collapsed to 280/1/320 with 12px gap.
  - **VisibilityBar**: bigger headline numbers (Display + H1 sizes), "vs" between own brand and leader, gap-to-leader badge top right, denser topic chips with active state filling the chip with the topic's color.
  - **TrendsRail**: smaller sticky panel with header row, surface label is a tiny 9.5px badge, gap percentage is its own pill, trend cards use `.peec-row` so hover lifts. Lift indicator now has a chevron-up glyph.
  - **VoiceProfilePanel**: section-head pattern for both cards, eyebrows separating Tone / Signature phrases / Brand context with `.peec-divider` between them. UGC list now renders as a borderless inner table with row hover.
  - **Header** extracted to `src/components/Header.tsx` (one-line swap in `App.tsx`):
    - 12px height (was 14), backdrop blur on the white, ghost-style Refresh button with a real refresh glyph (spins while refreshing).
    - New SwarmMark: 26x26 black tile, custom SVG (apex node + two relay nodes connected by lines = "swarm" graph), Geist 700 wordmark.
    - Brand pill is now a real button with avatar dot + chevron, ghost variant.
    - Powered-by-Peec pill uses `--peec-table-selected` (the blue tint) with a tiny live-dot glyph.
  - **DraftPanel** completely rebuilt:
    - Editable `<textarea>` ScaffoldFields with auto-resize and char counters (the old version had read-only `<p>` tags despite saying "Edit each part").
    - Esc-to-close + body scroll lock + initial focus on close button.
    - Fade-in scrim with 2px backdrop-blur, modal scale-in animation.
    - 5/7 split (left: original post + Why-this-opportunity card; right: scaffold).
    - Action toolbar with Bolder/Technical/Shorter buttons that stay highlighted when active, plus a Regenerate ghost button with spinning glyph during loading.
    - Sticky bottom action bar: char count + section count, Copy text + primary "Copy & open original" with success state.
    - Fixed copy bug: now joins truthy fields only, won't crash on empty.
  - **Verification**:
    - `npm run typecheck` clean.
    - Loaded Radar in Chrome DevTools MCP at 1440×900, screenshot saved to `/tmp/swarm-after.png`. Hover lifts cards correctly, sidebar stays sticky on scroll (`/tmp/swarm-scroll.png`), topic-chip filter activates and shows removable header chip with "x / total" count (`/tmp/swarm-filter.png`).
    - Opened draft modal — fields are now actually editable, char counts update, all action buttons present, layout balanced (`/tmp/swarm-draft-modal.png`).
  - **Files touched (in scope):** `src/styles/app.css`, `src/components/ConversationCard.tsx`, `src/components/Radar.tsx`, `src/components/VisibilityBar.tsx`, `src/components/TrendsRail.tsx`, `src/components/VoiceProfilePanel.tsx`, `src/components/DraftPanel.tsx`, **new** `src/components/Header.tsx`.
  - **Files touched (one-line out-of-scope edit):** `src/App.tsx` — only to import + render the extracted `Header`. Logic unchanged. Flagging here for the orchestrator since `App.tsx` is technically in their column.
  - **Open follow-ups for the next ui-polish turn:**
    - Build `Sidebar.tsx` for a Peec-style dark left rail (still missing — current layout is one bar + content). Today's polish made the *content area* feel right; the global chrome is still a single horizontal header.
    - Wire the real `peec-logo.jpg` from `peec-references/` if we want the brand pill to show a logo instead of an avatar dot.
    - Consider adding a `FilterBar` with platform/connection/score chips between VisibilityBar and the feed.
    - The 30+ second initial load is jarring — coordinate with `live-apis` agent on a hydration snapshot.

- **2026-04-26 — orange reduction.**
  - Federico flagged that orange wasn't actually used in the live Peec dashboard. (Was using orange for: full-tile Reddit glyph, visibility chips in the 20–30% band, score chips in the 70–85 band, trends-rail gap pills for any sub-50% gap.) The Peec design system *defines* orange as a token but reserves color for genuine semantics — the orange uses had crept beyond that.
  - **Visibility chips** (`VisibilityBar.tsx`): collapsed the 4-tier color ramp to 3 — rose only below 25%, neutral grey 25–60%, green at 60+. No more orange or amber bands.
  - **Score chips** (`ConversationCard.tsx`): dropped the amber 70–84 tier; only ≥85 gets the green badge, everything else is neutral grey.
  - **Platform glyphs** (`ConversationCard.tsx`): all three platform tiles now use the shared neutral `--peec-bg-secondary` background. Reddit "R" keeps orange *text* (subtle brand cue), LinkedIn keeps blue text, X stays primary-fg. Reddit's tile is no longer a saturated orange block.
  - **Trends rail gap pills** (`TrendsRail.tsx`): switched from always-rose to a conditional — rose only for genuinely low gaps (<25%), neutral for everything else. Most of Attio's gaps are 28–33% so they now read as quiet grey chips rather than alarm-pink.
  - Verified visually: orange now appears as a single small accent letter in the Reddit glyph; the rest of the chrome is monochrome with green and rose used sparingly for true semantic signal. Screenshot at `/tmp/swarm-final.png`.
  - `npm run typecheck` clean.
