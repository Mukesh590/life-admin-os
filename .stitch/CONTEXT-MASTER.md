# Life AdminOS — Context Master
Last verified against repo: HEAD 9d91c6f, branch landing/hero-recovery

## 1. Product purpose and positioning
Life AdminOS is a personal life-administration web app: it tracks subscriptions,
bills, deadlines, documents, appointments, and warranties in one place, with
AI-assisted document extraction. Built solo by a high-school-age developer as a
real, deployed, multi-user product — not a demo — with a small early user base;
exact active-user count TBD. Positioned honestly as "a personal operations
system," not an enterprise SaaS and not a full "AI life OS" with
agents/vision-boards/habit coaching (that scope was explicitly rejected — see
Section 9).

## 2. Stack and infrastructure ($0 current operating constraint)
- Next.js 14 App Router + TypeScript
- Tailwind CSS
- Framer Motion + GSAP/ScrollTrigger
- Supabase — Postgres, Auth (email/password), Storage (bucket: `documents`,
  10MB limit, PDF/PNG/JPG/JPEG only)
- Google Gemini via `@google/generative-ai` for AI document extraction —
  chosen over Anthropic API because Claude Pro credits are separate from API
  billing. Current model identifier and free-tier limits must be verified
  against the code and provider documentation before alteration.
- Vercel — hosting + auto-deploy from GitHub `Mukesh590/life-admin-os`
- shadcn/ui components where used
- react-three-fiber / three.js used narrowly (dashboard GlassOrb; hero R3F
  attempt previously caused a crash and was replaced — see Section 10)
- Current operating constraint is $0 monthly infrastructure cost. Any paid
  dependency requires Mukesh's explicit approval.

## 3. Existing routes
Landing (`/`), auth (signup/login/reset), `/dashboard`, `/subscriptions`,
`/deadlines`, `/documents`, `/bills`, `/appointments`, `/warranties`,
`/settings`, `/privacy`. Exact total route count not verified in this pass —
confirm against the current route tree before citing a number elsewhere.

## 4. Supabase schema — 7 tables
RLS is required and reported configured for all user-data tables, but must
receive a dedicated code/database-policy audit before being treated as
security-verified.

1. `users_profile` — id (uuid → auth.users), full_name, avatar_url, timezone,
   created_at
2. `subscriptions` — id, user_id, name, amount, currency, billing_cycle,
   next_renewal_date, category, status, cancel_reminder, notes, logo_url,
   created_at, updated_at
3. `deadlines` — id, user_id, title, due_date, category, priority, status,
   recurring, recurrence_pattern, notes, created_at
4. `documents` — id, user_id, file_url, file_name, document_type, vendor_name,
   amount, key_date, expiry_date, description, category, ai_extracted (bool),
   confidence_score, created_at
5. `bills` — id, user_id, name, amount, due_date, paid, recurring, category,
   notes, created_at
6. `appointments` — id, user_id, title, date_time, location, notes,
   reminder_sent, created_at
7. `warranties` — id, user_id, product_name, purchase_date, expiry_date,
   coverage_notes, receipt_url, created_at

## 5. Security / privacy constraints — LOCKED DECISION, non-negotiable
- No bank account numbers, card numbers, or SSNs are ever collected. No form
  fields for them exist and none should ever be added.
- Only sample/own data or real users' own subscription/bill/deadline
  metadata — never other people's sensitive financial data at scale.
- RLS enforced on every table; user_id scoping should be verified via a
  dedicated audit, not assumed (see Section 4).
- API keys only in environment variables, never in source.
- Privacy policy page exists at `/privacy` stating the above honestly.
- Real multi-user product: anyone can sign up; this is a genuine
  responsibility, treated seriously (see Section 12, role split).

## 6. Two-world visual system — LOCKED DECISION
- **Marketing / landing page**: light, cream, Apple-clean. NEVER dark. An
  earlier attempt drifted into a dark-orange void and was explicitly scrapped;
  light-mode is a hard rule for this surface, restated multiple times.
- **Authenticated dashboard** (`/dashboard` and inner app pages): warm dark
  glassmorphism — frosted glass cards over a warm blurred photographic
  background (bookshelf/plants/lantern reference image), single warm orange
  accent, inspired directly by a specific glassmorphism dashboard reference
  image (internally referred to as "IMG_4371"). This is intentional and
  already implemented (commit c45ab14) — do not unify the two palettes.

## 7. Locked landing-page palette and typography
```
--canvas: #fbf7ef
--canvas-alt: #f1ebe1
--ink: #1e1c18
--accent: #e8783a
--accent-soft: #f6d8c5
--line: rgba(30, 28, 24, 0.14)
```
Typography: Bricolage Grotesque (display, weight 650–750) + Inter (body,
weight 400/500). This supersedes any earlier Syne/DM Sans pairing used on the
dashboard — the landing page has its own type system.

## 8. Locked landing-page section order
1. Hero — full-bleed device-mockup photo, scroll-dive entry point, no CTA
   button (page invites scrolling, not clicking)
2. Scroll-dive handoff into device screen
3. Stats band — count-up numbers
4. Marquee ticker — content TBD: product benefits/life-admin categories
   versus technology logos
