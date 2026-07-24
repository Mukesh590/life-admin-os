# Life AdminOS — Landing Page Implementation Spec
Consolidates research from analyzing 15+ live production sites. Source of
truth for landing-page implementation, subordinate to CONTEXT-MASTER.md.

## Color and typography system — LOCKED DECISION
```
--canvas: #fbf7ef
--canvas-alt: #f1ebe1
--ink: #1e1c18
--accent: #e8783a
--accent-soft: #f6d8c5
--line: rgba(30, 28, 24, 0.14)
```
Display: Bricolage Grotesque, weight 650–750.
Body: Inter, weight 400/500.
IMPLEMENTATION RECOMMENDATION: type-scale tokens —
`--display-size: clamp(3.5rem, 7.5vw, 7rem)`,
`--display-leading: .92`, `--display-tracking: -.045em`,
`--body-size: clamp(1rem, 1.2vw, 1.25rem)`,
`--body-leading: 1.5`, `--body-tracking: -.012em`.
This palette applies to the marketing site ONLY — LOCKED DECISION: do not
convert this to a dark theme; the authenticated dashboard's dark glass theme
is a deliberately separate system (see CONTEXT-MASTER.md Section 6).

---

## 1. Hero

**Purpose**: establish premium/cinematic first impression; introduce the
product visually (device mockup with real UI baked in) without a hard sales
CTA — the page should invite scrolling, not clicking.

