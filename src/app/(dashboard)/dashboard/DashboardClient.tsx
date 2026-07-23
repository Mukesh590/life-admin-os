'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { motion, MotionConfig, useReducedMotion, animate } from 'framer-motion'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis } from 'recharts'
import { staggerItem } from '@/lib/motion'
import { formatDate, getDaysUntil, getGreeting, monthlyCost } from '@/lib/utils'
import type { Subscription, Deadline, Document, Bill, Appointment, Warranty } from '@/types'
import type { User } from '@supabase/supabase-js'
import {
  CreditCard, Calendar, FileText, Receipt, Bell, MoreVertical,
  CheckCircle2, ArrowRight, Plus,
} from 'lucide-react'
import {
  isBefore, isAfter, addDays, addMonths, startOfMonth, format as formatFn,
  differenceInCalendarMonths, isSameMonth, isSameYear,
} from 'date-fns'

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
      duration: 1.2,
      ease: [0.16, 1, 0.3, 1],
      onUpdate(v) { if (ref.current) ref.current.textContent = fmtRef.current(v) },
    })
    return c.stop
  }, [to, shouldReduceMotion])
  return <span ref={ref}>{format(0)}</span>
}

// ── DataRow ─────────────────────────────────────────────────────────────
function DataRow({ index, children }: { index: number; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8, clipPath: 'inset(0 100% 0 0)' }}
      animate={{ opacity: 1, x: 0, clipPath: 'inset(0 0% 0 0)' }}
      transition={{ delay: 0.2 + index * 0.042, duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
      className="group relative flex items-center px-3 py-3 rounded-xl hover:bg-white/[0.03] transition-colors"
    >
      {children}
    </motion.div>
  )
}

// ── EmptyNote ──────────────────────────────────────────────────────────────
function EmptyNote({ icon: Icon, text }: { icon: React.ElementType; text: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-6 text-center gap-2">
      <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: 'rgba(226,121,61,0.08)' }}>
        <Icon className="w-4 h-4" style={{ color: 'rgba(243,146,79,0.4)' }} />
      </div>
      <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{text}</p>
    </div>
  )
}

// ── Peak-month dot + floating tooltip pill for the forecast chart ─────────
function makePeakDot(peakIndex: number, peakLabel: string, peakValue: number) {
  return function PeakDot(props: { cx?: number; cy?: number; index?: number }) {
    const { cx, cy, index } = props
    if (index !== peakIndex || cx == null || cy == null) {
      return <circle cx={cx} cy={cy} r={0} fill="none" />
    }
    return (
      <g>
        <circle cx={cx} cy={cy} r={4} fill="var(--warm-orange-bright)" stroke="#0e0a08" strokeWidth={2} />
        <g transform={`translate(${cx - 46}, ${cy - 42})`}>
          <rect width={92} height={32} rx={9} fill="rgba(12,9,7,0.94)" stroke="rgba(255,255,255,0.12)" />
          <text x={46} y={13} textAnchor="middle" fontSize={9} fill="#8a8aa3">{peakLabel}</text>
          <text x={46} y={25} textAnchor="middle" fontSize={12} fontWeight={700} fill="#ffffff">
            ${peakValue.toFixed(0)}
          </text>
        </g>
      </g>
    )
  }
}

// ── Types ──────────────────────────────────────────────────────────────────
type Props = {
  user: User
  profile: { full_name?: string; avatar_url?: string | null } | null
  subscriptions: Subscription[]
  deadlines: Deadline[]
  documents: Document[]
  bills: Bill[]
  appointments: Appointment[]
  warranties: Warranty[]
}

const LEGEND_COLORS = ['#2dd4bf', '#34d399', '#fb7185']

function capitalize(s: string) {
  return s.length ? s.charAt(0).toUpperCase() + s.slice(1) : s
}

