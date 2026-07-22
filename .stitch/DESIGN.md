---
name: Life Admin OS — Obsidian Glass
colors:
  void: '#04040a'
  surface-base: '#07070e'
  surface-card: '#0c0c14'
  surface-elevated: '#12121d'
  surface-float: '#181826'
  on-surface: '#e8e8f0'
  on-surface-secondary: '#c4c4d8'
  on-surface-muted: '#8a8aa3'
  on-surface-dim: '#5a5a72'
  on-surface-faint: '#3a3a55'
  border-subtle: 'rgba(255,255,255,0.05)'
  border-default: 'rgba(255,255,255,0.08)'
  border-strong: 'rgba(255,255,255,0.12)'
  primary-indigo: '#5b5ef4'
  primary-indigo-bright: '#818cf8'
  accent-violet: '#9b7cf7'
  accent-teal: '#22d3ee'
  accent-amber: '#fbbf24'
  accent-rose: '#fb7185'
  accent-emerald: '#34d399'
  destructive: 'hsl(0, 72%, 51%)'
  tw-red-400: '#f87171'
  tw-orange-400: '#fb923c'
  tw-yellow-400: '#facc15'
  tw-zinc-400: '#a1a1aa'
  chart-1: 'hsl(239, 72%, 65%)'
  chart-2: 'hsl(160, 70%, 40%)'
  chart-3: 'hsl(38, 92%, 50%)'
  chart-4: 'hsl(189, 94%, 43%)'
  chart-5: 'hsl(347, 77%, 50%)'
typography:
  display-lg:
    fontFamily: Syne
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 'tight (1.1)'
    letterSpacing: '-0.01em (tracking-tight)'
  display-sidebar:
    fontFamily: Syne
    fontSize: 15px
    fontWeight: '700'
    lineHeight: 'tight'
    letterSpacing: '-0.01em (tracking-tight)'
  widget-header:
    fontFamily: Syne
    fontSize: 13px
    fontWeight: '600'
    lineHeight: 'normal'
    letterSpacing: '-0.01em (tracking-tight)'
  body-base:
    fontFamily: DM Sans
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 'tight'
    letterSpacing: '0'
  body-sm:
    fontFamily: DM Sans
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 'snug'
    letterSpacing: '0'
  eyebrow-mono:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '400'
    lineHeight: 'normal'
    letterSpacing: '0.1em (tracking-widest, uppercase)'
  data-mono:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 'normal'
    letterSpacing: '0'
  stat-lg:
    fontFamily: JetBrains Mono
    fontSize: 22px
    fontWeight: '700'
    lineHeight: 'none (1.0)'
    letterSpacing: '0'
rounded:
  sm: 0.5rem
  DEFAULT: 0.75rem
  lg: 0.75rem
  xl: 0.75rem
  2xl: 1rem
  full: 9999px
spacing:
  unit: 4px
  card-padding: 20px
  widget-padding: 20px
  row-padding-x: 12px
  row-padding-y: 12px
  grid-gap: 12px
  section-gap: 24px
  page-margin-mobile: 16px
  page-margin-desktop: 24px
  content-max-width: 1152px
---

## Brand & Style

Life Admin OS reads as an "Obsidian Glass" cockpit: a near-black control surface for tracking subscriptions, bills, deadlines, documents, appointments, and warranties. The atmosphere is deliberately dim and quiet — a `#04040a` void punctuated by soft ambient color bleed (three low-opacity radial gradients in indigo, violet, and teal, defined in `.dashboard-ambient`) rather than any flat background fill. Every surface above that void is a translucent glass panel (`.glass`: `rgba(11,11,19,0.6)` + `blur(20px) saturate(1.4)` + a hairline `rgba(255,255,255,0.08)` border), so panels feel like frosted plates floating over the ambient glow rather than opaque cards sitting on a page.

The personality is "ledger meets sci-fi HUD": data-dense rows of financial/date information rendered in monospace for a terminal-like precision, paired with a geometric display face (Syne) for greeting text and section titles that gives the app a slightly more expressive, branded voice than a typical admin dashboard. A persistent film-grain noise overlay (`body::after`, 3.5% opacity SVG turbulence) and a hidden native cursor (replaced by a custom one on fine-pointer devices) reinforce a crafted, non-default feel.