**Desktop composition**: full-bleed (100dvw/100svh) photographic hero image
(`hero-full.jpg`) — laptop + phone mockup on a concrete/wood surface, soft
bright cool-gray studio lighting. Headline "Nothing forgotten." and a
supporting line are baked into the laptop screen in the source image; a
representative app UI (Subscriptions/Bills/Deadlines/Documents summary,
sample upcoming bills with amounts) is baked into the phone screen. Minimal
nav: small wordmark top-left + "Sign in" top-right only — NO CTA button.
VERIFIED RESEARCH OBSERVATION: an earlier large semi-transparent watermark
treatment across the top of the frame did not read well in practice and has
been removed; do not reintroduce it without a new direction.
IMPLEMENTATION RECOMMENDATION: fill the otherwise-empty lower-left area with
a small utility strip — a short kicker line (e.g. "Your personal operations
system", ~12–13px uppercase, tracked, ink at ~60% opacity) and a slow
scroll-cue (thin ~1px vertical line ~36px tall with a dot traveling down it
on a multi-second loop, plus an 11px uppercase "Scroll" label), anchored to a
12-column grid with generous edge padding.

**Mobile composition**: TBD — a single wide (~21:9) image mathematically
cannot show both devices fully framed and keep the baked-in headline fully
legible on a narrow viewport without cropping (VERIFIED RESEARCH
OBSERVATION, confirmed against multiple real sites: cover = crop, contain =
margins, stretch = distortion — no single image avoids all three).
IMPLEMENTATION RECOMMENDATION: use `<picture>`/`source media` art direction
with a separately composed mobile-specific image once one exists; until then,
a laptop-biased crop of the existing wide image is the working fallback.

**Responsive behavior**: the preferred structure is a genuinely full-width
root section with no ancestor `max-width` constraint, with `overflow-x: clip`
applied where needed to prevent horizontal scroll. The `100dvw` breakout
pattern (`position: relative; left: 50%; transform: translateX(-50%); width:
100dvw;`) should be treated as a fallback for cases where an ancestor
container's `max-width`/padding cannot be removed, not as the default
technique. VERIFIED ROOT CAUSE: a persistent empty side margin during
implementation was traced to a parent container constraint, not to
`object-fit` itself; auditing the full ancestor chain for
`max-width`/padding/`overflow` is required whenever a similar gap reappears.

**Motion behavior**: resting state (scroll position 0) must show the image's
natural, un-zoomed framing — VERIFIED bug history: a leftover focal-position
bias variable from an earlier task caused an incorrect pre-zoomed resting
state; any focal/crop bias values must be re-audited whenever hero motion
code changes.

**Recommended implementation technique**: CSS `object-fit: cover` with
`object-position` centered at rest; scroll-driven zoom via GSAP ScrollTrigger
`scrub`, animating `transform` (`scale`/`x`/`y`) only, never `width`/`height`.

**Performance safeguards**: hero image should be eagerly loaded with high
fetch priority; target file size TBD but should follow the general
image-weight discipline in Section 12; no video/WebGL in the initial hero
paint.

**Reduced-motion fallback**: if `prefers-reduced-motion` is set, skip the
scroll-dive scale/zoom entirely and go directly to the post-dive section
content on scroll, with only opacity crossfade.

**Acceptance criteria**: the image covers the viewport without empty
columns; the laptop screen and baked headline remain inside the safe focal
region; controlled peripheral cropping is acceptable at narrower aspect
ratios; nav minimal (wordmark + Sign in only, no CTA); default cursor
active.

---

## 2. Scroll-dive into the device screen

**Purpose**: transition the user from "looking at a photo of the product" to
"being inside the product," motivating the rest of the page as a continuation
of that same interface. This must be a genuine dive toward/into the laptop
screen — not a generic "next panel slides over the hero" substitute.

**Desktop composition**: LOCKED FOUNDATION — the existing WIP already
implements screen-coordinate mapping (`mapPoint`, natural-image dimensions,
a `LAPTOP_TARGET_BOX` bounding the laptop screen region) driving `scale/x/y`
transforms that zoom the viewport toward that region as the user scrolls.
This coordinate-mapped zoom-toward-the-screen approach is the current
preferred foundation for this section and should be built on rather than
replaced. Once the screen region fills the viewport, an aligned
crossfade/mask handoff reveals the next section's real content in its place.
Exact tuning of the zoom curve, the fill threshold, and the crossfade/mask
mechanics at the handoff point remain TBD.
IMPLEMENTATION RECOMMENDATION (fallback only): if the coordinate-mapped dive
proves unworkable on some viewport/performance combination, a simpler pinned
hero with the next section sliding up over it (rounded top corners,
opacity 1→0 fade roughly in the 60–90% range of the transition) is
documented as a fallback, modeled on a verified real-site pattern using a
fixed-footer-style mechanism. This is a fallback, not the target experience.

**Mobile composition**: TBD, likely simplified — the full pinned/scrub
sequence may be reduced to a shorter, simpler crossfade given mobile
performance constraints; not yet specified in detail.

**Responsive behavior**: on narrow viewports, the dive zooms toward the
device region that is actually in frame (see Section 1); do not attempt to
replicate the exact desktop coordinate math on mobile.

**Motion behavior**: `pin: true`, `scrub` (a damped value such as `0.8`
rather than `true`/`1` was recommended in research for a less mechanical
feel), single consistent transform axis, no ping-ponging direction.

**Recommended implementation technique**: GSAP ScrollTrigger, since it
directly supports `pin` + `scrub` + timeline sequencing, which native CSS
scroll-driven animation does not yet reliably support cross-browser at this
level of control.

**Performance safeguards**: this is the single heaviest animation on the
page; explicitly test for dropped frames; unmount/hide any underlying canvas
or heavy layer once the transition completes so it does not keep repainting
off-screen.

**Reduced-motion fallback**: replace the scroll-driven dive with a simple
opacity crossfade between hero and next section, no scale/zoom, no pin.

**Acceptance criteria**: smooth 60fps-target transition on a mid-range
laptop; no visible pop/flash at the handoff point; content underneath is
fully interactive immediately after the transition completes; verified by
Mukesh in-browser, not by agent self-screenshot.

---

## 3. Stats band (count-up numbers)

**Purpose**: quick, credible proof points immediately after the dive.

**Desktop composition**: 3–4 large numbers with small uppercase labels
beneath, animating from 0 to their final value once scrolled into view (not
looping, not replaying on repeated scroll-past). Exact stat copy is TBD —
placeholders used in planning were phrases like "6 life areas tracked" /
"100% free" and should be finalized before shipping.

**Mobile composition**: same content, stacked or 2-column grid; no different
motion behavior required.

**Responsive behavior**: standard reflow; no special breakpoint logic beyond
normal grid wrapping.

**Motion behavior**: VERIFIED RESEARCH OBSERVATION — real implementations use
IntersectionObserver-triggered count-up, ~1–2 second duration (a specific
site's config used `1s`, its library default `2s`); linear/step interpolation
is common, but an eased curve (e.g. `easeOutCubic`) was recommended here for
a less mechanical feel over roughly `1.2–1.6s`.

**Recommended implementation technique**: a small custom
`requestAnimationFrame` counter driven by one shared `IntersectionObserver`
instance observing all stat elements (not one observer per number), firing
each element's count-up once it enters view and then unobserving that
element.
```css
.stat-number { font-variant-numeric: tabular-nums; min-width: 4ch; }
```
Keep any trailing `%`, `+`, `$` symbol in a separate, non-animating span so it
doesn't flicker mid-count.

**Performance safeguards**: exactly one `IntersectionObserver` instance
reused across all stat elements — do not instantiate a separate observer per
number.

**Reduced-motion fallback**: render the final value immediately, no counting
animation.

**Acceptance criteria**: numbers animate once on first scroll-into-view only;
final values are correct and match whatever copy is finalized; no layout
shift while counting (fixed `min-width`).

---

## 4. Infinite marquee (tech stack ticker)

**Purpose**: lightweight credibility/texture element; explicitly
low-attention — decorative, not something users are expected to read closely.

**Desktop composition**: horizontal, continuously auto-scrolling row.
Content TBD: product benefits/life-admin categories versus technology logos
(Next.js, Supabase, Vercel, Tailwind, Gemini) — not yet finalized which
content set ships. If logos are used, a monochrome/gray treatment is
recommended for restraint.

**Mobile composition**: same technique, typically reduced speed/duration on
narrow viewports.

**Responsive behavior**: track width recalculated on resize/font-load so the
loop point stays accurate at any viewport width.

**Motion behavior**: LOCKED DECISION — the loop itself is a pure CSS
`transform: translate3d` animation, not `requestAnimationFrame`-driven. A
small amount of JS is still involved: measuring the rendered set's width to
compute the animation `duration` (and recomputing it via `ResizeObserver`/on
font load) — this is a measurement step, not a JS-driven animation loop, so
"CSS-only" refers to the animation mechanism, not to the total absence of
JS. VERIFIED RESEARCH OBSERVATION: the seam "hiccup" commonly seen at the
loop point is caused by not accounting for the gap between duplicated
content sets; the fix is animating to
`translate3d(calc(-50% - var(--gap) / 2), 0, 0)` rather than a flat `-50%`.

**Recommended implementation technique**:
```css
.marquee { overflow: hidden; contain: layout paint; }
.marquee__track {
  display: flex; width: max-content; gap: var(--gap, 2.5rem);
  animation: ticker var(--duration, 40s) linear infinite;
  will-change: transform;
}
.marquee__set { display: flex; flex: none; align-items: center; gap: var(--gap, 2.5rem); }
@keyframes ticker { to { transform: translate3d(calc(-50% - var(--gap, 2.5rem) / 2), 0, 0); } }
@media (hover: hover) { .marquee:hover .marquee__track { animation-play-state: paused; } }
@media (prefers-reduced-motion: reduce) {
  .marquee { overflow-x: auto; }
  .marquee__track { animation: none; will-change: auto; }
}
```
Render exactly two identical `.marquee__set` blocks (second one
`aria-hidden="true"`). Target speed ~45–65px/s; duration computed as
`originalSet.scrollWidth / 58` and recalculated via `ResizeObserver` and after
`document.fonts.ready`.

**Performance safeguards**: `will-change: transform` only on the moving
track, not globally; pause animation entirely when `prefers-reduced-motion`
is set (switch to native horizontal scroll instead).

**Reduced-motion fallback**: as above — becomes a manually horizontally
scrollable row, animation removed.

**Acceptance criteria**: no visible seam/jump at the loop point at any
viewport width; hover pauses the track; respects reduced-motion.

---

## 5. Annotated miniature dashboard

**Purpose**: explain what the product actually does using a visual, feature-
by-feature callout pattern, while creating a deliberate visual contrast
moment (the dark-glass dashboard style appearing inside the light landing
page).

**Desktop composition**: a real, code-built replica of the actual
`/dashboard` UI (in its dark-glass styling — sidebar, KPI pill, cost forecast
chart, profile card, bottom row), populated with realistic sample data (not
zeros), rendered responsively inside a max-width (~1080px) container — build
its layout to scale naturally rather than applying a blanket
`transform: scale(.8)` to the whole UI, since that approach can blur text.
Per Mukesh's request, this replica must support lightweight local
interaction: hover states, tab changes, toggles, chart highlights, and
sample widget transitions are all in scope. It is not a fully static image
or a completely non-interactive component — but it must make zero
Supabase/API calls; all interaction operates on static/sample local state
only. Surrounding it, 4–5 short text callouts connected to specific regions
of the replica via drawn-on arrow lines.

**Mobile composition**: IMPLEMENTATION RECOMMENDATION — hide the SVG
connector lines below a set breakpoint (e.g. ~768px) and instead present the
callouts as a stacked, numbered list beneath the (still visible, responsively
scaled) dashboard replica, each numbered badge matching a small numbered
marker on the replica if feasible.

**Responsive behavior**: callout positions are defined in a shared
percentage-based coordinate system relative to the replica's own bounding
box, not fixed pixel values, so they stay correctly anchored as the replica
scales.

**Motion behavior**: on scroll into view — replica fades/scales in first
(e.g. `opacity 0→1`, `scale(.985)→scale(1)`, ~500ms), then arrow lines draw
in via `stroke-dashoffset` animation staggered roughly 150ms apart, then
labels fade/translate in shortly after each of their arrows.

**Recommended implementation technique**:
```css
.product-map { position: relative; aspect-ratio: 16 / 10; }
.product-map > .replica { width: 100%; height: 100%; }
.product-map__lines { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; }
.callout { position: absolute; left: var(--x); top: var(--y); max-width: 13rem; }
```
```css
.product-map__lines path {
  fill: none; stroke: var(--accent); stroke-width: 3;
  vector-effect: non-scaling-stroke; stroke-linecap: round;
  stroke-dasharray: 1; stroke-dashoffset: 1;
  transition: stroke-dashoffset 700ms cubic-bezier(.22,1,.36,1);
}
.product-map.is-visible path { stroke-dashoffset: 0; }
```
Each `<path>` using `stroke-dasharray: 1`/`stroke-dashoffset: 1` must also
set `pathLength="1"` as an SVG attribute, otherwise the dash values are
interpreted in userspace units rather than as a 0–1 fraction of the path.

**Performance safeguards**: this section renders from static/sample props
only — no real Supabase calls originate from it, regardless of its local
interactivity.

**Reduced-motion fallback**: replica and callouts appear immediately at
final state, no draw-on or stagger.

**Acceptance criteria**: replica visually matches the real dashboard's
current styling closely enough to be recognizable; local interactions
(hover/tab/toggle/highlight) work without any network calls; callouts are
legible and correctly positioned at common breakpoints.

---

## 6. Three feature-demo videos

**Purpose**: show, not just tell — short looping clips illustrating specific
features (document capture, reminders/renewals, and one general product
demo).

**Desktop composition**: IMPLEMENTATION RECOMMENDATION — alternating
left/right row layout (video occupying roughly 55–60% width, supporting text
40–45%, alternating sides row to row), each row scroll-triggered
independently, rather than a stacked pinned sequence (judged too heavy for
three short clips) or small side-by-side cards (judged too small to read the
demo clearly).

**Mobile composition**: single column — video full-width above its text on
narrow viewports, alternating left/right collapses to a consistent stacked
order.

**Responsive behavior**: standard reflow at the row level; video maintains
its own aspect ratio via a CSS `aspect-ratio` box so layout doesn't jump
while the video loads.

**Motion behavior**: each row fades/translates in on scroll into view,
independent of the others (no shared master timeline required).

**Recommended implementation technique**: LOCKED DECISION — every video is
lazy-loaded via `IntersectionObserver`, `preload="none"`, with a required
poster image, and is played/paused based on visibility (played roughly when
~35–50% visible, paused when scrolled well out of view or when the browser
tab is hidden). `muted`, `loop`, `playsinline` on all video elements for
users without `prefers-reduced-motion` set. Under `prefers-reduced-motion`,
looping videos must NOT autoplay — show the poster image (or final frame)
instead and provide an accessible play control so a user can opt in to
playback. VERIFIED issue: source screen-recording files initially included a
visible recording-app playback bar at the bottom edge; these must be cropped
(the `*-clean.mp4` files) before use — never ship the raw uncropped
recordings.

**Performance safeguards**: at most one or two videos actively playing at
once; explicit width/height or `aspect-ratio` reserved so no layout shift
occurs; mobile should be served a smaller source than desktop where
practical (`TBD` whether separate mobile-resolution encodes will be produced,
or whether the existing `-clean.mp4` files are used as-is for both). Poster
images do not currently exist for any of the three videos — they are
required assets to be created, not assets already available.

**Reduced-motion fallback**: N/A for the row entrance animation (simple
fade/translate is acceptable even under reduced-motion at low magnitude).
Video playback itself follows the reduced-motion rule above: poster/final
frame shown, no autoplay, accessible play control provided.

**Acceptance criteria**: no video plays until scrolled near (and, under
reduced-motion, does not autoplay at all); poster shows before playback
starts; no visible recording-app chrome in any clip; smooth row entrance with
no layout jump.

---

## 7. Founder / personal section

**Purpose**: humanize the product — a large photo and short honest story
(built by a high-school student solving a problem they actually had). The
exact public wording describing Mukesh as a high-school student requires
Mukesh's explicit approval before shipping — it is not locked copy (see
CONTEXT-MASTER.md Section 14).

**Desktop composition**: large portrait/photo of the founder paired with
oversized name typography that overlaps the photo's edge, plus 2–3 sentences
of honest copy.

**Mobile composition**: TBD in detail — likely a simplified single-viewport
stacked layout (photo, then overlapping name treatment scaled down, then
copy) rather than any multi-viewport scroll-pinned sequence.

**Responsive behavior**: TBD pending the desktop-vs-pinned decision below.

**Motion behavior / open decision — TBD**: two approaches were researched
and neither is finalized:
- A scroll-pinned, multi-viewport "story" treatment (photo held via
  `position: sticky`, GSAP-revealed name typography, photo fading out over
  an extended scroll range) modeled on a real personal/portfolio site using
  roughly this structure.
- A simpler, single-viewport static section with a modest entrance animation
  only (photo fade/scale in, name reveal from a clipped wrapper, copy fade
  up) — no pin, no extended scroll-height section.
Given this is one section among many (not the entire page's narrative), the
simpler static approach is the safer default unless a stronger visual case is
made for the pinned version.

**Recommended implementation technique** (static version):
```css
.founder-photo { border-radius: 28px; object-fit: cover; }
.founder-name {
  font-size: clamp(64px, 9.5vw, 144px);
  line-height: .88; letter-spacing: -.045em;
}
```
Name typography should visually overlap the photo's edge by roughly
12–18% of its width for the "oversized name" effect referenced in the
visual research.

**Performance safeguards**: one photo, no video in this section; if the
pinned variant is later chosen, cap its total scroll height reasonably (a
researched reference used ~190svh for this pattern; that is not a locked
value here, just a reference point).

**Reduced-motion fallback**: static final-state layout, entrance animation
skipped.

**Acceptance criteria**: photo and name are both legible at common
breakpoints; copy is honest and specific (not generic marketing language),
and its public framing of Mukesh's background has Mukesh's sign-off; no
layout overlap issues on narrow viewports.

---

## 8. Closing CTA

**Purpose**: the one deliberate conversion moment on the page, after the user
has seen the product story.

**Desktop composition**: large confident headline, one clear orange
pill-shaped CTA button, generous whitespace, light/cream background
consistent with the rest of the page.

**Mobile composition**: same content, stacked, button full-width or
comfortably sized for touch.

**Responsive behavior**: standard reflow, no special technique required.

**Motion behavior**: simple fade/translate entrance on scroll into view.

**Recommended implementation technique**: plain CSS/Framer Motion entrance;
no GSAP/ScrollTrigger complexity needed for this section.

**Performance safeguards**: none beyond general section-entrance discipline.

**Reduced-motion fallback**: appears at final state immediately.

**Acceptance criteria**: exactly one primary conversion CTA on the page,
consistent with the "orange used sparingly, one accent" rule. Navigation
links, video play controls, and accessibility controls are not counted
against this — they may still exist as buttons/links elsewhere on the page.

---

## 9. Footer curtain reveal

**Purpose**: a polished closing moment where the footer appears to rise up
from behind the page content as the user reaches the bottom.

**Desktop composition**: footer content (links, copyright, sign-in link)
sits on an orange/accent background that appears to be revealed rather than
simply scrolled to.

**Mobile composition**: IMPLEMENTATION RECOMMENDATION — revert to a normal,
non-fixed footer on short mobile viewports (or below a defined height
threshold) so mobile browser address-bar resizing doesn't cause visual
jumps.

**Responsive behavior**: footer height should be responsive
(`clamp(300px, 38vw, 520px)` was the researched reference value) rather than
a single fixed pixel height.

**Motion behavior**: LOCKED DECISION — VERIFIED RESEARCH OBSERVATION — this
does NOT require scroll-progress JavaScript or animating the panel's height.
The correct technique is a fixed-position footer combined with page content
whose bottom margin exactly equals the footer's height; the footer is simply
uncovered as the page content's normal flow ends. No GSAP required for the
base mechanism.

**Recommended implementation technique**:
```css
.page-content {
  position: relative; z-index: 1;
  margin-bottom: var(--footer-height);
}
.site-footer {
  position: fixed; z-index: 0; inset: auto 0 0;
  height: var(--footer-height);
  background: var(--accent);
}
@media (max-width: 580px), (max-height: 650px) {
  .page-content { margin-bottom: 0; }
  .site-footer { position: relative; height: auto; min-height: 420px; }
}
```
If interior parallax is desired later, animate footer *content*
(`translateY`) via GSAP `scrub`, never the panel's `height` itself (height
animation forces layout on every frame).

**Performance safeguards**: no per-frame height/layout recalculation; the
mechanism is pure CSS positioning.

**Reduced-motion fallback**: N/A — there is no motion to disable in the base
implementation; if interior parallax is added later, it should respect
reduced-motion like any other transform animation.

**Acceptance criteria**: footer reveal feels smooth with zero JavaScript
scroll-jank; behaves sanely on mobile without address-bar-triggered layout
jumps.

---

## 10. House of Yellow motion/flow lessons (cross-cutting)

Observations from a real production site used as a choreography reference
(not a visual/palette reference — its dark palette is explicitly NOT to be
copied, per CONTEXT-MASTER Section 6):
- Consistent, repeated timing rules across many sections read as "considered
  motion design" more than any single flashy effect does. IMPLEMENTATION
  RECOMMENDATION (exact stagger/duration/easing values were not directly
  verified against the source, and should not be treated as measured fact):
  a masked headline reveal (characters/rows animate from `translateY` inside
  an `overflow: hidden` wrapper, roughly 450–550ms, roughly 8–12ms
  per-character stagger, a `power3.out`-style easing) used repeatedly rather
  than varied per section.
- Row/section entrances used simple `opacity`/`translateY` CSS transitions
  toggled by one shared `IntersectionObserver` adding an `.is-inview` class,
  NOT ScrollTrigger for every single reveal — ScrollTrigger was reserved for
  genuinely scroll-linked/pinned sequences (like the dive and the curtain
  concept), while ordinary "fade up on enter" reveals used plain
  Observer-driven CSS transitions. This is a meaningful cost-saving pattern:
  do not reach for GSAP ScrollTrigger for every simple entrance.
- Video performance on that reference site relied on promoting a `data-src`
  attribute to a real `src` only once a video neared the viewport
  (via IntersectionObserver with a generous rootMargin, roughly one viewport
  above/below), and pausing again once it moved far away — directly informing
  Section 6's video strategy above.

## 11. GSAP/ScrollTrigger vs Framer Motion — responsibilities
IMPLEMENTATION RECOMMENDATION:
- **GSAP + ScrollTrigger**: reserved for genuinely scroll-linked or pinned
  sequences — the hero scroll-dive, and any interior parallax added later to
  the footer. Not used for ordinary "fade up on scroll into view" entrances.
- **Framer Motion**: general React component entrance/exit animation,
  hover/tap micro-interactions, and any shared-layout transitions — already
  the dominant animation library used elsewhere in this codebase
  (`motion.div`, `useMotionValue`, `MotionConfig reducedMotion="user"`,
  `staggerItem` helper referenced in the existing dashboard code), so new
  landing-page component-level animation should follow that same convention
  rather than introducing a third pattern.
- Plain CSS transitions/`IntersectionObserver`: preferred default for simple,
  one-shot section reveals (marquee, stat band, ordinary fade-ups) per the
  House of Yellow lesson above — cheaper than reaching for a JS animation
  library every time.

**Animation ownership rule — LOCKED DECISION**: never let GSAP, Framer
Motion, and CSS transitions simultaneously control the same `transform` or
`opacity` property on the same element. Each animated element's `transform`
and `opacity` should have exactly one owning animation system at a time;
switching systems (e.g. handing off from a GSAP scroll-driven sequence to a
CSS hover transition) must happen at a clean boundary, not concurrently.

## 12. Whether Lenis (smooth scroll) is justified — TBD, native scroll is the default
Lenis was raised in research as commonly paired with GSAP ScrollTrigger for
WebGL-driven or heavily pinned sequences, to keep scroll velocity/timing
consistent with `scrub` animations. The default recommendation is native
browser scrolling — do not add Lenis speculatively or simply because
reference sites use it. Only adopt Lenis if real device testing demonstrates
that the scroll-dive (Section 2) cannot stay smooth on representative
hardware without it. IMPLEMENTATION RECOMMENDATION if adopted: disable Lenis
entirely under `prefers-reduced-motion`, and never enable it inside the
authenticated dashboard (native scroll is preferred there for
predictability).

## 13. Why WebGL should be used only where it creates meaningful value
IMPLEMENTATION RECOMMENDATION: an earlier full Three.js/R3F hero attempt on
this project caused a real runtime crash and was abandoned in favor of a
simpler approach (see CONTEXT-MASTER Section 10). Any future WebGL use (e.g.
a literal 3D laptop model for the dive, if pursued) should be scoped narrowly
to the hero route only, should not run on the authenticated app routes, and
should be evaluated against the simpler CSS/photo-based approach already
working before adding the complexity back. Maximum one WebGL canvas at a
time if used at all; unmount it once no longer needed.

## 14. Video loading strategy (summary — see Section 6 for full detail)
`preload="none"`, poster required (posters do not exist yet — required
assets to be created), IntersectionObserver-driven play/pause, pause on
tab-hidden, cropped source files only (`-clean.mp4`), muted/loop/playsinline
for standard playback, no autoplay under `prefers-reduced-motion` (poster/
final frame + accessible play control instead), at most one or two videos
playing concurrently.

## 15. Full-bleed media behavior (summary — see Section 1 for full detail)
Preferred structure is a genuinely full-width root section with no ancestor
`max-width` constraint (with `overflow-x: clip` where needed); the `100dvw`
breakout pattern is a fallback for constrained ancestors, not the default.
Audit the full parent chain for `max-width`/padding whenever an unexplained
edge gap appears — VERIFIED as the actual root cause of a real bug hit during
implementation, not a hypothetical.

## 16. Accessibility
- `prefers-reduced-motion` respected in every animated section listed above,
  including disabling video autoplay (Section 6).
- Default system cursor only, everywhere on the landing page (LOCKED
  DECISION, restated from CONTEXT-MASTER Section 12).
- Measured palette contrast (relative to the locked landing palette in this
  document's header):
  - `#1e1c18` (ink) on `#fbf7ef` (canvas): approximately 15.92:1 — safe for
    all text sizes.
  - `#e8783a` (accent orange) on `#fbf7ef` (canvas): approximately 2.74:1 —
    below the threshold for normal-size text; do not use orange for
    normal-size body/label text on cream. Large/bold display text or
    non-text UI elements may still qualify depending on exact size/weight —
    verify against WCAG large-text thresholds case by case.
  - `#1e1c18` (ink) on `#e8783a` (accent orange): approximately 5.82:1 — use
    ink-colored text on orange buttons/surfaces, not white or light text.
- All decorative marquee content marked `aria-hidden` on its duplicated set.

## 17. Component architecture — TBD
Not yet fully specified. IMPLEMENTATION RECOMMENDATION: per the existing
Next.js Server/Client Component convention already used elsewhere in this
project, keep non-interactive structural markup as Server Components and
scope `"use client"` narrowly to the specific interactive/animated pieces
(hero dive controller, marquee, count-up numbers, video players, SVG callout
drawer, the interactive dashboard replica) rather than marking entire page
sections client-side by default.

## 18. Implementation sequence
Follow the LOCKED section order from CONTEXT-MASTER Section 8, phase by
phase, with Mukesh's explicit browser verification between each phase before
proceeding to the next — per the collaboration protocol in CONTEXT-MASTER
Section 13. Do not build multiple sections in one uncommitted pass.

## 19. Final QA checklist (apply before considering the landing page done)
- [ ] Hero: image covers the viewport without empty columns, laptop screen
      and baked headline stay in the safe focal region, no CTA button
      present
- [ ] Dive: genuine zoom-toward-the-laptop-screen using the coordinate-mapped
      approach, smooth on a mid-range machine, no flash/pop at handoff
- [ ] Stats: count up once via a single shared IntersectionObserver, correct
      final values, no layout shift
- [ ] Marquee: no seam jump, pauses on hover, reduced-motion fallback works
- [ ] Mini-dashboard: local interactivity (hover/tab/toggle) works, zero
      Supabase/API calls fire from this section
- [ ] Videos: no visible recording-app chrome, lazy-loaded, poster shown
      before play (posters created), no autoplay under reduced-motion
- [ ] Founder section: copy is honest/specific, legible at all breakpoints,
      public framing of Mukesh's background approved by Mukesh
- [ ] CTA: exactly one primary conversion CTA, orange, pill-shaped
- [ ] Footer: no scroll-jank, sane behavior on short mobile viewports
- [ ] Global: default cursor throughout; no full-page dark-theme drift (the
      contained dark-glass dashboard replica in Section 5 is an intentional
      contrast section, not a violation); `prefers-reduced-motion` honored
      across every section; no element has more than one animation system
      simultaneously owning its `transform`/`opacity`
- [ ] Verified live in-browser by Mukesh — not by agent self-screenshot
