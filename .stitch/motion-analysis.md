# Motion Analysis — Reference Screen Recordings (v2 — corrected/deepened)

**Source files:** `ScreenRecording_07-22-2026 13-45-34_1.mp4` (58s, 888x1920, 60fps), `ScreenRecording_07-22-2026 13-46-57_1.mp4` (45s, 888x1920, 60fps)
**Method (v2):** ffmpeg scene-cut detection first (`select='gt(scene,0.1)'`), then a full re-scan of every previously-dismissed region at 3fps (0.33s) to catch site UI that a coarser 1fps first pass missed, then **dense extraction at 25fps-equivalent (0.04s spacing)** on every window that showed real structure, reviewed as tiled contact sheets.

## 0. Correction notice

**This version supersedes `motion-analysis.md` v1.** The first pass sampled too coarsely (0.1–0.2s) and, in the "Sorry but Claude Code can't do this" and related reels, mistook a **dense, fast-cut portfolio-site showcase montage** for generic stock B-roll photography — there was no UI chrome *visible in the frames that were sampled*, but denser sampling reveals real site content, real transitions, and several distinct, well-defined animation techniques in between the cuts. The account (`hassenzerasoft`) posts reels that are literally compilations of many different client/portfolio websites, each shown for a fraction of a second, stitched together with the account's own recurring transition bumpers. Both are present and are now distinguished from each other below.

**Corrected verdicts vs. v1:**
| Clip | v1 verdict | v2 verdict |
|---|---|---|
| "Sorry but Claude Code can't do this" / "SORRY BRO..." / "Era of Premium Websites" reels (video 1, ~sec14–58) | Excluded — assumed stock B-roll | **Richest material in the set** — a fast portfolio-site showcase containing 6+ distinct, describable animation techniques (below) |
| "What happens to websites when you leave CLAUDE" (video 2, ~sec36–44) | Insufficient — assumed <1s glimpses | **Analyzable** — contains a multi-stage scroll-driven label sequence with a hand-drawn line-draw annotation, holding ~0.3–0.5s per stage |
| Real-estate site + SON DAVEN (video 2, ~sec1.5–27.5) | Analyzable / partially analyzable | **Unchanged** — this read was already correct, retained below |
| "LA BURBUJA IBERICA" (video 2, ~sec32–40) | Excluded — no motion detected | **Still low-confidence** — a color-fade-out was glimpsed at the tail in the coarser re-scan but wasn't captured in a dense pass this round; flagged as unconfirmed, not re-asserted as motion-free either (see §6) |

---

## 1. Entrance Sequence

Still true from v1: **no clean multi-element staggered hero entrance (nav → headline → subhead → CTA) appears anywhere in either recording.** But several genuine, narrower "reveal" techniques are now confirmed with dense frame evidence, all functioning as their own kind of entrance (of a card, a headline, a badge) even though none of them is the classic staged hero pattern.

### 1a. Icon-glitch letter substitution (confirmed twice, independently — strongest signal in this section)
Observed in two different site clips:
- **"it's wearable"** (video 1, ~sec30.5–31.4): preceded by a continuously rotating 3D product render (a pill/coin-shaped object turning in place, looping). Text "it's" fades in, then "it's w[X]rable" appears where **[X] is a themed red circular icon glitching in place of the letter "o"** for ~8–10 frames (~0.32–0.4s), flickering/shifting slightly each frame. It then resolves to clean "it's wearable" text, which holds for ~0.6s+.
- **"String Tune"** (video 2, ~sec36.5+): site name text visibly glitches between garbled character states ("Strina Tu...") before resolving to clean "String Tune" over a comparable ~0.3–0.4s window.

**This is not character-scramble** (random letters cycling) as v1 guessed for a different clip — it's a **single glyph/icon substituted for one letter**, glitching briefly before the correct character resolves. Order: rotating product render holds → text fades in → one letter is glitch-replaced → resolves to clean, static hold. Easing character: discrete substitution, not a continuous tween; no overshoot. This is the single most reproducible, well-defined "reveal" technique in the source material.

### 1b. Multi-beat staged headline reveal (confirmed twice)
- "We have reinvented the future of logistics" builds up in fragments over ~0.3–0.6s (video 1, ~sec31.9–32.5), then the sentence **continues across a hard cut** to a different background image ("...through the yard," ~sec32.6–33.1) — the copy persists as one continuous thought even though the visual cuts.
- "AI-native technology" → "that turns manual tasks" → "into connected missions." (video 1, ~sec33.5–34.8) assembles in **three discrete beats**, each beat appearing over successive frames rather than the whole line fading in at once.

