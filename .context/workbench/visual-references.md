# Peec visual references

Files in `.context/peec-references/` — used by `ui-polish` to match Peec's actual look.

## Logo

- **`peec-logo.jpg`** — Official Peec AI logo: black stacked rounded rectangles + "Peec AI" wordmark. Use as `public/peec-logo.jpg`. Mounted via `<img src="/peec-logo.jpg">`.

## Screenshots

| File | What it shows |
|---|---|
| `Screenshot 2026-04-25 at 22.30.47.png` | Overview page — left sidebar (dark), filter chip bar, hero card explaining Peec MCP connections, main Overview chart (visibility per brand), Top 7 Brands table, Top Domains table. Reference for the dashboard pattern. |
| `Screenshot 2026-04-25 at 22.30.51.png` | Sources › Domains breadcrumb, line chart by domain type, Domain types legend with rose/blue/orange dots, table of domains with type pills (UGC, Corporate, Editorial, Competitor) and metrics columns. Reference for **table density** and **type pills**. |
| `Screenshot 2026-04-25 at 22.30.54.png` | Settings › Company page. Edit Company form, Email preferences with toggle list. Reference for **form density** and **list rows**. |
| `Screenshot 2026-04-25 at 22.30.57.png` | Project switcher dropdown opened from sidebar. Shows account email at top, search field, list of projects with brand icons. Reference for **dropdown styling** and **brand-pill rendering**. |

## Key visual patterns to reproduce in SWARM

1. **Dark left sidebar** ~220px wide. Sections: General / Sources / Actions / Agent analytics / Project / Company. Each item is a tiny icon + 13-14px text. Active item has a subtle background tint.
2. **Dark top bar** thin (32-40px), brand-switch pill with brand favicon at top of sidebar.
3. **Cream/off-white content background** (`#fafafa`-ish), not pure white. Cards sit on top with subtle shadow.
4. **Filter chip bar** at the top of the content area. Pill-shaped buttons with `▾` dropdown arrows: `Fyxer ▾  All time ▾  All Tags ▾  All Models ▾  All Topics ▾`.
5. **Breadcrumbs** above the content title: `Sources › Domains`.
6. **Section header pattern**: H3 heading + tiny italic helper text below ("How often each brand appears in AI generated discussions").
7. **Right-side badges** in tables — dotted color circle + label, pill-shaped (`UGC`, `Corporate`, `Editorial`).
8. **Numeric columns** are right-aligned with tabular-nums, often with a subtle delta indicator.
9. **"Get set up" widget** stuck to bottom of sidebar, with a small progress bar.
10. **"Refer & Earn"** anchor at the very bottom.

## Mapping to SWARM screens

- **Sidebar sections for SWARM**: General (Radar / Trends), Sources (Conversations / Brand Context), Actions (Drafts / Engagements), Agent analytics (Visibility lift / Citations), Project (Brand profile / Voice), Company (Settings / API keys).
- **Top filter bar** for the Radar: `Attio ▾  This week ▾  All platforms ▾  All connections ▾  All topics ▾`.
- **Breadcrumb**: `Conversations › Radar`.
- **Bottom-of-sidebar widget**: "Trends agent ran 2h ago" with a subtle progress bar instead of the Peec setup widget.
