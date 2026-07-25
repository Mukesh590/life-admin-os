'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Target, CircleDollarSign, Bell, AlertTriangle, Flame, FileText,
  TrendingUp, Inbox, Clock, ShieldCheck, Gauge, Sparkles,
} from 'lucide-react'

function useCountUp(target: number, active: boolean, duration = 1100) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    if (!active) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setValue(target)
      return
    }
    const start = performance.now()
    let raf: number
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1)
      setValue(Math.round((1 - Math.pow(1 - progress, 3)) * target))
      if (progress < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [active, target, duration])
  return value
}

function Card({
  className = '',
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      className={`rounded-2xl border border-[var(--line)] bg-[var(--canvas)] p-5 flex flex-col ${className}`}
      style={{ boxShadow: '0 1px 2px rgba(30,28,24,0.04)' }}
    >
      {children}
    </motion.div>
  )
}

function Label({ icon: Icon, text }: { icon: React.ElementType; text: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <Icon className="w-3.5 h-3.5 text-[var(--accent)]" />
      <p className="text-[11px] uppercase tracking-[0.06em] font-semibold text-[var(--ink)]/50">{text}</p>
    </div>
  )
}

export function WidgetMosaic({ active }: { active: boolean }) {
  const completion = useCountUp(78, active)
  const cost = useCountUp(214, active)
  const streak = useCountUp(12, active)

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 auto-rows-[minmax(0,1fr)]">
      {/* Completion score — ring */}
      <Card className="col-span-2 row-span-2 items-center justify-center text-center">
        <Label icon={Target} text="Completion score" />
        <div className="relative w-28 h-28 mx-auto">
          <svg viewBox="0 0 100 100" className="-rotate-90 w-full h-full">
            <circle cx="50" cy="50" r="42" fill="none" stroke="var(--canvas-alt)" strokeWidth="10" />
            <circle
              cx="50" cy="50" r="42" fill="none" stroke="var(--accent)" strokeWidth="10" strokeLinecap="round"
              strokeDasharray={`${(completion / 100) * 264} 264`}
              style={{ transition: 'stroke-dasharray 0.3s ease' }}
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center font-landing-display font-bold text-3xl text-[var(--ink)]">
            {completion}
          </span>
        </div>
        <p className="mt-3 text-[13px] text-[var(--ink)]/60">You&apos;re on top of it</p>
      </Card>

      {/* Monthly cost */}
      <Card className="col-span-2">
        <Label icon={CircleDollarSign} text="Monthly admin cost" />
        <p className="font-landing-display font-bold text-3xl text-[var(--ink)] tabular-nums">${cost}<span className="text-base font-medium text-[var(--ink)]/50">.50</span></p>
        <p className="text-[13px] text-[var(--ink)]/60 mt-1">Across 9 active subscriptions</p>
      </Card>

      {/* Upcoming renewal */}
      <Card>
        <Label icon={Bell} text="Upcoming renewal" />
        <p className="font-semibold text-[15px] text-[var(--ink)]">Adobe CC</p>
        <p className="text-[13px] text-[var(--ink)]/60">Renews in 3 days · $54.99</p>
      </Card>

      {/* Urgent deadline */}
      <Card>
        <Label icon={AlertTriangle} text="Urgent deadline" />
        <p className="font-semibold text-[15px] text-[var(--ink)]">Passport renewal</p>
        <p className="text-[13px]" style={{ color: '#c2410c' }}>Due tomorrow</p>
      </Card>

      {/* Weekly focus */}
      <Card className="col-span-2">
        <Label icon={Sparkles} text="Weekly focus" />
        <p className="text-[15px] font-medium text-[var(--ink)]">&ldquo;Cancel the two subscriptions I keep meaning to.&rdquo;</p>
      </Card>

      {/* Streak */}
      <Card className="items-center text-center">
        <Label icon={Flame} text="On-time streak" />
        <p className="font-landing-display font-bold text-3xl text-[var(--ink)] tabular-nums">{streak}</p>
        <p className="text-[12px] text-[var(--ink)]/60">payments in a row</p>
      </Card>

      {/* Document capture */}
      <Card>
        <Label icon={FileText} text="Document capture" />
        <p className="text-[13px] text-[var(--ink)]/70">Receipt scanned — vendor, amount, and date filed automatically.</p>
      </Card>

      {/* Six-month forecast */}
      <Card className="col-span-2">
        <Label icon={TrendingUp} text="Six-month forecast" />
        <svg viewBox="0 0 200 50" className="w-full h-10" aria-hidden="true">
          <polyline
            fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            points="0,38 33,30 66,34 100,20 133,26 166,12 200,16"
          />
        </svg>
        <p className="text-[12px] text-[var(--ink)]/60 mt-1">Trending up 6% next quarter</p>
      </Card>

      {/* Inbox zero */}
      <Card>
        <Label icon={Inbox} text="Inbox zero" />
        <p className="font-semibold text-[15px] text-[var(--ink)]">2 items</p>
        <p className="text-[12px] text-[var(--ink)]/60">left to sort</p>
      </Card>

      {/* Next appointment */}
      <Card>
        <Label icon={Clock} text="Next appointment" />
        <p className="font-semibold text-[15px] text-[var(--ink)]">Dentist</p>
        <p className="text-[12px] text-[var(--ink)]/60">Thu · 2:30 PM</p>
      </Card>

      {/* Warranty expiry */}
      <Card>
        <Label icon={ShieldCheck} text="Warranty expiry" />
        <p className="font-semibold text-[15px] text-[var(--ink)]">Headphones</p>
        <p className="text-[12px] text-[var(--ink)]/60">Covered until Nov 2026</p>
      </Card>

      {/* Budget progress */}
      <Card className="col-span-2">
        <Label icon={Gauge} text="Budget progress — subscriptions" />
        <div className="h-2 rounded-full bg-[var(--canvas-alt)] overflow-hidden">
          <div className="h-full rounded-full bg-[var(--accent)]" style={{ width: active ? '64%' : '0%', transition: 'width 1s ease' }} />
        </div>
        <p className="text-[12px] text-[var(--ink)]/60 mt-1.5">$128 of $200 monthly cap</p>
      </Card>
    </div>
  )
}
