'use client'

import { useEffect, useRef } from 'react'

type Stat = {
  value: number
  suffix: string
  label: string
}

const STATS: Stat[] = [
  { value: 6, suffix: '', label: 'Life areas' },
  { value: 3, suffix: '', label: 'Reminder checkpoints' },
  { value: 1, suffix: '', label: 'Unified workspace' },
  { value: 100, suffix: '%', label: 'Free to use' },
]

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3)
}

export function StatsBand() {
  const numberRefs = useRef<(HTMLSpanElement | null)[]>([])

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const els = numberRefs.current.filter((el): el is HTMLSpanElement => el !== null)

    if (reduceMotion) {
      els.forEach((el, i) => {
        el.textContent = String(STATS[i].value)
      })
      return
    }

    // One shared IntersectionObserver reused across every stat, per
    // LANDING-RESEARCH-FINAL Section 3 — not one observer per number.
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          const el = entry.target as HTMLSpanElement
          observer.unobserve(el)

          const target = Number(el.dataset.value)
          const duration = 1400
          const start = performance.now()

          const tick = (now: number) => {
            const progress = Math.min((now - start) / duration, 1)
            el.textContent = String(Math.round(easeOutCubic(progress) * target))
            if (progress < 1) requestAnimationFrame(tick)
          }
          requestAnimationFrame(tick)
        }
      },
      { threshold: 0.4 }
    )

    els.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <section className="bg-[var(--canvas)] px-6">
      <div className="mx-auto max-w-5xl py-20 md:py-28 grid grid-cols-2 md:grid-cols-4 gap-y-12 gap-x-6 text-center">
        {STATS.map((stat, i) => (
          <div key={stat.label} className="flex flex-col items-center gap-2">
            <p className="font-landing-display font-bold text-[clamp(2.5rem,6vw,4rem)] leading-none text-[var(--ink)]">
              <span
                ref={(el) => {
                  numberRefs.current[i] = el
                }}
                className="landing-stat-number"
                data-value={stat.value}
              >
                0
              </span>
              <span aria-hidden="true">{stat.suffix}</span>
              <span className="sr-only">{stat.suffix}</span>
            </p>
            <p className="text-[13px] uppercase tracking-[0.08em] text-[var(--ink)]/60 font-medium">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
