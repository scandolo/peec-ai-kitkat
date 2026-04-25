# Peec AI Design System

You are building UI that matches the Peec AI platform's design language. Follow this spec exactly when generating components, layouts, or styles. This is extracted directly from the live app.peec.ai production CSS.

---

## Font

**Family**: `"Geist Variable", sans-serif` (`--font-geist`)
**Mono**: `ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace`

## Typography Scale

| Token | Size | Line Height | Weight | Tracking |
|-------|------|-------------|--------|----------|
| Display | 28px | 28px | 600 | -0.896px |
| H1 | 22px | 22px | 600 | -0.616px |
| H2 | 18px | 18px | 600 | -0.36px |
| H3 | 16px | 16px | 600 | -0.128px |
| H3 Medium | 16px | 16px | 500 | -0.128px |
| H4 | 14px | 14px | 600 | -0.112px |
| H4 Medium | 14px | 14px | 500 | -0.112px |
| Body L | 16px | 22px | 500 | -0.128px |
| Body L Regular | 16px | 22px | 400 | -0.128px |
| Body L Semibold | 16px | 22px | 600 | -0.288px |
| Body M | 14px | 20px | 500 | -0.112px |
| Body M Regular | 14px | 20px | 400 | -0.112px |
| Body M Semibold | 14px | 20px | 600 | -0.196px |
| Body S | 13px | 18px | 500 | -0.065px |
| Body S Regular | 13px | 18px | 400 | -0.065px |
| Body S Semibold | 13px | 18px | 600 | -0.234px |
| Caption | 11px | 16px | 500 | 0px |
| Code | 13px | 18px | 500 | 0px |

**Key pattern**: Tight negative letter-spacing everywhere. Weight 500 (medium) is the default, not 400.

---

## Color System

### Foreground (text)
| Token | Value | Usage |
|-------|-------|-------|
| `--peec-fg-primary` | `#171717` | Primary text |
| `--peec-fg-secondary` | `#17171799` (60% opacity) | Secondary text |
| `--peec-fg-tertiary` | `#17171780` (50% opacity) | Tertiary/muted text |
| `--peec-fg-quaternary` | `#17171766` (40% opacity) | Quaternary/disabled text |
| `--peec-fg-primary-white` | `#fdfdfd` | Primary text on dark bg |
| `--peec-fg-secondary-white` | `#fdfdfda3` (64% opacity) | Secondary text on dark bg |

