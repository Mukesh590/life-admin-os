# Landing Page Rebuild — Phase 1: Hero Section with Device Scroll-Dive

## Context

The existing `src/app/page.tsx` landing page is a dark (`#09090b`), indigo-accented, Three.js/GSAP-heavy design. It is being fully rebuilt across multiple phases into a light, restrained, editorial style. This spec covers **Phase 1 only**: the nav + hero section, ending in a scroll-driven "dive" into the device mockup's screen.

The dark existing dashboard (`/dashboard` route, "Obsidian Glass" theme per `.stitch/DESIGN.md`) is untouched by this work. `public/dashboard-bg.jpg` belongs exclusively to that route and must not be referenced anywhere in the landing page.

## Global rules (apply to every phase)

- Palette: white/off-white/cream backgrounds (`#FAF8F5` range), near-black text, orange (`#e8783a`) only as small accents (buttons, badges, thin lines). Never dark backgrounds, never orange washes.
- Performance: transform/opacity-only animations, no continuous heavy loops running simultaneously, `will-change` used sparingly, tested for lag, `prefers-reduced-motion` respected everywhere.
- Cursor: default system cursor everywhere — remove any custom cursor code encountered.
- Do not touch Supabase, auth, API routes, or the logged-in dashboard.

## Design system source

`.stitch/REFERENCE-DESIGN.md` (synthesized from 7 reference brand-hero images) is the source of truth for visual language:
- Off-white background, 2–4% off pure white, tinted very slightly toward the accent — never flat `#FFFFFF`.
- Single, massive, bold, condensed/tight-tracking display headline as the dominant hero element.
- One accent color (orange `#e8783a`), used sparingly — one CTA, thin lines, small badges.
- Pill-shaped (`rounded-full`) buttons.
- Minimal chrome: nav + headline + subhead + one CTA + one visual block. No dashboard-style card stacks.
- Motion implication: a single deliberate, calm hero entrance (not bouncy/high-energy), then scroll-triggered reveals. No scrub/parallax implied by the reference images themselves — but Phase 1 explicitly adds one scrub-pinned sequence (the device dive), grounded instead in the motion-analysis reference below.

## Assets used in Phase 1

- `public/device-mockup.jpg` — laptop + phone mockup, blank screens, neutral gray/wood surface. 1672×941px.
- `public/device-screen-demo-clean.mp4` — cropped, muted, looping dashboard/chart animation. Composited into the laptop screen.
- Founder photo, other demo videos: **not used in Phase 1** (reserved for later phases).

## 1. Entrance sequence

Grounded in the "HOY" hero logo entrance documented in `motion-analysis-main.md` §2a/§9a (fade → hold → recolor/reflow → nav resolves, ~2.75s in the reference), compressed to fit "under 2 seconds, fast and confident" and re-themed for a light background (white hold instead of grey, near-black wordmark instead of yellow-on-dark).

| Beat | Duration | Detail |
|---|---|---|
| White hold | ~250ms | Blank cream background, nothing visible yet |
| Wordmark fade-in | ~350ms | "Life Admin OS" fades from 0→1 opacity, `power1.out`, no overshoot, no y-movement (matches reference: "continuous fade-up, no overshoot") |
| Hold | ~200ms | Wordmark static |
| Headline + subhead resolve | ~300ms | Headline and subhead fade/slide up slightly (`y: 16 → 0`, `power2.out`), staggered ~60ms apart |
| Nav resolves | ~300ms | Nav bar fades in with a slight `y: -12 → 0` offset, `power2.out` — matches reference's nav-resolve beat |

Total: ~1.4s core sequence (headline/subhead can overlap slightly with the tail of the wordmark hold to stay under 2s all-in). All fades use `autoAlpha` (opacity + visibility), matching the reference's guidance that every fade in this material goes fully to/from transparent.

## 2. Hero layout

- Centered nav: wordmark left, minimal links + single pill CTA right (reuses existing nav content/structure from current `page.tsx`, restyled light).
- Headline: **"Nothing forgotten."** — one line, huge, condensed/bold, near-black, tight tracking, centered.
- Subhead (draft, one line, plain gray, ~4–5% the visual weight of the headline per reference ratio): *"One system that tracks subscriptions, bills, deadlines, and documents — so you don't have to."* (editable at implementation time if you want different wording).
- Single CTA: pill button, orange fill, "Get started free" — the one accent-color element in the hero besides any thin divider lines.
- Generous whitespace above/below, no dashboard-style secondary content blocks.

## 3. Device mockup + video compositing

`device-mockup.jpg` is 1672×941px. Measured screen regions (as % of image, TL→TR→BR→BL, matching the mockup's slight camera-angle trapezoid — no 3D transform needed, a `clip-path: polygon()` quad mask is sufficient):

**Laptop screen:**
```
polygon(10.8% 16.5%, 51.1% 15.2%, 52.6% 66.4%, 10.5% 63.0%)
```

**Phone screen:**
```
polygon(81.1% 27.6%, 90.7% 28.0%, 89.5% 67.3%, 80.6% 68.2%)
```

Implementation: a wrapper div contains the `<img>` (device-mockup.jpg) and an absolutely-positioned `<video>` (device-screen-demo-clean.mp4, autoplay/muted/loop/playsinline) sized to the image's bounding box, with the video's `clip-path` set to the laptop-screen polygon above so only that region is visible. The phone screen stays a static warm-white/gradient placeholder in Phase 1 (no video composited there yet).

## 4. Scroll-dive

Grounded in the `pin: true` + `scrub` pattern confirmed in `motion-analysis-main.md` §4 ("Beyond the Screen" pinned phone-mock section) — the one clearly-confirmed pin+scrub reference pattern, not a guess.

- The hero section pins on scroll.
- A `ScrollTrigger` with `scrub: true` animates the device-mockup wrapper's `transform` (`scale`, `x`, `y` only — never `width`/`height`) so the laptop-screen region grows to fill the viewport as the user scrolls.
- On completion, crossfade (opacity) into a placeholder `<div>` representing Phase 2's content — no real content yet, just enough to prove the handoff doesn't jank or flash.
- **Mobile** (below Tailwind's `md` breakpoint, `<768px` — consistent with the `md:` breakpoints already used in the current `page.tsx` nav): the same scrub zooms into the **phone** screen region instead of the laptop. Since the phone screen has no video yet, this zooms into the static placeholder — motion structure only; phone video content is deferred to a later phase.
- Everything animated is `transform`/`opacity` only, per the global performance rule. `will-change: transform` applied only to the actively-animating wrapper during the pinned scroll range, removed after.

## 5. Verification

Before reporting Phase 1 done:
- Run the dev server, screenshot: (a) entrance mid-sequence, (b) resting hero state, (c) mid-dive (device scaling), (d) post-dive (crossfaded to placeholder).
- Confirm no layout shift/jank at the crossfade moment.
- Confirm `prefers-reduced-motion` disables/shortens the entrance and scroll-dive appropriately.
- Confirm default system cursor throughout (no custom cursor code left over from the old page).

## Follow-ups (not Phase 1 scope)

- Mobile phone-screen zoom currently dives into a blank/gradient placeholder (§4). Revisit once mobile-specific screen content exists, and reconsider whether mobile should get the full scroll-dive at all — a simpler, non-pinned entrance may suit small screens better than a scaled-down dive.
