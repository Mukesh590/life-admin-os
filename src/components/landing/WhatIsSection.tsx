'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

export function WhatIsSection() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = videoRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setInView(true)
            if (!el.src) el.src = '/media/landing/system-core-loop.mp4'
            el.play().catch(() => {})
          } else {
            el.pause()
          }
        }
      },
      { threshold: 0.3 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <section className="bg-[var(--canvas-alt)] px-6 py-24 md:py-32 overflow-hidden">
      <div className="mx-auto max-w-5xl grid md:grid-cols-2 gap-12 md:gap-16 items-center">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="text-[12px] font-semibold uppercase tracking-[0.1em] text-[var(--accent)] mb-4">
            What is Life AdminOS?
          </p>
          <p className="text-[19px] md:text-2xl leading-snug text-[var(--ink)] font-semibold mb-6">
            Your personal operations system — one place where every subscription, bill, deadline, document, appointment, and warranty lives, tracked, organized, and watched.
          </p>
          <p className="text-[15px] md:text-lg leading-relaxed text-[var(--ink)]/70 mb-6">
            It&apos;s not another to-do list. To-do lists wait for you to remember. Life AdminOS remembers first — it counts your monthly costs automatically, flags what&apos;s due before it&apos;s due, reads your documents with AI, and tells you the one thing that needs your attention today.
          </p>
          <p className="text-[17px] md:text-xl leading-relaxed text-[var(--ink)] font-semibold">
            Built around one principle: you should never have to hold your life admin in your head.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="relative rounded-[28px] overflow-hidden aspect-square bg-[var(--canvas)] shadow-[0_30px_80px_-30px_rgba(30,28,24,0.35)]"
        >
          <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-cover"
            poster="/media/landing/system-core-poster.png"
            muted
            loop
            playsInline
            preload="none"
            aria-hidden="true"
          />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ boxShadow: 'inset 0 0 60px rgba(232,120,58,0.12)', opacity: inView ? 1 : 0, transition: 'opacity 0.6s ease' }}
          />
        </motion.div>
      </div>
    </section>
  )
}
