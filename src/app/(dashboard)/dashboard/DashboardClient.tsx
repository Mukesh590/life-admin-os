'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { motion, MotionConfig, useMotionValue, useTransform, useReducedMotion, animate } from 'framer-motion'
import dynamic from 'next/dynamic'
import { staggerItem } from '@/lib/motion'
import {
  cn, formatDate, getDaysUntil, getGreeting, getUrgencyColor,
  getPriorityBadge, monthlyCost, isExpiringSoon,
} from '@/lib/utils'
import type { Subscription, Deadline, Document, Bill, Appointment, Warranty } from '@/types'
import type { User } from '@supabase/supabase-js'
import {
  CreditCard, Calendar, FileText, Receipt, Clock, Package,
  AlertTriangle, Plus, ArrowRight, CheckCircle2,
} from 'lucide-react'
import { addDays, isBefore, isAfter } from 'date-fns'

// R3F glass orb — dynamic to avoid SSR
const GlassOrb = dynamic(
  () => import('@/components/animations/GlassOrb').then(m => m.GlassOrb),
  { ssr: false, loading: () => null }
)

// ── AnimCountUp ────────────────────────────────────────────────────────────
function AnimCountUp({
  to,
  format = (n: number) => String(Math.round(n)),
}: {
  to: number
  format?: (n: number) => string
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const fmtRef = useRef(format)
  fmtRef.current = format
  const shouldReduceMotion = useReducedMotion()

  useEffect(() => {
    if (shouldReduceMotion) {
      if (ref.current) ref.current.textContent = fmtRef.current(to)
      return
    }
    const c = animate(0, to, {
      duration: 1.4,
      ease: [0.16, 1, 0.3, 1],
      onUpdate(v) { if (ref.current) ref.current.textContent = fmtRef.current(v) },
    })
    return c.stop
  }, [to, shouldReduceMotion])
  return <span ref={ref}>{format(0)}</span>
}

// ── TiltCard — quiet glass surface, cursor-driven 3D tilt only ────────────
function TiltCard({
  children,
  className = '',
  href,
}: {
  children: React.ReactNode
  className?: string
  href?: string
}) {
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const rotateX = useTransform(my, [-0.5, 0.5], [7, -7])
  const rotateY = useTransform(mx, [-0.5, 0.5], [-7, 7])

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    mx.set((e.clientX - r.left) / r.width - 0.5)
    my.set((e.clientY - r.top) / r.height - 0.5)
  }

  const handleLeave = () => {
    animate(mx, 0, { duration: 0.3, ease: [0.16, 1, 0.3, 1] })
    animate(my, 0, { duration: 0.3, ease: [0.16, 1, 0.3, 1] })
  }

  const inner = (
    <motion.div
      style={{ rotateX, rotateY, transformPerspective: 720, transformStyle: 'preserve-3d' }}
      className={cn('glass rounded-2xl overflow-hidden cursor-pointer', className)}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  )

  return href ? <Link href={href} className="block">{inner}</Link> : inner
}

// ── WidgetCard ─────────────────────────────────────────────────────────────
function WidgetCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="glass rounded-2xl p-5 relative overflow-hidden h-full">
      {children}
    </div>
  )
}

// ── WidgetHeader ───────────────────────────────────────────────────────────
function WidgetHeader({
  icon: Icon,
  accentRgb,
  title,
  href,
}: {
  icon: React.ElementType
  accentRgb: string
  title: string
  href: string
}) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{
            background: `rgba(${accentRgb},0.1)`,
            border: `1px solid rgba(${accentRgb},0.2)`,
            boxShadow: `0 0 10px rgba(${accentRgb},0.12)`,
          }}
        >
          <Icon className="w-3.5 h-3.5" style={{ color: `rgb(${accentRgb})` }} />
        </div>
        <h2
          className="text-[13px] font-semibold text-[#c4c4d8] tracking-tight"
          style={{ fontFamily: 'var(--font-display, Syne, sans-serif)' }}
        >
          {title}
        </h2>
      </div>
      <Link
        href={href}
        className="text-[11px] flex items-center gap-1 transition-colors group"
        style={{ color: 'var(--text-muted)' }}
      >
        All
        <ArrowRight className="w-2.5 h-2.5 group-hover:translate-x-0.5 transition-transform" />
      </Link>
    </div>
  )
}

