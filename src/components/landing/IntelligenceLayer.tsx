'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

const CAPABILITIES = [
  { name: 'AI Document Reader', copy: 'Snap a photo of any receipt or bill. The AI extracts everything — vendor, amount, dates, category — and fills the form for you. Ten minutes of data entry becomes ten seconds of confirming.' },
  { name: 'AI Weekly Report', copy: 'Every week, a plain-language summary of your life admin: what’s due, what renewed, what you handled, and how this week compares to last. Your life, counted — without you counting it.' },
  { name: 'Quick Capture Inbox', copy: 'Type anything — “car insurance due march 3,” “return shoes by friday” — and drop it in the inbox. Sort it into the right place later. Capturing takes seconds, so nothing gets lost between remembering and recording.' },
  { name: 'Urgency Engine', copy: 'Everything in the system is color-coded by how much time you actually have. One glance at the dashboard tells you what’s fine, what’s soon, and what’s on fire.' },
  { name: 'Completion Score', copy: 'A single number that answers “how on top of my life am I right now?” Watch it climb as you handle things. Watch it warn you when things pile up.' },
  { name: 'Streaks & Momentum', copy: 'On-time payment streaks. Completion streaks. The system tracks your consistency and shows you the proof that you’re actually getting better at this.' },
  { name: 'Budget Limits', copy: 'Set a monthly cap per category. Watch the progress bar. Get flagged the moment a category hits its limit — before the month ends, not on the statement.' },
  { name: 'Entropy Alerts', copy: 'When things quietly pile up — three unpaid bills, two postponed deadlines — the system names it, gently, before it becomes a mess.' },
  { name: 'Postponement Tracking', copy: 'That deadline you’ve pushed three times? The system noticed. A small “pushed 3x” flag shows you what you keep avoiding — because seeing the pattern is how it stops.' },
  { name: 'Kanban View', copy: 'For visual thinkers: flip your deadlines into To Do / In Progress / Done columns and drag your week into shape.' },
  { name: 'Weekly Focus', copy: 'One line at the top of your dashboard: what this week is actually about. Set it Monday. Live by it.' },
  { name: 'Missing Document Flags', copy: 'A warranty with no receipt attached is a warranty you can’t use. The system flags every item missing its paperwork and nudges you to attach it while you still can.' },
]

export function IntelligenceLayer() {
  const [active, setActive] = useState(0)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const el = videoRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            if (!el.src) el.src = '/media/landing/capabilities-wave-loop.mp4'
            el.play().catch(() => {})
          } else {
            el.pause()
          }
        }
      },
      { threshold: 0.2 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <section className="relative px-6 py-24 md:py-32 overflow-hidden text-white">
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        poster="/media/landing/capabilities-wave-poster.png"
        muted
        loop
        playsInline
        preload="none"
        aria-hidden="true"
      />
      <div className="absolute inset-0" style={{ background: 'linear-gradient(155deg, rgba(20,16,12,0.88) 0%, rgba(10,8,6,0.94) 100%)' }} />

      <div className="relative mx-auto max-w-5xl">
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="font-landing-display font-bold text-[clamp(1.9rem,4.5vw,3rem)] leading-tight tracking-tight mb-12 md:mb-16"
        >
          What makes it an OS
        </motion.h2>

        <div className="grid md:grid-cols-[minmax(0,15rem)_1fr] gap-8 md:gap-12">
          <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-visible pb-2 md:pb-0" role="tablist" aria-label="Intelligence layer capabilities">
            {CAPABILITIES.map((cap, i) => (
              <button
                key={cap.name}
                role="tab"
                aria-selected={active === i}
                onClick={() => setActive(i)}
                className="shrink-0 md:shrink text-left px-4 py-2.5 rounded-full md:rounded-lg text-[13px] font-medium whitespace-nowrap md:whitespace-normal transition-colors"
                style={{
                  background: active === i ? 'rgba(232,120,58,0.18)' : 'transparent',
                  color: active === i ? '#f3924f' : 'rgba(255,255,255,0.55)',
                }}
              >
                {cap.name}
              </button>
            ))}
          </div>

          <motion.div
            key={active}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            role="tabpanel"
            className="min-h-[10rem]"
          >
            <h3 className="font-landing-display font-bold text-2xl md:text-3xl mb-4">{CAPABILITIES[active].name}</h3>
            <p className="text-[15px] md:text-lg leading-relaxed text-white/70 max-w-xl">{CAPABILITIES[active].copy}</p>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