5. Annotated miniature dashboard — code-built replica (dark-glass style,
   deliberate contrast moment inside the light page) with animated SVG
   callout arrows explaining features
6. Three feature-demo videos (lazy-loaded)
7. Founder section — large photo + oversized overlapping name + short honest
   story
8. Closing CTA — headline + one orange button
9. Footer — curtain/panel reveal on scroll

## 9. Feature inventory

### Currently built and live
Full auth flow, 6 entity CRUD systems (Subscriptions, Deadlines, Documents,
Bills, Appointments, Warranties), Gemini AI document extraction, Supabase
Storage uploads, personalized dashboard (KPI strip, widget grid, Cost Forecast
chart: subscriptions vs bills 6-month projection), Settings (profile,
notification prefs, CSV export, account deletion), Privacy Policy page,
warm-glass dashboard visual system including a GlassOrb component whose
material responds to real urgency data (overdue deadlines / expiring items).

### 13 LOCKED planned features (all $0, no new infrastructure) — "no argument,
we are adding all 13"
1. Streak tracking (e.g. consecutive on-time bill payments)
2. Auto-rolling weekly/monthly summary digest — must always show trend vs
   previous period, never a flat snapshot
3. Habit-style completion checkmarks for recurring tasks, with streaks
4. AI weekly report — plain-language summary via existing free Gemini quota
5. Color-coded urgency flagging (green/yellow/red by days-until-due),
   consistent across all 6 entity types
6. "System entropy" nudge insights (e.g. "3 bills went unpaid this month")
7. Kanban-style alternate view for deadlines/tasks (To Do / In Progress /
   Done)
8. Quick capture / universal inbox — fast "add anything" input, sorted later
   (Inbox → Processed pattern)
9. Completion score / progress ring ("how on top of things" indicator)
10. Budget limits per category — monthly cap, progress bar, "limit reached"
    flag
11. Rollover / procrastination tracking — flags items pushed forward
    repeatedly (e.g. "pushed 3x")
12. Optional weekly focus note — one short line shown on dashboard
13. Missing-documentation flag — warranties/bills with no receipt attached
    get an upload nudge

### 7 standing craft principles (apply to all future feature work)
Every element must earn its place; Inbox → Processed pattern; prefer computed
formulas over manual re-entry; treat an empty/zero state as a success state,
not a blank one; always show trend/comparison, never an isolated snapshot;
exactly one clear "next action" should be visible at a time; inputs/prompts
stay short and fast, never long forms.

### Explicitly rejected as scope creep — LOCKED DECISION
Vision statements, identity/"higher-self" systems, DRIP matrix, skill trees,
macro/nutrition tracking, a "Second Brain" knowledge library, a 5-agent AI
system, Plaid/bank integrations, a separate meetings database. These belong
to a different, much larger product and were deliberately cut after reviewing
a comparable competitor product in depth.

## 10. Problem/fix history (condensed — do not re-litigate these)
- Two similarly-named local folders existed early on; the correct one is
  `life-admin-os`.
- AI extraction originally spec'd for Anthropic API, switched to Gemini free
  tier for cost reasons.
- An early Three.js/R3F hero (`HeroShaderScene.tsx`) crashed
  (`TypeError: Cannot read properties of undefined (reading 'S')`); replaced
  with a pure Canvas shader, and later that whole approach was superseded by
  the current photographic hero.
- A v0.dev branch was promoted to production by accident, breaking the live
  site (no Supabase/auth wiring); fixed by reverting the Vercel production
  branch to master and deleting the v0 branch.
- Skill-path bugs: two referenced skills (`design-taste-frontend`,
  `web-design-guidelines`) turned out to be broken symlinks pointing nowhere,
  which silently prevented real design changes for a long stretch. Verified
  working skills live at real plugin-cache paths.
- Token bloat from 90–100+ loaded skills was cleaned up via
  `settings.json` plugin toggles and moving irrelevant (trading, video/mobile)
  skill folders to backup directories outside the active skills path.
- Supabase free-tier auto-pause (after ~7 days inactivity) caused both an
  "authentication failed" error and a `504 MIDDLEWARE_INVOCATION_TIMEOUT`;
  fixed by resuming the project in the Supabase dashboard. Standing
  knowledge: check Supabase pause status first if auth/timeouts recur.
- A dashboard-side redesign pass fixed a real accessibility bug (muted text
  measuring ~1.7:1 contrast, corrected to `--text-muted #8A8AA3` at ~5.8:1)
  and removed a duplicate/competing manual-parallax animation system that was
  fighting the primary Framer Motion tilt effect.
- Landing hero (current phase) hit: an empty white column at some viewport
  widths (root-caused to a parent container/`max-width` constraint, not
  `object-fit` itself — fixed via a `100dvw` breakout pattern
  `left: 50%; transform: translateX(-50%)`); an over-zoomed resting state
  caused by a leftover `FOCAL_X = 0.32` bias from an earlier task (reset to
  0.5); repeated dev-server cache corruption causing stale builds across
  ports 3002–3007; and one instance of Claude Code deleting
  `device-mockup.png/.jpg` without asking (unrecoverable, files were
  untracked).