// ── DashboardClient ────────────────────────────────────────────────────────
export function DashboardClient({
  user, profile, subscriptions, deadlines, documents, bills, warranties,
}: Props) {
  const name = profile?.full_name?.split(' ')[0] || user.email?.split('@')[0] || 'there'
  const greeting = getGreeting()
  const now = new Date()
  const nextWeek = addDays(now, 7)

  // ── Derived data ─────────────────────────────────────────────────────────
  const monthlySubCost = subscriptions.reduce((s, sub) => s + monthlyCost(sub.amount, sub.billing_cycle), 0)
  const deadlinesThisWeek = deadlines.filter(d => {
    const dd = new Date(d.due_date)
    return isAfter(dd, now) && isBefore(dd, nextWeek)
  }).length
  const overdueDeadlines = deadlines.filter(d => isBefore(new Date(d.due_date), now))
  const upcomingDeadlines = deadlines.filter(d => isAfter(new Date(d.due_date), now))
  const unpaidBills = bills.filter(b => !b.paid)

  const kpis = [
    {
      label: 'Monthly subscriptions',
      value: monthlySubCost,
      format: (n: number) => `$${n.toFixed(2)}`,
      icon: CreditCard,
    },
    {
      label: 'Deadlines this week',
      value: deadlinesThisWeek,
      format: (n: number) => `${Math.round(n)}`,
      icon: Calendar,
    },
    {
      label: 'Documents tracked',
      value: documents.length,
      format: (n: number) => `${Math.round(n)}`,
      icon: FileText,
    },
  ]

  // ── 6-month cost forecast: subscriptions vs bills ──────────────────────
  const monthStarts = Array.from({ length: 6 }, (_, i) => startOfMonth(addMonths(now, i)))
  const forecast = monthStarts.map(monthStart => {
    const subsTotal = subscriptions
      .filter(s => s.status === 'active')
      .reduce((sum, s) => {
        const cycle = s.billing_cycle
        if (cycle === 'monthly' || cycle === 'weekly') return sum + monthlyCost(s.amount, cycle)
        const stepMonths = cycle === 'quarterly' ? 3 : 12
        const diff = differenceInCalendarMonths(monthStart, new Date(s.next_renewal_date))
        const lands = ((diff % stepMonths) + stepMonths) % stepMonths === 0
        return sum + (lands ? s.amount : 0)
      }, 0)

    const billsTotal = bills.reduce((sum, b) => {
      if (b.recurring) return sum + b.amount
      const bd = new Date(b.due_date)
      return sum + (isSameMonth(bd, monthStart) && isSameYear(bd, monthStart) ? b.amount : 0)
    }, 0)

    return {
      month: formatFn(monthStart, 'MMM'),
      subscriptions: Math.round(subsTotal),
      bills: Math.round(billsTotal),
    }
  })

  const categoryTotals = new Map<string, number>()
  subscriptions.filter(s => s.status === 'active').forEach(s => {
    categoryTotals.set(s.category, (categoryTotals.get(s.category) || 0) + monthlyCost(s.amount, s.billing_cycle))
  })
  bills.forEach(b => {
    categoryTotals.set(b.category, (categoryTotals.get(b.category) || 0) + b.amount)
  })
  const topCategories = Array.from(categoryTotals.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([cat]) => cat)

  const peakIndex = forecast.reduce(
    (best, cur, i, arr) => (cur.subscriptions + cur.bills) > (arr[best].subscriptions + arr[best].bills) ? i : best,
    0
  )
  const peakTotal = forecast[peakIndex].subscriptions + forecast[peakIndex].bills
  const peakLabel = topCategories.length > 0 ? capitalize(topCategories[0]) : 'Total'
  const PeakDot = makePeakDot(peakIndex, peakLabel, peakTotal)

  // ── Featured urgent item (replaces the reference's Visa card slot) ─────
  type UrgentItem = {
    badge: string; title: string; icon: React.ElementType
    leftLabel: string; leftValue: string; rightLabel: string; rightValue: string
  }
  const urgentCandidates: { days: number; item: UrgentItem }[] = [
    ...overdueDeadlines.map(d => ({
      days: getDaysUntil(d.due_date),
      item: {
        badge: 'Overdue deadline', title: d.title, icon: Calendar,
        leftLabel: 'Priority', leftValue: capitalize(d.priority),
        rightLabel: 'Was due', rightValue: formatDate(d.due_date),
      },
    })),
    ...unpaidBills.map(b => ({
      days: getDaysUntil(b.due_date),
      item: {
        badge: 'Unpaid bill', title: b.name, icon: Receipt,
        leftLabel: 'Amount', leftValue: `$${b.amount.toFixed(2)}`,
        rightLabel: 'Due', rightValue: formatDate(b.due_date),
      },
    })),
    ...upcomingDeadlines.slice(0, 3).map(d => ({
      days: getDaysUntil(d.due_date),
      item: {
        badge: 'Upcoming deadline', title: d.title, icon: Calendar,
        leftLabel: 'Priority', leftValue: capitalize(d.priority),
        rightLabel: 'Due', rightValue: formatDate(d.due_date),
      },
    })),
  ]
  urgentCandidates.sort((a, b) => a.days - b.days)
  const urgentItem = urgentCandidates[0]?.item ?? null

  const quickActions = [
    { label: 'Sub', icon: CreditCard, href: '/subscriptions' },
    { label: 'Deadline', icon: Calendar, href: '/deadlines' },
    { label: 'Upload', icon: FileText, href: '/documents' },
    { label: 'Bill', icon: Receipt, href: '/bills' },
  ]

  // ── Coverage (warranties) ───────────────────────────────────────────────
  const coverageWarranties = [...warranties]
    .sort((a, b) => getDaysUntil(a.expiry_date) - getDaysUntil(b.expiry_date))
    .slice(0, 2)
  function coverageRemainingPct(w: Warranty) {
    const start = new Date(w.purchase_date).getTime()
    const end = new Date(w.expiry_date).getTime()
    const total = end - start
    if (total <= 0) return 0
    return Math.max(0, Math.min(100, Math.round(((end - Date.now()) / total) * 100)))
  }

  // ── Bills overview mini stat ─────────────────────────────────────────────
  const totalUnpaid = unpaidBills.reduce((s, b) => s + b.amount, 0)
  const paidCount = bills.filter(b => b.paid).length
  const paidPercent = bills.length ? Math.round((paidCount / bills.length) * 100) : 0
  const next3Months = [0, 1, 2].map(i => startOfMonth(addMonths(now, i)))
  const billsByMonth = next3Months.map(m => {
    const oneOff = bills
      .filter(b => !b.recurring && isSameMonth(new Date(b.due_date), m) && isSameYear(new Date(b.due_date), m))
      .reduce((s, b) => s + b.amount, 0)
    const recurring = bills.filter(b => b.recurring).reduce((s, b) => s + b.amount, 0)
    return { label: formatFn(m, 'MMM'), amount: oneOff + recurring }
  })
  const maxMonthAmount = Math.max(...billsByMonth.map(m => m.amount), 1)

  // ── Recent documents ─────────────────────────────────────────────────────
  const latestDoc = documents[0]

  const todayLabel = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  return (
    <MotionConfig reducedMotion="user">
      <div className="relative rounded-[32px] p-4 sm:p-6 dashboard-warm-bg overflow-hidden">
        <div className="relative z-10 space-y-4">

          {/* ── Header ───────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="text-[11px] font-mono tracking-widest uppercase mb-2" style={{ color: 'var(--text-muted)' }}>
              {todayLabel}
            </p>
            <h1
              className="text-[26px] sm:text-[28px] font-bold text-white tracking-tight leading-tight"
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
          </motion.div>

          {/* ── Main 2-column band: left stack / right profile card ──── */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4 items-stretch">
            {/* Left: KPI pill + forecast chart */}
            <div className="flex flex-col gap-4 min-w-0">
              {/* KPI pill */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="glass rounded-3xl flex divide-x divide-white/[0.06] overflow-hidden"
              >
                {kpis.map((kpi) => (
                  <div key={kpi.label} className="flex-1 flex items-center gap-3 px-4 sm:px-5 py-4 min-w-0">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                      style={{ border: '1px solid rgba(255,255,255,0.14)' }}
                    >
                      <kpi.icon className="w-4 h-4" style={{ color: 'var(--warm-orange-bright)' }} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-medium truncate" style={{ color: 'var(--text-muted)' }}>
                        {kpi.label}
                      </p>
                      <p
                        className="text-[15px] font-bold text-white tabular-nums truncate"
                        style={{ fontFamily: 'var(--font-mono, JetBrains Mono, monospace)' }}
                      >
                        <AnimCountUp to={kpi.value} format={kpi.format} />
                      </p>
                    </div>
                  </div>
                ))}
              </motion.div>

              {/* Forecast chart card */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="glass rounded-3xl p-5 flex-1 flex flex-col min-h-[280px]"
              >
                <div className="flex items-start justify-between gap-3 mb-1">
                  <h2 className="text-base font-bold text-white" style={{ fontFamily: 'var(--font-display, Syne, sans-serif)' }}>
                    Cost forecast
                  </h2>
                  <span className="text-[11px] px-3 py-1.5 rounded-full shrink-0 whitespace-nowrap" style={{ border: '1px solid rgba(255,255,255,0.12)', color: 'var(--text-muted)' }}>
                    Next 6 months
                  </span>
                </div>

                <div className="flex items-start justify-between gap-4 flex-wrap mb-3">
                  <div>
                    <p className="text-[13px] font-semibold text-[#c4c4d8]">Top spending categories</p>
                    <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                      Subscriptions &amp; bills, projected forward
                    </p>
                  </div>
                  {topCategories.length > 0 && (
                    <div className="flex flex-col gap-1.5 items-end shrink-0">
                      {topCategories.map((cat, i) => (
                        <div key={cat} className="flex items-center gap-1.5 text-[11px]" style={{ color: 'var(--text-muted)' }}>
                          <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: LEGEND_COLORS[i] }} />
                          {capitalize(cat)}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex-1 min-h-[160px] -mx-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={forecast} margin={{ top: 46, right: 12, bottom: 0, left: 12 }}>
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#5a5a72', fontSize: 11 }} />
                      <YAxis hide domain={[0, (max: number) => Math.max(max * 1.6, 10)]} />
                      <Line type="monotone" dataKey="bills" stroke="rgba(255,255,255,0.45)" strokeWidth={2} dot={false} isAnimationActive={false} />
                      <Line type="monotone" dataKey="subscriptions" stroke="var(--warm-orange-bright)" strokeWidth={2.5} dot={PeakDot} isAnimationActive={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            </div>

            {/* Right: profile card */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="glass rounded-3xl p-5 h-full flex flex-col relative overflow-hidden dot-texture"
            >
              <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-center justify-between mb-5">
                  <div className="relative w-8 h-8 rounded-full flex items-center justify-center" style={{ border: '1px solid rgba(255,255,255,0.12)' }}>
                    <Bell className="w-3.5 h-3.5 text-[#c4c4d8]" />
                    {overdueDeadlines.length > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full" style={{ background: 'var(--warm-orange-bright)' }} />
                    )}
                  </div>
                  <Link href="/settings" aria-label="Settings" className="w-8 h-8 rounded-full flex items-center justify-center text-[#5a5a72] hover:text-[#c4c4d8] transition-colors" style={{ border: '1px solid rgba(255,255,255,0.12)' }}>
                    <MoreVertical className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="flex flex-col items-center text-center mb-5">
                  <div className="relative mb-3">
                    <div
                      className="w-14 h-14 rounded-full overflow-hidden flex items-center justify-center text-lg font-bold text-white"
                      style={{ background: 'linear-gradient(135deg, var(--warm-orange), var(--warm-orange-deep))' }}
                    >
                      {profile?.avatar_url
                        ? <img src={profile.avatar_url} alt={name} className="w-full h-full object-cover" />
                        : name.charAt(0).toUpperCase()}
                    </div>
                    <span
                      className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-[9px] font-medium whitespace-nowrap"
                      style={{ background: '#17110c', border: '1px solid rgba(255,255,255,0.1)', color: '#c4c4d8' }}
                    >
                      Member
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-white mt-1" style={{ fontFamily: 'var(--font-display, Syne, sans-serif)' }}>
                    {profile?.full_name || name}
                  </p>
                </div>

                <div className="grid grid-cols-4 gap-2 mb-5">
                  {quickActions.map(a => (
                    <Link key={a.label} href={a.href} className="flex flex-col items-center gap-1.5 group">
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center transition-colors"
                        style={{ border: '1px solid rgba(255,255,255,0.14)' }}
                      >
                        <a.icon className="w-3.5 h-3.5 text-[#c4c4d8] group-hover:text-white transition-colors" />
                      </div>
                      <span className="text-[9px] font-medium" style={{ color: 'var(--text-muted)' }}>{a.label}</span>
                    </Link>
                  ))}
                </div>

                {/* Featured urgent item — the reference's opaque Visa-card slot */}
                <div className="mt-auto rounded-2xl p-4 relative overflow-hidden surface-opaque-warm dot-texture">
                  {urgentItem ? (
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-6">
                        <span className="text-[10px] font-bold tracking-wide text-white/85 uppercase">{urgentItem.badge}</span>
                        <urgentItem.icon className="w-4 h-4 text-white/60" />
                      </div>
                      <p className="text-[13px] font-semibold text-white truncate mb-4">{urgentItem.title}</p>
                      <div className="flex items-end justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-[9px] text-white/40 uppercase tracking-wide mb-1">{urgentItem.leftLabel}</p>
                          <p className="text-sm font-bold text-white font-mono truncate">{urgentItem.leftValue}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-[9px] text-white/40 uppercase tracking-wide mb-1">{urgentItem.rightLabel}</p>
                          <p className="text-xs font-semibold text-white/80 font-mono">{urgentItem.rightValue}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="relative z-10 flex items-center gap-2 py-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <p className="text-[12px] font-medium text-white/80">Nothing urgent — you&apos;re all caught up</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>

          {/* ── Bottom row: Coverage / Bills overview / Recent docs ─────── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            {/* Coverage (warranties) */}
            <motion.div variants={staggerItem(0, 0.045)} initial="hidden" animate="show" className="glass rounded-3xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[15px] font-bold text-white" style={{ fontFamily: 'var(--font-display, Syne, sans-serif)' }}>Coverage</h3>
                <Link href="/warranties" className="text-[11px] flex items-center gap-1 px-2.5 py-1 rounded-full" style={{ border: '1px solid rgba(255,255,255,0.12)', color: 'var(--text-muted)' }}>
                  <Plus className="w-3 h-3" /> Add
                </Link>
              </div>
              {coverageWarranties.length === 0 ? (
                <EmptyNote icon={CheckCircle2} text="No warranties tracked" />
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {coverageWarranties.map(w => {
                    const pct = coverageRemainingPct(w)
                    return (
                      <div key={w.id} className="min-w-0">
                        <p className="text-2xl font-bold text-white tabular-nums leading-none mb-2.5">{pct}%</p>
                        <div className="h-1.5 rounded-full overflow-hidden mb-2" style={{ background: 'rgba(255,255,255,0.08)' }}>
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${pct}%`, background: 'linear-gradient(90deg, var(--warm-orange), var(--warm-orange-bright))' }}
                          />
                        </div>
                        <p className="text-[11px] font-medium truncate" style={{ color: 'var(--text-muted)' }}>{w.product_name}</p>
                      </div>
                    )
                  })}
                </div>
              )}
            </motion.div>

            {/* Bills overview */}
            <motion.div variants={staggerItem(1, 0.045)} initial="hidden" animate="show" className="glass rounded-3xl p-5">
              <h3 className="text-[15px] font-bold text-white mb-4" style={{ fontFamily: 'var(--font-display, Syne, sans-serif)' }}>Bills overview</h3>
              <div className="flex items-end justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-[11px] font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>Unpaid total</p>
                  <p className="text-2xl font-bold text-white tabular-nums mb-2" style={{ fontFamily: 'var(--font-mono, JetBrains Mono, monospace)' }}>
                    ${totalUnpaid.toFixed(2)}
                  </p>
                  <span className="text-[10px] px-2 py-1 rounded-full font-mono font-bold" style={{ background: 'rgba(52,211,153,0.12)', color: '#34d399', border: '1px solid rgba(52,211,153,0.2)' }}>
                    {paidPercent}% paid
                  </span>
                </div>
                <div className="flex items-end gap-2 h-16 shrink-0">
                  {billsByMonth.map(m => {
                    const h = Math.max(6, Math.round((m.amount / maxMonthAmount) * 56))
                    return (
                      <div key={m.label} className="flex flex-col items-center gap-1.5 w-6">
                        <div
                          className="w-full rounded-md"
                          style={{ height: h, background: 'linear-gradient(to top, var(--warm-orange), var(--warm-orange-bright))' }}
                        />
                        <span className="text-[9px] font-mono" style={{ color: 'var(--text-muted)' }}>{m.label}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </motion.div>

            {/* Recent documents */}
            <motion.div variants={staggerItem(2, 0.045)} initial="hidden" animate="show" className="glass rounded-3xl p-5 flex flex-col">
              <h3 className="text-[15px] font-bold text-white mb-2" style={{ fontFamily: 'var(--font-display, Syne, sans-serif)' }}>Recent documents</h3>
              {latestDoc ? (
                <DataRow index={0}>
                  <div className="flex items-center gap-3 w-full min-w-0">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                      style={{ border: '1px solid rgba(255,255,255,0.14)' }}
                    >
                      <FileText className="w-3.5 h-3.5" style={{ color: 'var(--warm-orange-bright)' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] text-white font-medium truncate leading-tight">{latestDoc.file_name}</p>
                      <p className="text-[11px] font-mono mt-1 truncate" style={{ color: 'var(--text-muted)' }}>
                        {latestDoc.document_type}{latestDoc.vendor_name ? ` · ${latestDoc.vendor_name}` : ''}
                      </p>
                    </div>
                    <span className="text-[10px] font-mono shrink-0" style={{ color: 'var(--text-muted)' }}>
                      {formatDate(latestDoc.created_at)}
                    </span>
                  </div>
                </DataRow>
              ) : (
                <EmptyNote icon={FileText} text="No documents yet" />
              )}
              <Link
                href="/documents"
                className="mt-auto pt-4 flex items-center justify-center gap-2 text-[12px] font-semibold text-white rounded-full py-2.5 transition-colors hover:bg-white/[0.04]"
                style={{ border: '1px solid rgba(255,255,255,0.12)' }}
              >
                See all documents
                <ArrowRight className="w-3 h-3" />
              </Link>
            </motion.div>
          </div>

        </div>
      </div>
    </MotionConfig>
  )
}
