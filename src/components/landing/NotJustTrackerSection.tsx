'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, Bell, Sparkles } from 'lucide-react'

const SHEET_ROWS = [
  { label: 'Netflix', value: '$15.49' },
  { label: 'Car insurance', value: '$144.50' },
  { label: 'Gym', value: '$39.00' },
  { label: '???', value: '' },
]

export function NotJustTrackerSection() {
  const ref = useRef<HTMLDivElement>(null)
  const [alive, setAlive] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setAlive(true)
            observer.disconnect()
          }
        }
      },
      { threshold: 0.5 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <section className="bg-[var(--canvas)] px-6 py-24 md:py-32">
      <div className="mx-auto max-w-4xl text-center mb-16">
        <h2 className="font-landing-display font-bold text-[clamp(1.9rem,4.5vw,3rem)] leading-tight tracking-tight text-[var(--ink)] mb-6">
          Anyone can make a spreadsheet.
          <br />
          You&apos;ve probably made three.
        </h2>
        <p className="text-[15px] md:text-lg leading-relaxed text-[var(--ink)]/70 max-w-2xl mx-auto">
          The difference is that spreadsheets are dead — they only know what you typed, and only when you remember to type it. Life AdminOS is alive: it computes your totals, projects your costs six months ahead, notices when something&apos;s overdue, notices when something&apos;s about to be, and nudges you before the damage — not after.
        </p>
        <p className="mt-6 text-[17px] md:text-xl font-semibold text-[var(--ink)]">
          A spreadsheet is a filing cabinet. This is a chief of staff.
        </p>
      </div>

      <div ref={ref} className="mx-auto max-w-3xl grid sm:grid-cols-2 gap-6 items-center">
        {/* Dead spreadsheet state */}
        <motion.div
          animate={{ opacity: alive ? 0.35 : 1, filter: alive ? 'grayscale(1)' : 'grayscale(0)' }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="rounded-2xl border border-[var(--line)] bg-[var(--canvas-alt)] p-5"
        >
          <p className="text-[11px] uppercase tracking-[0.08em] text-[var(--ink)]/50 font-medium mb-3">Spreadsheet.xlsx</p>
          <div className="space-y-1.5">
            {SHEET_ROWS.map((row, i) => (
              <div key={i} className="flex items-center justify-between text-sm py-1.5 border-b border-[var(--line)] last:border-0">
                <span className="text-[var(--ink)]/70">{row.label}</span>
                <span className="font-mono text-[var(--ink)]/50">{row.value || '—'}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Living system state */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={alive ? { opacity: 1, scale: 1 } : { opacity: 0.4, scale: 0.97 }}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-2xl p-5 text-white relative overflow-hidden"
          style={{ background: 'linear-gradient(155deg, #201812 0%, #120d0a 100%)' }}
        >
          <p className="text-[11px] uppercase tracking-[0.08em] text-white/50 font-medium mb-3">Life AdminOS</p>
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-full flex items-center justify-center shrink-0" style={{ background: 'rgba(232,120,58,0.2)' }}>
                <TrendingUp className="w-3.5 h-3.5" style={{ color: '#f3924f' }} />
              </span>
              <p className="text-[13px] font-medium">$198.99 / mo, projected +6% next quarter</p>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-full flex items-center justify-center shrink-0" style={{ background: 'rgba(232,120,58,0.2)' }}>
                <Bell className="w-3.5 h-3.5" style={{ color: '#f3924f' }} />
              </span>
              <p className="text-[13px] font-medium">Car insurance renews in 4 days</p>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-full flex items-center justify-center shrink-0" style={{ background: 'rgba(232,120,58,0.2)' }}>
                <Sparkles className="w-3.5 h-3.5" style={{ color: '#f3924f' }} />
              </span>
              <p className="text-[13px] font-medium">Gym unused 47 days — worth cancelling?</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
