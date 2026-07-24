'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(ScrollTrigger)

// Measured against public/hero-full.jpg (1916x821px). Headline + subhead are
// baked into the image — this box is only a zoom target for the scroll-dive,
// the bounding box of the laptop screen. LOCKED FOUNDATION — do not
// recalculate without re-measuring the source asset.
const NATURAL_W = 1916
const NATURAL_H = 821
const LAPTOP_TARGET_BOX = { left: 10.1, top: 4.5, width: 44.9, height: 68.2 }

// object-fit: cover, object-position: 50% 50% — plain centered crop, no
// bias. The laptop + phone together span almost the image's full width
// (~3%-95%) at a ~2.33 aspect ratio, wider than any standard desktop
// viewport, so cover necessarily crops some of that on narrower screens —
// that's a property of the source photo's own proportions, not fixable by
// object-fit alone. Below `md` this component swaps to a <picture> mobile
// source (currently the same file, pending a purpose-composed mobile crop).
function mapPoint(wrapperW: number, wrapperH: number, xPct: number, yPct: number) {
  const wrapperAspect = wrapperW / wrapperH
  const naturalAspect = NATURAL_W / NATURAL_H
  let renderW: number, renderH: number, offsetX: number, offsetY: number

  if (wrapperAspect > naturalAspect) {
    renderW = wrapperW
    renderH = wrapperW / naturalAspect
    offsetX = 0
    offsetY = (renderH - wrapperH) / 2
  } else {
    renderH = wrapperH
    renderW = wrapperH * naturalAspect
    offsetX = (renderW - wrapperW) / 2
    offsetY = 0
  }
  return { x: (xPct / 100) * renderW - offsetX, y: (yPct / 100) * renderH - offsetY }
}