Order: background/photo is already in frame → first phrase fragment appears → holds briefly → next fragment appears (either appended to the same line, or under a hard cut to new imagery) → full phrase holds. This is a legitimate, reproducible staged-text pattern — closer to `motion-doctrine`'s "staged reveals" route than anything found in v1.

### 1c. Rotating + color-cycling badge/seal icon
A geometric spoked/hexagonal badge icon (video 1, ~sec49.5–50) rotates slightly frame-to-frame while cycling color from gold/amber to purple/pink over roughly 8–10 frames (~0.3–0.4s). Distinct from 1d below (this one has a rotation component; the ring/orb bumper does not appear to rotate, only pulses color).

### 1d. Hand-drawn line-draw annotation + label cycle (video 2, "What happens to websites when you leave CLAUDE," ~sec36.5–41)
A thin, sketchy/squiggly line draws itself (stroke growing across ~6–8 frames, ~0.24–0.32s) next to a plain white rounded label card, which cycles through several short words as if scroll-triggered: "String Tune" → "Concert" → "Concentrate" → "Keep Scrolling." Each label holds ~0.3–0.5s before the next line-draw + label swap. The final label, "Keep Scrolling," is a literal on-page affordance text, which suggests this whole sequence is one site's own scroll-narrative UI (a hand-drawn-style annotation that re-draws itself at each scroll stop next to a changing word), not a multi-site montage. **Confidence: medium-high** — the literal "Keep Scrolling" instruction is a strong tell this is genuine site UI, not an editor bumper.

---

## 2. Scroll Behavior

### 2a. Real-estate property-card swipe (unchanged from v1 — still the strongest scroll-adjacent signal)
Prabhadevi → Bandra West → Mahalakshmi → 25 Downtown (video 2, ~sec6.6–9.0). Each card holds static ~0.6–1.0s, transitions via a directional blur/slide over ~0.3–0.45s with no overshoot, settles smoothly. Whole-panel carrier, no internal element stagger, no parallax, no pinning observed. Direction (horizontal vs. vertical) still not confidently resolvable at available resolution — retained as a flagged assumption (horizontal).

### 2b. Continuous camera pan (new finding, video 1, ~sec19–22)
A different, non-cut-based motion signature: a **slow, continuous dolly/pan across a dark interior**, moving toward a bright window/light source, ending on a silhouetted figure. No cuts within this ~3s window — the camera itself moves, smoothly and continuously, rather than the content changing via discrete transitions. This is a distinct technique from every card-based transition elsewhere in the set: a **sustained camera-move shot** used as a hero/ambient background, consistent with `motion-doctrine`'s "camera with intent" sustained-motion route (establish wide → travel → arrive on subject).

### 2c. Animated hue-cycling gradient background (new finding, video 1, ~sec25.5–28)
Behind a static laptop product mockup, the background color **smoothly and continuously cycles hue** — cyan → green → teal → navy — over roughly 2.5–3 seconds, looping. The same technique (a cycling gradient background) reappears behind a later title card ("Powered by AI," ~sec28–29), confirming it's a reusable background treatment, not a one-off. This is real, continuous, non-cut motion — the clearest evidence in the whole set of an **animated (not static) gradient**, and a legitimate technique to reproduce (CSS `background-position` cycling on a multi-stop gradient, or an animated `hue-rotate` filter).

### 2d. Recurring transition devices (editor bumpers — distinguished from site-native motion)
Three consistent, repeated transition devices recur across cuts in video 1's showcase reels — these belong to the **reel editor's own toolkit**, not to any individual site, but are real, well-defined, and reproducible if the desire is to imitate the reel's overall pacing rather than a specific site:
1. **Motion-blur whip-pan** — a fast directional blur/streak (~0.15–0.2s) preceding a hard cut into a title card.
2. **Line-draw → ribbon-fill → iridescent-warp → glitch-dissolve** — a ~1.5–2s multi-stage wipe: a thin diagonal line grows (~0.3–0.6s) → thickens into a colored gradient ribbon (~0.3s) → the ribbon warps with an iridescent wavy distortion (~0.3–0.6s) → dissolves via a pixel-sort/datamosh glitch (~0.3s) → resolves into the next scene. Reads as a stock editing-software transition preset.
3. **Color-cycling ring/orb logo** — a circular logo mark cycles through 4–5 hues (orange → white → blue → purple → red) over ~0.3s, used as a recurring brand bumper between showcased sites. A companion glitch-text watermark ("VOR"/"WOR") appears alongside it.