// ── DataRow — scroll-transition clip-path reveal + motion-path left bar ───
function DataRow({ index, children }: { index: number; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8, clipPath: 'inset(0 100% 0 0)' }}
      animate={{ opacity: 1, x: 0, clipPath: 'inset(0 0% 0 0)' }}
      transition={{ delay: 0.2 + index * 0.042, duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
      className="group relative flex items-center px-3 py-3 rounded-xl hover:bg-white/[0.022] transition-colors"
    >
      {/* Motion-path left-rail indicator — reveals on row hover */}
      <div
        className="absolute left-0 top-2.5 bottom-2.5 w-[2px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        style={{ background: 'linear-gradient(to bottom, rgba(91,94,244,0.7), rgba(155,124,247,0.3))' }}
      />
      {children}
    </motion.div>
  )
}

// ── EmptyWidget ────────────────────────────────────────────────────────────
function EmptyWidget({
  icon: Icon, text, accentRgb = '91,94,244',
}: {
  icon: React.ElementType; text: string; accentRgb?: string
}) {
  return (
    <div className="flex flex-col items-center justify-center py-7 text-center gap-2">
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center"
        style={{ background: `rgba(${accentRgb},0.06)` }}
      >
        <Icon className="w-4 h-4" style={{ color: `rgba(${accentRgb},0.35)` }} />
      </div>
      <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{text}</p>
    </div>
  )
}

// ── Types ──────────────────────────────────────────────────────────────────
type Props = {
  user: User
  profile: { full_name?: string } | null
  subscriptions: Subscription[]
  deadlines: Deadline[]
  documents: Document[]
  bills: Bill[]
  appointments: Appointment[]
  warranties: Warranty[]
}

