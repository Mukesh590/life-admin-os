'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { WidgetMosaic } from './WidgetMosaic'

export function WidgetMosaicSection() {
  const ref = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActive(true)
            observer.disconnect()
          }
        }
      },
      { threshold: 0.3 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <section className="bg-[var(--canvas-alt)] px-6 py-24 md:py-32">
      <div className="mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-xl mb-12 md:mb-16"
        >
          <h2 className="font-landing-display font-bold text-[clamp(1.9rem,4.5vw,3rem)] leading-tight tracking-tight text-[var(--ink)] mb-4">
            Everything, at a glance.
          </h2>
          <p className="text-[15px] md:text-lg leading-relaxed text-[var(--ink)]/70">
            This is a real slice of what the dashboard actually tracks — not a mockup.
          </p>
        </motion.div>

        <div ref={ref}>
          <WidgetMosaic active={active} />
        </div>
      </div>
    </section>
  )
}