### Background
| Token | Value | Usage |
|-------|-------|-------|
| `--peec-bg-primary` | `#1717170a` (4% opacity) | Subtle bg tint |
| `--peec-bg-secondary` | `#1717170f` (6% opacity) | Secondary bg |
| `--peec-bg-tertiary` | `#17171714` (8% opacity) | Tertiary bg |
| `--peec-bg-quaternary` | `#1717171a` (10% opacity) | Quaternary bg |
| `--peec-bg-black` | `#171717` | Dark bg (buttons, inverse) |
| `--peec-bg-white` | `#fdfdfd` | Base white (not pure #fff) |
| `--peec-input-bg` | `#fdfdfd` | Input fields |

### Surface & Stroke
| Token | Value |
|-------|-------|
| `--peec-surface-primary` | transparent |
| `--peec-surface-secondary` | `#1717170a` (4%) |
| `--peec-surface-tertiary` | `#1717170f` (6%) |
| `--peec-stroke-primary` | `#17171714` (8%) |
| `--peec-stroke-secondary` | `#1717171a` (10%) |
| `--peec-stroke-tertiary` | `#1717171f` (12%) |
| `--peec-stroke-quaternary` | `#17171729` (16%) |
| `--peec-separator-primary` | `#1717170f` (6%) |
| `--peec-separator-secondary` | `#17171714` (8%) |

### Semantic Colors
| Token | Value | Usage |
|-------|-------|-------|
| `--peec-success-base` | `#00a63e` | Success/positive |
| `--peec-error-base` | `#fb2c36` | Error/destructive |
| `--peec-warning-primary` | `#ff6900` | Warning/caution |
| `--peec-feature-base` | `#ad46ff` | Feature/purple accent |
| `--peec-feature-2-base` | `#2b7fff` | Feature/blue accent |
| `--peec-highlight-base` | `#f6339a` | Highlight/pink accent |

### Table States
| Token | Value |
|-------|-------|
| `--peec-table-hover` | `#f6f6f6` |
| `--peec-table-active` | `#ececec` |
| `--peec-table-selected` | `#e8ecfe` |
| `--peec-chip-gradient` | `#f6f6f6` |

**Key pattern**: Almost everything is `#171717` at varying opacities. The design is monochromatic with color used sparingly for semantics and badges.

---

## Badge Color System (16 variants)

Each badge has bg (10% opacity), border (10% opacity), and text:

| Color | Text | Bg/Border (10% alpha) |
|-------|------|-----------------------|
| Orange | `#ff6900` | `#ff69001a` |
| Red | `#e7000b` | `#e7000b1a` |
| Amber | `#e17100` | `#e171001a` |
| Yellow | `#d08700` | `#f0b1001a` |
| Lime | `#5ea500` | `#5ea5001a` |
| Green | `#00a63e` | `#00a63e1a` |
| Emerald | `#009966` | `#0099661a` |
| Blue | `#2b7fff` | `#155dfc1a` |
| Cyan | `#0092b8` | `#0092b81a` |
| Sky | `#0084d1` | `#0084d11a` |
| Teal | `#009689` | `#0096891a` |
| Indigo | `#4f39f6` | `#4f39f61a` |
| Violet | `#7f22fe` | `#7f22fe1a` |
| Purple | `#9810fa` | `#9810fa1a` |
| Fuchsia | `#c800de` | `#c800de1a` |
| Pink | `#e60076` | `#e600761a` |
| Rose | `#ec003f` | `#ec003f1a` |

---

## Shadows

| Token | Value |
|-------|-------|
| 2xs | `0px 1px 0px 0px #17171714, 0px 0px 0px 1px #1717170f` |
| xs | `0px 1px 2px 0px #17171714, 0px 0px 0px 1px #1717170f` |
| sm | `0px 1px 2px -1px #17171714, 0px 1px 3px 0px #17171714, 0px 0px 0px 1px #1717170f` |
| md | `0px 2px 4px -2px #1717171a, 0px 4px 6px -1px #17171714, 0px 0px 0px 1px #17171714` |
| lg | `0px 4px 6px -4px #1717171a, 0px 10px 15px -3px #17171714, 0px 0px 0px 1px #17171714` |
| xl | `0px 8px 10px -6px #1717171a, 0px 20px 25px -5px #17171714, 0px 0px 0px 1px #17171714` |
| 2xl | `0px 32px 56px -12px #1717171a, 0px 25px 50px -12px #17171714, 0px 0px 0px 1px #17171714` |

**Key pattern**: Every shadow includes a subtle 1px ring (`0px 0px 0px 1px`) at the end. This is a signature Peec detail.

### Button Shadows
| Variant | Shadow |
|---------|--------|
| Primary | `inset 0 0 0 1px #17171700, 0px 1px 3px 0px #1717170f, 0 0 0 1px #17171714` |
| Inverse | `inset 0 0 0 1px #fdfdfd1f, 0 1px 3px 0 #1717170f, 0 0 0 1px #171717` |
| Destructive | `inset 0 0 0 1px #fdfdfd66, 0px 1px 3px 0px #e7000b1a, 0 0 0 1px #17171714` |

### Focus Rings
| Variant | Shadow |
|---------|--------|
| Default | `0px 0px 0px 1px #2b7fff, 0px 0px 0px 2px #155dfc1a` |
| Destructive | `0px 0px 0px 1px #fb2c36, 0px 0px 0px 2px #e7000b1a` |

---

## Border Radii

| Usage | Value |
|-------|-------|
| Buttons, inputs, dropdowns | `8px` |
| Cards, panels | `12px` |
| Small elements, inner corners | `6px` |
| Pills, tags, badges | `9999px` |
| Avatars, icons | `50%` or `10px` |
| Large cards, modals | `14px` |

Base radius: `0.625rem` (10px) — `--radius`

---

## Button Styles

| Property | Value |
|----------|-------|
| Font size | 14px |
| Font weight | 500 |
| Line height | 20px |
| Letter spacing | -0.112px |
| Border radius | 8px |
| Padding | `0px 6px` (ghost) — varies by variant |
| Background (default) | `#fdfdfd` |
| Color | `#171717` |

### Button Variants
- **Primary (inverse)**: `bg: #171717`, `color: #fdfdfd`, shadow with inner white ring
- **Outlined**: Transparent bg, subtle shadow, hover adds `#1717170a` bottom gradient
- **Grey**: `bg: #1717170a`, border `#17171714`, hover `#1717170f`
- **Destructive**: Red-tinted shadow, inner white ring

---

## Layout & Spacing

- **Base spacing unit**: `0.25rem` (4px) — Tailwind 4 default
- **Sidebar + main content** layout
- **Container sizes**: standard Tailwind (sm 24rem through 6xl 72rem)

---

## Interaction States

| State | Pattern |
|-------|---------|
| Hover (buttons) | Subtle bg shift via gradient bottom |
| Active (buttons) | Inner shadow appears |
| Table row hover | `#f6f6f6` bg |
| Table row active | `#ececec` bg |
| Table row selected | `#e8ecfe` bg (blue tint) |
| Focus | 2-ring system: 1px solid color + 2px semi-transparent outer |

---

## Design Principles (from observation)

1. **Monochromatic base**: Everything derives from `#171717` at varying opacities. Almost no grays — just black with transparency.
2. **Not pure white**: Base white is `#fdfdfd`, not `#ffffff`. Cards and popovers use `#fff`.
3. **Tight tracking everywhere**: Negative letter-spacing on all text sizes.
4. **Weight 500 as default**: Medium weight is the baseline, not regular (400).
5. **Layered shadows**: Multi-layer shadows with a 1px ring on every elevation.
6. **Color only for semantics**: Badge colors, success/error/warning, and feature accents. UI chrome is entirely grayscale.
7. **Geist Variable**: Vercel's Geist font throughout.

---

## Quick Reference for Implementation

When building components for this project:

```css
/* Import Geist font */
@import url('https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&display=swap');

/* Or use the variable font if available in your build */
font-family: "Geist Variable", sans-serif;
```

```tailwind
/* Example card */
className="bg-white rounded-xl shadow-sm border border-[#1717170f] p-4"

/* Example primary button */
className="bg-[#171717] text-[#fdfdfd] rounded-lg px-3 py-1.5 text-sm font-medium tracking-[-0.112px]"

/* Example badge */
className="bg-[#2b7fff1a] text-[#2b7fff] border border-[#2b7fff1a] rounded-full px-2 py-0.5 text-xs font-medium"

/* Example muted text */
className="text-[#17171780] text-sm font-medium tracking-[-0.112px]"
```