export function HeroDive() {
  const containerRef = useRef<HTMLDivElement>(null)
  const heroSectionRef = useRef<HTMLElement>(null)
  const deviceWrapperRef = useRef<HTMLDivElement>(null)
  const screenSurfaceRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()

      mm.add(
        {
          isMobile: '(max-width: 767px)',
          reduceMotion: '(prefers-reduced-motion: reduce)',
        },
        (context) => {
          const { isMobile, reduceMotion } = context.conditions as {
            isMobile: boolean
            reduceMotion: boolean
          }

          const wrapper = deviceWrapperRef.current
          const heroSection = heroSectionRef.current
          const screenSurface = screenSurfaceRef.current
          if (!wrapper || !heroSection || !screenSurface) return

          gsap.set(screenSurface, { autoAlpha: 0 })

          // ── Entrance sequence ──
          const entrance = gsap.timeline({ delay: reduceMotion ? 0 : 0.15 })

          if (reduceMotion) {
            entrance.set(['.hero-photo', '.landing-nav', '.landing-hero-utility'], { autoAlpha: 1, y: 0 })
          } else {
            entrance
              .fromTo('.hero-photo', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5, ease: 'power1.out' })
              .fromTo(
                '.landing-nav',
                { autoAlpha: 0, y: -12 },
                { autoAlpha: 1, y: 0, duration: 0.3, ease: 'power2.out' },
                '-=0.15'
              )
              .fromTo(
                '.landing-hero-utility',
                { autoAlpha: 0 },
                { autoAlpha: 1, duration: 0.3, ease: 'power2.out' },
                '-=0.15'
              )
          }

          // ── Reduced motion: no pin, no scale/zoom — a short opacity
          // handoff directly from the hero photo into the next section. ──
          if (reduceMotion) {
            gsap.to('.hero-photo', {
              autoAlpha: 0,
              ease: 'none',
              scrollTrigger: {
                trigger: heroSection,
                start: 'top top',
                end: '+=60%',
                scrub: true,
              },
            })
            return
          }

          // ── Scroll-dive ──
          // transform-origin stays at the box's own center (50% 50%) the
          // entire time — never moved to the target's off-center position —
          // and scale/x/y are all driven by the same linear scroll progress.
          // That combination makes every wrapper edge's position an affine
          // function of progress, so coverage only needs to be checked at
          // the two endpoints (t=0 is exact by construction). But centering
          // the target at t=1 isn't free: translating it to the viewport
          // center by an off-center amount can push the *opposite* edge back
          // inside the viewport unless the scale is large enough to cover
          // that translate. `safetyScaleX/Y` is the minimum scale for which
          // centering the target on that axis still keeps both edges
          // covered — folded into `scaleNeeded` so centering never gaps.
          gsap.set(wrapper, { scale: 1, x: 0, y: 0, transformOrigin: '50% 50%' })

          function calcGeometry() {
            const wrapperRect = wrapper!.getBoundingClientRect()
            const topLeft = mapPoint(wrapperRect.width, wrapperRect.height, LAPTOP_TARGET_BOX.left, LAPTOP_TARGET_BOX.top)
            const bottomRight = mapPoint(
              wrapperRect.width,
              wrapperRect.height,
              LAPTOP_TARGET_BOX.left + LAPTOP_TARGET_BOX.width,
              LAPTOP_TARGET_BOX.top + LAPTOP_TARGET_BOX.height
            )
            const targetWidthPx = bottomRight.x - topLeft.x
            const targetHeightPx = bottomRight.y - topLeft.y
            const targetCenterLocalX = topLeft.x + targetWidthPx / 2
            const targetCenterLocalY = topLeft.y + targetHeightPx / 2

            const vw = window.innerWidth
            const vh = window.innerHeight
            const centerLocalX = wrapperRect.width / 2
            const centerLocalY = wrapperRect.height / 2

            const fillScale = Math.max(vw / targetWidthPx, vh / targetHeightPx)
            const safetyScaleX = centerLocalX / Math.min(targetCenterLocalX, wrapperRect.width - targetCenterLocalX)
            const safetyScaleY = centerLocalY / Math.min(targetCenterLocalY, wrapperRect.height - targetCenterLocalY)
            const scaleNeeded = Math.max(fillScale, safetyScaleX, safetyScaleY) * 1.03

            const dx = scaleNeeded * (centerLocalX - targetCenterLocalX)
            const dy = scaleNeeded * (centerLocalY - targetCenterLocalY)

            return { scaleNeeded, dx, dy }
          }

          const diveTl = gsap.timeline({
            scrollTrigger: {
              id: 'dive',
              trigger: heroSection,
              start: 'top top',
              end: isMobile ? '+=70%' : '+=100%',
              pin: true,
              scrub: isMobile ? 0.5 : 1,
              invalidateOnRefresh: true,
            },
          })

          diveTl
            .to('.landing-nav, .landing-hero-utility', { autoAlpha: 0, duration: 0.25, ease: 'none' }, 0)
            .to(
              wrapper,
              {
                scale: () => calcGeometry().scaleNeeded,
                x: () => calcGeometry().dx,
                y: () => calcGeometry().dy,
                duration: 1,
                ease: 'none',
              },
              0
            )
            // Live DOM cream destination surface — crossfades in during the
            // final ~20% of the zoom, replacing the photographic laptop
            // screen before it visibly pixelates. It sits inside `wrapper`
            // at the exact laptop-screen bounding box, so it inherits the
            // same scale/x/y transform and lands perfectly aligned with no
            // pop or mismatch, then fully fills the viewport by t=1 —
            // matching the canvas-cream background of the section beneath.
            .to(screenSurface, { autoAlpha: 1, duration: 0.2, ease: 'none' }, 0.8)
        }
      )

      return () => mm.revert()
    },
    { scope: containerRef }
  )

  return (
    <div ref={containerRef} className="relative">
      <section
        ref={heroSectionRef}
        className="relative left-1/2 w-[100dvw] -translate-x-1/2 h-[100dvh] overflow-clip bg-[#e9e7e2]"
      >
        <div ref={deviceWrapperRef} className="hero-photo opacity-0 absolute inset-0 w-full h-full">
          <picture>
            {/* TODO: swap for a purpose-composed mobile crop once one exists —
                this source currently just duplicates the desktop image. */}
            <source media="(max-width: 767px)" srcSet="/hero-full.jpg" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/hero-full.jpg"
              alt="Laptop showing the Life AdminOS headline, next to a phone showing the app"
              className="absolute inset-0 w-full h-full object-cover"
              style={{ objectPosition: '50% 50%' }}
              fetchPriority="high"
            />
          </picture>

          {/* Live DOM cream destination surface — see diveTl above. */}
          <div
            ref={screenSurfaceRef}
            className="absolute flex flex-col justify-center px-[4%] bg-[var(--canvas)]"
            style={{
              left: `${LAPTOP_TARGET_BOX.left}%`,
              top: `${LAPTOP_TARGET_BOX.top}%`,
              width: `${LAPTOP_TARGET_BOX.width}%`,
              height: `${LAPTOP_TARGET_BOX.height}%`,
            }}
            aria-hidden="true"
          >
            <p className="font-landing-display font-bold text-[#0f0d0a] leading-[0.95] tracking-tight text-[clamp(20px,4.4vw,56px)]">
              Nothing
              <br />
              forgotten.
            </p>
            <p className="mt-3 text-[#5c5850] text-[clamp(9px,1vw,15px)] max-w-[80%]">
              One system that tracks subscriptions, bills, deadlines, and documents — so you don&apos;t have to.
            </p>
            <span className="mt-3 block h-[3px] w-[10%] min-w-[18px] bg-[var(--accent)]" />
          </div>
        </div>

        {/* Minimal nav — small wordmark top-left, "Sign in" top-right, both
            anchored to the shared 12-column grid instead of independent
            offsets. No CTA, no other links. */}
        <nav className="landing-nav absolute top-0 inset-x-0 z-20">
          <div className="landing-hero-grid h-16 items-center">
            <Link
              href="/"
              className="landing-nav-link [grid-column:1/4] justify-self-start font-landing-display font-semibold text-sm tracking-tight text-[#0a0a0a]"
            >
              Life AdminOS
            </Link>
            <Link
              href="/login"
              className="landing-nav-link [grid-column:10/13] justify-self-end text-sm text-[#0a0a0a]/70 hover:text-[#0a0a0a] transition-colors px-3 py-1.5"
            >
              Sign in
            </Link>
          </div>
        </nav>

        {/* Bottom-left utility strip — kicker line + slow scroll cue.
            Hidden below `md` (width) and below ~600px viewport height, so it
            never crowds the hero photo's bottom edge on short/narrow
            viewports; nav remains visible everywhere. */}
        <div className="landing-hero-utility opacity-0 hidden md:block absolute bottom-10 lg:bottom-12 inset-x-0 z-20 pointer-events-none">
          <div className="landing-hero-grid">
            <div className="[grid-column:1/4] flex flex-col items-start gap-3 pointer-events-auto">
              <span className="block text-[13px] uppercase tracking-[0.08em] text-[#0a0a0a]/60 font-medium">
                Your personal operations system
              </span>
              <div className="relative w-px h-9 bg-[#0a0a0a]/20 overflow-hidden" aria-hidden="true">
                <span className="landing-hero-scroll-dot absolute left-1/2 top-0 -translate-x-1/2 w-1 h-1 rounded-full bg-[#0a0a0a]/60" />
              </div>
              <span className="block text-[11px] uppercase tracking-[0.08em] text-[#0a0a0a]/60">
                Scroll
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