## Colors

The base is three tiers of near-black surface, each one step lighter than the last: **Void** (`#04040a`, page background), **Surface Card** (`#0c0c14`, the `.glass` panel fill before blur), and **Surface Elevated/Float** (`#12121d` / `#181826`, reserved for anything that needs to sit visually above a card, though little in the current dashboard actually uses these last two — they exist in the token set but aren't heavily exercised in `DashboardClient.tsx`).

Text is a four-step gray ramp rather than a single foreground color: `#e8e8f0` (primary — greeting, headline), `#c4c4d8` (secondary — row titles, nav active label would use indigo instead), `#8a8aa3` (muted — labels, timestamps, captions, the single most-used text color in the app), and `#5a5a72`/`#3a3a55` (dim/faint — inactive sidebar nav items and icons only).

On top of that neutral base sits a **six-color domain-accent system** — this is the palette's defining and most debatable trait. Rather than one signature accent, each data domain owns its own hue, applied consistently as an icon-badge tint, a left-rail hover indicator, or a value color: **Indigo** `#5b5ef4` (subscriptions, primary actions, the CTA gradient, the sidebar's active-nav indicator), **Violet** `#9b7cf7` (appointments), **Teal/Cyan** `#22d3ee` (documents), **Amber** `#fbbf24` (bills, "due soon"), **Rose** `#fb7185` (deadlines, overdue/urgent), **Emerald** `#34d399` (warranties, "all clear" states). Every one of these is used at low opacity (`0.06`–`0.2`) for icon-badge backgrounds and borders, and at full saturation only for the icon glyph itself and small numeric values — so no single card ever reads as "loud," even though the palette overall is not restrained to one accent.