### 2e. Continuous ambient particle/glow loop (new finding, video 1, ~sec46.5–50)
A product photo (pendant/jewelry on a hand) is surrounded by a continuously flickering electric/spark glow effect for the entire ~3.5s sampled window, with no discernible start or loop boundary within the window — it reads as an ambient, always-on particle effect rather than a discrete entrance. Worth noting as a technique category (continuous ambient glow) but not as a timed entrance, since no boundary was observed.

### 2f. Parallax / pinning — still not observed
No sampled sequence, in either the v1 or v2 pass, shows a background layer moving at a different rate than foreground content, or an element staying fixed while other content scrolls past it. This remains an honest negative finding, not a gap in coverage — the denser pass looked specifically for this and still found none.

---

## 3. Skill-guidance notes

- **`motion-doctrine` — Carriers / Vector Law:** the property-card swipe (2a) and the continuous camera pan (2b) both satisfy the carrier principle — something concrete (the whole card; the camera's own point of view) moves across the cut, never a bare crossfade. The multi-stage editor wipe (2d.2) is the one place that violates "2–3 transitions max, repeated" if taken as a *site's own* transition — but it's correctly attributed to the reel editor, not a site, so it doesn't count against a site's design discipline.
- **`motion-doctrine` — staged reveals / no idle wobble:** the multi-beat headline builds (1b) and the line-draw label cycle (1d) are textbook "staged reveals" (hold content back, pay it off in beats) — exactly the sustained-motion route the doctrine prefers over idle wobble. Nothing in the confirmed site-native material shows idle breathing/floating motion.
- **`motion-doctrine` — timing intents:** every confirmed site-native reveal (1a, 1b, 1d) resolves in ~300–600ms, comfortably under the 800ms single-entry ceiling; none show `bounce.out`/`elastic.out` character.
- **`gsap-core`:** the hue-cycling gradient (2c) is a `backgroundPosition` or CSS-variable tween candidate, not a transform — a reminder that not everything reduces to `x`/`y`/`scale`. The icon-glitch reveal (1a) is best modeled as a short `steps()`-like discrete swap (via `onUpdate` or a quick sequence of `gsap.set` calls), not a continuous ease.
- **`gsap-scrolltrigger`:** the line-draw label cycle (1d) is scroll-position-driven (each label is a scroll stop) — a `toggleActions`-per-stop pattern, same as the property cards, reinforcing that discrete triggering (not `scrub`) is right for this whole reference set. Still zero evidence anywhere for scrub-linked continuous motion.
- **`motion-graphics`:** unchanged from v1 — its actual content is a from-scratch video-rendering pipeline (hyperframes), not a footage-analysis tool. No hyperframes project was created; only its motion-vocabulary framing was borrowed.

## 4. What this analysis still does NOT claim

- No confident swipe direction for the property cards (horizontal assumed, not measured).
- No confident SON DAVEN entrance timing (unresolvable at available sampling rate — unchanged from v1).
- No parallax or pinning anywhere (checked again at high density, still not found).
- No confirmed motion for "LA BURBUJA IBERICA" beyond a glimpsed-but-unconfirmed fade at its tail — flagged, not asserted either way (see next section).

## 5. Still open / lower-confidence

- **LA BURBUJA IBERICA fade-out:** the 3fps re-scan showed what looks like a color transition (red → peach → white) at the tail of this clip (~sec36–37), but this wasn't re-verified with a dense 25fps pass this round. If this clip matters for the implementation, it's worth one more targeted dense extraction before relying on it.
- **Continuous ambient glow (2e):** no start/end boundary was captured, so there's no timing to reproduce — only the "continuous, always-on" character is confirmed.
- **Exact direction (2a)** and **exact hue-cycle period (2c)** would benefit from a slightly wider sampling window if more precision is needed later.

## 6. Net effect on the implementation

The standalone GSAP file built after v1 (`motion-reference-test.html`) only reproduced the property-card swipe (2a) and a scramble-text effect that, on denser inspection, turned out not to exist at the location originally claimed (v1's "text scramble" citation for the real-estate title card is still valid and unaffected; a *second*, separate "scramble" claim for a different clip was corrected to the icon-glitch technique in 1a above). The confirmed findings in §1 (icon-glitch reveal, staged headline builds, line-draw label cycle) and §2b/2c (camera pan, hue-cycling gradient) are new and not yet reflected in any code — worth a follow-up pass on the test file once you confirm which of these techniques you actually want reproduced.
