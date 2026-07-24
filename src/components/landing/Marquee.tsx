'use client'

import { forwardRef, useEffect, useRef } from 'react'

const ITEMS = [
  'SUBSCRIPTIONS',
  'BILLS',
  'DEADLINES',
  'DOCUMENTS',
  'APPOINTMENTS',
  'WARRANTIES',
  'NOTHING FORGOTTEN',
]

const SPEED_PX_PER_SEC = 55

const MarqueeSet = forwardRef<HTMLDivElement, { hidden?: boolean }>(function MarqueeSet({ hidden }, ref) {
  return (
    <div ref={ref} className="landing-marquee__set" aria-hidden={hidden || undefined}>
      {ITEMS.map((item, i) => (
        <span
          key={i}
          className="font-landing-display font-semibold text-[clamp(1.25rem,3vw,2.25rem)] tracking-tight text-[var(--ink)]/80 whitespace-nowrap"
        >
          {item}
        </span>
      ))}
    </div>
  )
})

export function Marquee() {
  const trackRef = useRef<HTMLDivElement>(null)
  const setRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const track = trackRef.current
    const firstSet = setRef.current
    if (!track || !firstSet) return

    function computeDuration() {
      const width = firstSet!.getBoundingClientRect().width
      const duration = width / SPEED_PX_PER_SEC
      track!.style.setProperty('--duration', `${duration}s`)
    }

    computeDuration()

    const resizeObserver = new ResizeObserver(() => computeDuration())
    resizeObserver.observe(firstSet)

    document.fonts?.ready.then(computeDuration)

    return () => resizeObserver.disconnect()
  }, [])

  return (
    <section className="bg-[var(--canvas)] py-10 md:py-14 border-y border-[var(--line)]">
      <div
        className="landing-marquee"
        tabIndex={0}
        aria-label="Life AdminOS tracks: subscriptions, bills, deadlines, documents, appointments, warranties — nothing forgotten"
      >
        <div ref={trackRef} className="landing-marquee__track" style={{ ['--gap' as string]: '3rem' }}>
          <MarqueeSet ref={setRef} />
          <MarqueeSet hidden />
        </div>
      </div>
    </section>
  )
}