## 11. Canonical assets vs source/unoptimized duplicates
- `hero-full.jpg` — current required hero asset; currently the only asset
  referenced by implementation code (`src/app/page.tsx`).
- `founder-photo.jpg` — preferred optimized product asset. `founder-photo.png`
  is the larger source duplicate.
- `dashboard-bg.jpg` — preferred optimized dashboard-only asset.
  `dashboard-bg.png` is the larger source duplicate. Reserved exclusively for
  the authenticated `/dashboard` route; must never be used as a landing-page
  background (see Section 6).
- `*-clean.mp4` files (`device-screen-demo-clean.mp4`,
  `document-capture-demo-clean.mp4`, `reminder-demo-clean.mp4`) — planned
  production videos (recording-app playback bar cropped off). Of these, only
  `device-screen-demo-clean.mp4` is currently referenced, and only by the
  phase spec document, not yet by implementation code.
- Non-`-clean` MP4 files (`device-screen-demo.mp4`,
  `document-capture-demo.mp4`, `reminder-demo.mp4`) — source/unoptimized
  duplicates, not for direct product use.
- The remaining assets beyond `hero-full.jpg` and `device-screen-demo-clean.mp4`
  are planned but currently unreferenced by any tracked file.
- `device-mockup.png`/`.jpg` no longer exist (deleted by accident, untracked,
  unrecoverable) — `hero-full.jpg` fully supersedes it since text and
  phone-app content are now baked directly into that image.

## 12. Performance, accessibility, mobile — LOCKED DECISIONS
- No custom/animated cursor anywhere on the landing page (a large following
  cursor circle was found laggy and explicitly removed; default system
  cursor only).
- Animations restricted to `transform`/`opacity`/SVG path properties; no
  animating `width`/`height`/`top`/`margin`.
- `prefers-reduced-motion` must be respected throughout.
- All video: lazy-loaded via IntersectionObserver, `preload="none"`, poster
  images required, paused when scrolled far away or tab hidden.
- A single 21:9-style hero photo cannot show a fully readable composition on
  every viewport without cropping or margins — this is treated as a real
  constraint, not a bug to keep chasing. `TBD`: a dedicated mobile-composed
  hero asset does not yet exist; current mobile behavior is a biased crop of
  the same wide image.

## 13. Collaboration protocol (agreed, applies going forward)
- **Roles**: Mukesh — product authority, browser QA, deployment approval.
  Claude Chat — planning, research synthesis, prompt authoring, no code
  execution. Claude Code — primary implementer in the working tree. Codex CLI
  — independent reviewer/tester/debugger/security auditor, secondary
  implementer only on explicit handoff. ChatGPT (separate environment,
  no automatic repo access) — live-site research, asset generation, protocol
  negotiation.
- **Single-writer rule**: only one agent edits the working tree per turn;
  `.stitch/HANDOFF.md` names the current active writer.
- **Source-authority hierarchy** (highest to lowest): (1) Mukesh's latest
  explicit approved decision, (2) this file, `CONTEXT-MASTER.md`, (3) the
  current phase spec (e.g. `LANDING-RESEARCH-FINAL.md`), (4) supporting
  visual/motion documents, (5) `HANDOFF.md` (status only, never a source of
  requirements), (6) agent assumptions, lowest authority. If two
  higher-authority sources conflict, stop and ask Mukesh — do not resolve
  silently.
- **Commit vs deploy**: local checkpoint commits on the working branch are
  considered safe and reversible and may happen before Mukesh's browser
  verification, specifically so Codex can review a stable SHA. Nothing is
  ever pushed to the production-connected branch or deployed without Mukesh
  explicitly saying "deploy."
- **Browser verification**: Claude Code's own self-verification (screenshots
  it takes of its own work) has proven unreliable in this project — it has
  reported "fixed" states that were not actually fixed live. Mukesh performs
  all real browser verification going forward; agents report what they
  changed and stop.

## 14. Open / undecided items — TBD
- Exact greeting/display-name field behavior for the dashboard.
- Final scroll-dive technique choice: the existing WIP's screen-coordinate
  mapping + `scale/x/y` transform approach targeting the laptop screen is the
  current preferred foundation (see LANDING-RESEARCH-FINAL.md Section 2);
  exact tuning and the aligned crossfade/mask handoff after the screen fills
  the viewport remain TBD.
- Founder section: scroll-pinned multi-viewport treatment vs. a simpler
  single-viewport static layout.
- Disposition of `motion-analysis-main.md` and `motion-reference-test-main.html`
  (currently untracked, unreferenced by the app) — keep as reference,
  formally incorporate, or remove.
- A dedicated, separately art-directed mobile hero image.
- Founder copy publicly describing Mukesh as a high-school student requires
  Mukesh's explicit approval before shipping — not locked wording.

## 15. Note on scope of this document
`.stitch/HANDOFF.md` owns all transient Git status: current dirty files,
active writer, checkpoint SHAs, in-progress issues. That information must
never be duplicated into this file. This file holds durable product/design
decisions only.