A **second, parallel color system** exists for status/urgency states and runs on stock Tailwind palette classes rather than the custom hex tokens above: `text-red-400`, `text-rose-400`, `text-amber-400`, `text-yellow-400`, `text-emerald-400` for time-based urgency (`getUrgencyColor`), and `red-500`/`orange-500`/`yellow-500`/`zinc-500` at `/15` opacity fills for priority badges (`getPriorityBadge`, in `lib/utils.ts`). These are close in hue to the custom accent tokens but not the same values (e.g. Tailwind's `amber-400` vs. the custom `#fbbf24`), so as-shipped there are two overlapping-but-distinct amber/rose/emerald definitions in the codebase rather than one source of truth.

## Typography

Three font families, each with one job. **Syne** (`--font-display`) is reserved for anything that should feel branded or headline-weight: the dashboard greeting (`text-[28px] font-bold tracking-tight`), the sidebar wordmark, widget section titles (`text-[13px] font-semibold tracking-tight`), and the CTA button label. **DM Sans** (`--font-sans`) is the workhorse body font for row titles, labels, and paragraph text, generally at `13px`/`medium` for primary row content and `11px`/`medium` for secondary metadata. **JetBrains Mono** (`--font-mono`) is used everywhere a number, date, or timestamp appears — KPI values (`22px bold tabular-nums`), row-level amounts and day-counts (`11px bold`), and the date/time labels under nav row titles — plus for the uppercase "today" eyebrow line (`11px, tracking-widest, uppercase`) above the greeting. This three-way split (display face for identity, humanist sans for reading, monospace for data) is applied with unusual consistency across the file — almost no numeral in the dashboard renders in the body font.

Weight does most of the hierarchy work rather than size: most UI text sits in a narrow `11px`–`13px` band, with only the greeting (`28px`) and KPI values (`22px`) breaking out. Headline and label text uses `tracking-tight` (Syne) or `tracking-widest` (the mono eyebrow), never default tracking.

## Layout & Spacing

The shell is a fixed-height flex layout (`h-[100dvh]`) with a `240px` (`w-60`) desktop sidebar and a scrollable main column. Page content is capped at `max-w-6xl` (1152px) and centered, with `px-4` (mobile) / `px-6` (desktop) side margins and `py-6` top/bottom padding (`layout.tsx`).

Spacing is loosely on a 4px base unit but not a strict token scale — component code uses literal Tailwind spacing utilities directly (`p-4`, `p-5`, `gap-3`, `gap-4`, `space-y-6`) rather than named design tokens. Widget cards use `p-5` (20px) internal padding; the KPI tiles use `p-4` (16px); grid gaps between cards are `gap-3`–`gap-4` (12–16px); vertical rhythm between major dashboard sections is `space-y-6` (24px). Data rows inside a widget use `px-3 py-3` (12px) and are visually separated only by that padding plus a hover background tint — no dividing borders.

Radii follow a small, consistent set: `rounded-lg`/`rounded-xl` (`0.5–0.75rem`, matching the CSS `--radius: 0.75rem` token) for icon badges, nav items, and buttons; `rounded-2xl` (`1rem`) for every card-level container (`WidgetCard`, `TiltCard`); `rounded-full` for avatars, the logout button hit-area, and status pills. Nothing in the dashboard uses a sharp corner.

## Elevation & Depth

Depth comes entirely from glass translucency and glow, never from conventional box-shadows. The `.glass` utility (`rgba(11,11,19,0.6)` + `blur(20px) saturate(1.4)` + `1px solid rgba(255,255,255,0.08)`) is the single elevated-surface treatment used for every widget and KPI card. The only shadows in the system are colored, low-spread glows tinted to an accent (`boxShadow: 0 4px 20px rgba(91,94,244,0.35)` on the primary CTA; `shadow-indigo-500/30` on the sidebar logo mark) — there is no neutral gray drop shadow anywhere in the audited files.

KPI cards add a cursor-driven 3D tilt (`rotateX`/`rotateY` via Framer Motion's `useMotionValue`, ±7°, `TiltCard`) rather than a static hover-lift, and carry a looping `animate-pulse-glow` behind their icon badge — the one place in the dashboard with a perpetual (not just on-hover) micro-animation.

## Components

### Buttons
Built on a CVA variant system (`components/ui/button.tsx`): `rounded-lg` corners, `border border-transparent`, six variants (`default`/`outline`/`secondary`/`ghost`/`destructive`/`link`), five sizes from `xs` (`h-6`) to `lg` (`h-9`). The `default` variant is a flat `bg-primary` (indigo, from the HSL `--primary` token) with `hover:bg-primary/80` — no gradient. The dashboard's hero CTA, however, bypasses this component entirely and hand-rolls a gradient pill (`linear-gradient(135deg, #5b5ef4, #7c3aed)` + colored glow), so there are effectively two different "primary button" visual treatments in the codebase: the shadcn-style flat variant and the ad-hoc gradient CTA.

### Cards & Widgets
Every dashboard card is `.glass rounded-2xl`. `WidgetCard` is a plain padded (`p-5`) glass shell; `TiltCard` adds the pointer-tilt interaction and is used specifically for the four KPI tiles. Each widget follows the same internal anatomy: a `WidgetHeader` (icon badge + Syne title + "All →" link) followed by a list of `DataRow` items, each of which slides/clips in from the left on mount (`clip-path` + `translateX` reveal, staggered ~42ms per row).

### Navigation
Sidebar (`Sidebar.tsx`) is a fixed `240px` glass column (`rgba(4,4,10,0.8)` + `blur(28px)`) on desktop, collapsing to a slide-in drawer with backdrop on mobile. Nav items are `13px font-medium` with a `3px` gradient left-rail indicator (indigo→bright-indigo, `layoutId="active-indicator"` for a shared-layout spring transition between routes) and an indigo `/10`-opacity background wash on the active item; inactive items sit at the dimmest text tier (`#5a5a72`) and only lighten to `#c4c4d8` on hover.

### Data Rows (domain-specific)
The recurring `DataRow` pattern — used for deadlines, subscriptions, bills, documents, appointments, and warranties — is the app's core repeating unit: a title in `13px` DM Sans over an `11px` mono metadata line, with a right-aligned mono value or badge, and a left-edge gradient bar that only appears on hover. Status/urgency is communicated purely through color and weight on that right-aligned value (e.g. `text-rose-400` for overdue, `text-emerald-400` for safe), never through an icon change.

### Inputs & Forms
Not present in the audited dashboard page — this file only reflects what the Dashboard/Sidebar/Button surfaces actually contain today. A follow-up extraction pass over `SettingsClient.tsx` or the create/edit forms would be needed to document input styling accurately.