// ── DashboardClient ────────────────────────────────────────────────────────
export function DashboardClient({
  user, profile, subscriptions, deadlines, documents, bills, appointments, warranties,
}: Props) {
  const name = profile?.full_name?.split(' ')[0] || user.email?.split('@')[0] || 'there'
  const greeting = getGreeting()
  const now = new Date()
  const nextWeek = addDays(now, 7)

  // ── Derived data ─────────────────────────────────────────────────────────
  const monthlySubCost = subscriptions.reduce((s, sub) => s + monthlyCost(sub.amount, sub.billing_cycle), 0)
  const expiringThisWeek = [
    ...subscriptions.filter(s => isExpiringSoon(s.next_renewal_date, 7)),
    ...warranties.filter(w => isExpiringSoon(w.expiry_date, 7)),
  ].length
  const deadlinesThisWeek = deadlines.filter(d => {
    const dd = new Date(d.due_date)
    return isAfter(dd, now) && isBefore(dd, nextWeek)
  }).length
  const overdueDeadlines = deadlines.filter(d => isBefore(new Date(d.due_date), now))
  const upcomingDeadlines = deadlines.filter(d => isAfter(new Date(d.due_date), now)).slice(0, 5)
  const upcomingAppointments = appointments.filter(a => isAfter(new Date(a.date_time), now)).slice(0, 3)
  const recentDocs = documents.slice(0, 4)
  const unpaidBills = bills.filter(b => !b.paid).slice(0, 4)
  const expiringWarranties = warranties.filter(w => isExpiringSoon(w.expiry_date, 60)).slice(0, 4)

  // Barometer signature — the glass orb's tint reads this score directly.
  const urgencyScore = Math.min(1, overdueDeadlines.length * 0.35 + expiringThisWeek * 0.15)

  const kpis = [
    {
      label: 'Monthly spend',
      value: monthlySubCost,
      format: (n: number) => `$${n.toFixed(2)}`,
      icon: CreditCard,
      accentRgb: '99,102,241',
      valueColor: '#818cf8',
      href: '/subscriptions',
    },
    {
      label: 'Expiring this week',
      value: expiringThisWeek,
      format: (n: number) => `${Math.round(n)} items`,
      icon: AlertTriangle,
      accentRgb: expiringThisWeek > 0 ? '251,191,36' : '52,211,153',
      valueColor: expiringThisWeek > 0 ? '#fbbf24' : '#34d399',
      href: '/subscriptions',
    },
    {
      label: 'Deadlines due',
      value: deadlinesThisWeek,
      format: (n: number) => `${Math.round(n)} tasks`,
      icon: Calendar,
      accentRgb: deadlinesThisWeek > 0 ? '251,113,133' : '52,211,153',
      valueColor: deadlinesThisWeek > 0 ? '#fb7185' : '#34d399',
      href: '/deadlines',
    },
    {
      label: 'Documents',
      value: documents.length,
      format: (n: number) => `${Math.round(n)}`,
      icon: FileText,
      accentRgb: '34,211,238',
      valueColor: '#22d3ee',
      href: '/documents',
    },
  ]

  const todayLabel = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  })

  return (
    <MotionConfig reducedMotion="user">
      <div className="space-y-6 relative">

        {/* ── Header ───────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="relative flex items-start justify-between gap-4"
        >
          {/* Left: greeting */}
          <div className="relative z-10 min-w-0">
            <p
              className="text-[11px] font-mono tracking-widest uppercase mb-2"
              style={{ color: 'var(--text-muted)' }}
            >
              {todayLabel}
            </p>
            <h1
              className="text-[28px] font-bold text-[#e8e8f0] tracking-tight leading-tight"
              style={{ fontFamily: 'var(--font-display, Syne, sans-serif)' }}
            >
              {greeting}, {name}
            </h1>
            <p className="text-sm mt-2 font-medium" style={{ color: 'var(--text-muted)' }}>
              {overdueDeadlines.length > 0 ? (
                <span style={{ color: '#fb7185' }}>
                  {overdueDeadlines.length} overdue item{overdueDeadlines.length > 1 ? 's' : ''} need attention
                </span>
              ) : (
                'Everything looks on track today'
              )}
            </p>
          </div>

          {/* Right: barometer orb + CTA */}
          <div className="flex items-center gap-3 shrink-0">
            {/* ball-of-glass: R3F orb, tint reads urgencyScore — the signature element */}
            <div className="relative hidden md:block">
              <div className="orb-glow" />
              <GlassOrb className="w-[88px] h-[88px] -mt-5 -mr-1" urgency={urgencyScore} />
            </div>

            <Link
              href="/documents"
              className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-white whitespace-nowrap transition-transform hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: 'linear-gradient(135deg, #5b5ef4 0%, #7c3aed 100%)',
                boxShadow: '0 4px 20px rgba(91,94,244,0.35)',
                fontFamily: 'var(--font-display, Syne, sans-serif)',
              }}
            >
              <Plus className="w-3.5 h-3.5" />
              Add
            </Link>
          </div>
        </motion.div>

        {/* ── KPI Strip ────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {kpis.map((kpi, i) => (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, y: 22, rotateX: 14 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{
                delay: i * 0.045,
                duration: 0.4,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <TiltCard href={kpi.href} className="p-4">
                {/* Icon badge with ambient glow — the only color a card carries */}
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center mb-4 relative"
                  style={{
                    background: `rgba(${kpi.accentRgb},0.1)`,
                    border: `1px solid rgba(${kpi.accentRgb},0.18)`,
                  }}
                >
                  <div
                    className="absolute inset-0 rounded-xl animate-pulse-glow"
                    style={{ background: `rgba(${kpi.accentRgb},0.1)` }}
                  />
                  <kpi.icon
                    className="w-4 h-4 relative z-10"
                    style={{ color: `rgb(${kpi.accentRgb})` }}
                  />
                </div>

                {/* Value — ledger voice: always monospace */}
                <div
                  className="text-[22px] font-bold tabular-nums leading-none mb-1"
                  style={{
                    color: kpi.valueColor,
                    fontFamily: 'var(--font-mono, JetBrains Mono, monospace)',
                  }}
                >
                  <AnimCountUp to={kpi.value} format={kpi.format} />
                </div>

                {/* Label */}
                <div
                  className="text-[11px] font-medium leading-snug mt-2"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {kpi.label}
                </div>
              </TiltCard>
            </motion.div>
          ))}
        </div>

        {/* ── Widget Grid ──────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Deadlines */}
          <motion.div variants={staggerItem(0, 0.045)} initial="hidden" animate="show">
            <WidgetCard>
              <WidgetHeader icon={Calendar} accentRgb="251,113,133" title="Upcoming deadlines" href="/deadlines" />
              {upcomingDeadlines.length === 0
                ? <EmptyWidget icon={CheckCircle2} text="No upcoming deadlines" accentRgb="52,211,153" />
                : <div className="space-y-0">
                    {upcomingDeadlines.map((d, i) => {
                      const days = getDaysUntil(d.due_date)
                      return (
                        <DataRow key={d.id} index={i}>
                          <Link href="/deadlines" className="flex items-center w-full gap-3 min-w-0">
                            <div className="flex-1 min-w-0">
                              <p className="text-[13px] text-[#c4c4d8] font-medium truncate leading-tight">{d.title}</p>
                              <p className="text-[11px] mt-1 font-mono" style={{ color: 'var(--text-muted)' }}>{formatDate(d.due_date)}</p>
                            </div>
                            <div className="flex items-center gap-2 ml-2 shrink-0">
                              <span className={`text-[11px] font-mono font-bold ${getUrgencyColor(days)}`}>
                                {days === 0 ? 'Today' : days < 0 ? `${Math.abs(days)}d late` : `${days}d`}
                              </span>
                              <span className={`text-[10px] px-2 py-1 rounded-full border ${getPriorityBadge(d.priority)}`}>
                                {d.priority}
                              </span>
                            </div>
                          </Link>
                        </DataRow>
                      )
                    })}
                  </div>
              }
            </WidgetCard>
          </motion.div>

          {/* Subscriptions */}
          <motion.div variants={staggerItem(1, 0.045)} initial="hidden" animate="show">
            <WidgetCard>
              <WidgetHeader icon={CreditCard} accentRgb="99,102,241" title="Active subscriptions" href="/subscriptions" />
              {subscriptions.length === 0
                ? <EmptyWidget icon={CreditCard} text="No subscriptions tracked" accentRgb="99,102,241" />
                : <div className="space-y-0">
                    {subscriptions.slice(0, 5).map((s, i) => {
                      const days = getDaysUntil(s.next_renewal_date)
                      return (
                        <DataRow key={s.id} index={i}>
                          <div className="flex items-center w-full gap-3 min-w-0">
                            <div className="flex-1 min-w-0">
                              <p className="text-[13px] text-[#c4c4d8] font-medium truncate leading-tight">{s.name}</p>
                              <p className="text-[11px] mt-1 font-mono" style={{ color: 'var(--text-muted)' }}>Renews {formatDate(s.next_renewal_date)}</p>
                            </div>
                            <span
                              className="text-[11px] font-mono font-bold ml-2 shrink-0"
                              style={{ color: days <= 7 ? '#fbbf24' : 'var(--text-muted)' }}
                            >
                              ${monthlyCost(s.amount, s.billing_cycle).toFixed(2)}/mo
                            </span>
                          </div>
                        </DataRow>
                      )
                    })}
                  </div>
              }
            </WidgetCard>
          </motion.div>

          {/* Bills */}
          <motion.div variants={staggerItem(2, 0.045)} initial="hidden" animate="show">
            <WidgetCard>
              <WidgetHeader icon={Receipt} accentRgb="251,191,36" title="Unpaid bills" href="/bills" />
              {unpaidBills.length === 0
                ? <EmptyWidget icon={CheckCircle2} text="All bills are paid" accentRgb="52,211,153" />
                : <div className="space-y-0">
                    {unpaidBills.map((b, i) => {
                      const days = getDaysUntil(b.due_date)
                      return (
                        <DataRow key={b.id} index={i}>
                          <div className="flex items-center w-full gap-3 min-w-0">
                            <div className="flex-1 min-w-0">
                              <p className="text-[13px] text-[#c4c4d8] font-medium truncate leading-tight">{b.name}</p>
                              <p className="text-[11px] mt-1 font-mono" style={{ color: 'var(--text-muted)' }}>Due {formatDate(b.due_date)}</p>
                            </div>
                            <span className={`text-sm font-mono font-bold ml-2 shrink-0 ${getUrgencyColor(days)}`}>
                              ${b.amount.toFixed(2)}
                            </span>
                          </div>
                        </DataRow>
                      )
                    })}
                  </div>
              }
            </WidgetCard>
          </motion.div>

          {/* Documents */}
          <motion.div variants={staggerItem(3, 0.045)} initial="hidden" animate="show">
            <WidgetCard>
              <WidgetHeader icon={FileText} accentRgb="34,211,238" title="Recent documents" href="/documents" />
              {recentDocs.length === 0
                ? <EmptyWidget icon={FileText} text="No documents yet" accentRgb="34,211,238" />
                : <div className="space-y-0">
                    {recentDocs.map((doc, i) => (
                      <DataRow key={doc.id} index={i}>
                        <div className="flex items-center gap-3 w-full min-w-0">
                          <div
                            className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                            style={{ background: 'rgba(34,211,238,0.08)', border: '1px solid rgba(34,211,238,0.15)' }}
                          >
                            <FileText className="w-3.5 h-3.5 text-cyan-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[13px] text-[#c4c4d8] font-medium truncate leading-tight">{doc.file_name}</p>
                            <p className="text-[11px] font-mono mt-1" style={{ color: 'var(--text-muted)' }}>
                              {doc.document_type}{doc.vendor_name ? ` · ${doc.vendor_name}` : ''}
                            </p>
                          </div>
                          {doc.ai_extracted && (
                            <span
                              className="text-[10px] px-2 py-1 rounded-full shrink-0 font-mono"
                              style={{ background: 'rgba(99,102,241,0.1)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.2)' }}
                            >
                              AI
                            </span>
                          )}
                        </div>
                      </DataRow>
                    ))}
                  </div>
              }
            </WidgetCard>
          </motion.div>
        </div>

        {/* ── Bottom Row ───────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* Appointments */}
          <motion.div variants={staggerItem(4, 0.045)} initial="hidden" animate="show">
            <WidgetCard>
              <WidgetHeader icon={Clock} accentRgb="155,124,247" title="Upcoming appointments" href="/appointments" />
              {upcomingAppointments.length === 0
                ? <EmptyWidget icon={Clock} text="No upcoming appointments" accentRgb="155,124,247" />
                : <div className="space-y-0">
                    {upcomingAppointments.map((a, i) => (
                      <DataRow key={a.id} index={i}>
                        <div className="flex items-center gap-3 w-full">
                          {/* Calendar badge — three-html-canvas html-overlay style */}
                          <div
                            className="rounded-xl px-2 py-2 text-center leading-tight shrink-0 min-w-[40px]"
                            style={{ background: 'rgba(155,124,247,0.08)', border: '1px solid rgba(155,124,247,0.15)' }}
                          >
                            <div className="text-[9px] font-mono uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                              {new Date(a.date_time).toLocaleDateString('en', { month: 'short' })}
                            </div>
                            <div
                              className="text-sm font-bold leading-tight"
                              style={{ color: '#c4b5fd', fontFamily: 'var(--font-mono, JetBrains Mono, monospace)' }}
                            >
                              {new Date(a.date_time).getDate()}
                            </div>
                          </div>
                          <div className="min-w-0">
                            <p className="text-[13px] text-[#c4c4d8] font-medium leading-tight truncate">{a.title}</p>
                            <p className="text-[11px] font-mono mt-1" style={{ color: 'var(--text-muted)' }}>
                              {new Date(a.date_time).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}
                              {a.location ? ` · ${a.location}` : ''}
                            </p>
                          </div>
                        </div>
                      </DataRow>
                    ))}
                  </div>
              }
            </WidgetCard>
          </motion.div>

          {/* Warranties */}
          <motion.div variants={staggerItem(5, 0.045)} initial="hidden" animate="show">
            <WidgetCard>
              <WidgetHeader icon={Package} accentRgb="52,211,153" title="Warranties expiring" href="/warranties" />
              {expiringWarranties.length === 0
                ? <EmptyWidget icon={CheckCircle2} text="No warranties expiring soon" accentRgb="52,211,153" />
                : <div className="space-y-0">
                    {expiringWarranties.map((w, i) => {
                      const days = getDaysUntil(w.expiry_date)
                      return (
                        <DataRow key={w.id} index={i}>
                          <div className="flex items-center w-full gap-3 min-w-0">
                            <div className="flex-1 min-w-0">
                              <p className="text-[13px] text-[#c4c4d8] font-medium truncate leading-tight">{w.product_name}</p>
                              <p className="text-[11px] font-mono mt-1" style={{ color: 'var(--text-muted)' }}>Expires {formatDate(w.expiry_date)}</p>
                            </div>
                            <span className={`text-[11px] font-mono font-bold shrink-0 tabular-nums ${getUrgencyColor(days)}`}>
                              {days}d
                            </span>
                          </div>
                        </DataRow>
                      )
                    })}
                  </div>
              }
            </WidgetCard>
          </motion.div>
        </div>

      </div>
    </MotionConfig>
  )
}
