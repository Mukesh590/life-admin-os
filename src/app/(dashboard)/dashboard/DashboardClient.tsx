'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { motion, useMotionValue, useTransform, animate } from 'framer-motion'
import dynamic from 'next/dynamic'
import { staggerItem } from '@/lib/motion'
import {
  formatDate, getDaysUntil, getGreeting, getUrgencyColor,
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
  useEffect(() => {
    const c = animate(0, to, {
      duration: 1.4,
      ease: [0.16, 1, 0.3, 1],
      onUpdate(v) { if (ref.current) ref.current.textContent = fmtRef.current(v) },
    })
    return c.stop
  }, [to])
  return <span ref={ref}>{format(0)}</span>
}

// ── TiltCard — depth-gallery tilt + origami CSS-var spotlight ─────────────
function TiltCard({
  children,
  accentRgb,
  className = '',
  style = {},
  href,
}: {
  children: React.ReactNode
  accentRgb: string
  className?: string
  style?: React.CSSProperties
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
    // Origami technique: CSS variable tracks cursor position for spotlight
    e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`)
    e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`)
  }

  const handleLeave = () => {
    animate(mx, 0, { duration: 0.65, ease: [0.16, 1, 0.3, 1] })
    animate(my, 0, { duration: 0.65, ease: [0.16, 1, 0.3, 1] })
  }

  const inner = (
    <motion.div
      style={{ ...style, rotateX, rotateY, transformPerspective: 720, transformStyle: 'preserve-3d' }}
      className={`relative rounded-2xl overflow-hidden cursor-pointer group ${className}`}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      whileHover={{ boxShadow: `0 20px 56px rgba(${accentRgb},0.18), 0 6px 20px rgba(0,0,0,0.7)` }}
      transition={{ boxShadow: { duration: 0.2 } }}
    >
      {/* Origami radial spotlight — follows cursor via CSS var */}
      <div
        className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: `radial-gradient(320px circle at var(--mx, 50%) var(--my, 50%), rgba(${accentRgb},0.13), transparent 58%)`,
        }}
      />
      {/* Depth-gallery top accent glow line */}
      <div
        className="absolute top-0 left-4 right-4 h-px pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: `linear-gradient(90deg, transparent, rgba(${accentRgb},0.6), transparent)`,
        }}
      />
      {children}
    </motion.div>
  )

  return href ? <Link href={href} className="block">{inner}</Link> : inner
}

// ── WidgetCard ─────────────────────────────────────────────────────────────
function WidgetCard({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="rounded-2xl p-5 relative overflow-hidden h-full"
      style={{
        background: 'linear-gradient(145deg, rgba(14,14,22,0.96) 0%, rgba(9,9,16,0.94) 100%)',
        border: '1px solid rgba(255,255,255,0.055)',
      }}
    >
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
    <div className="flex items-center justify-between mb-3.5">
      <div className="flex items-center gap-2.5">
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
        className="text-[11px] text-[#3a3a55] hover:text-indigo-400 flex items-center gap-1 transition-colors group"
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
      transition={{ delay: 0.28 + index * 0.042, duration: 0.36, ease: [0.16, 1, 0.3, 1] }}
      className="group relative flex items-center px-3 py-2.5 rounded-xl hover:bg-white/[0.022] transition-colors"
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
      <p className="text-xs text-[#323248] font-medium">{text}</p>
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

  // depth-gallery: two parallax layers with different sensitivity
  const kpiRef = useRef<HTMLDivElement>(null)
  const widgetRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // depth-gallery: parallaxAmountX=0.16, parallaxSmoothing=0.08
    let tX = 0, tY = 0, cX = 0, cY = 0
    let raf: number

    const onMove = (e: MouseEvent) => {
      tX = (e.clientX / window.innerWidth - 0.5) * 18
      tY = (e.clientY / window.innerHeight - 0.5) * 10
    }

    const tick = () => {
      cX += (tX - cX) * 0.07   // depth-gallery smoothing factor
      cY += (tY - cY) * 0.07
      // KPI cards (near layer) — depth-gallery depthInfluence near
      if (kpiRef.current) {
        kpiRef.current.style.transform = `translate(${cX}px, ${cY * 0.7}px)`
      }
      // Widgets (far layer) — depth-gallery depthInfluence far
      if (widgetRef.current) {
        widgetRef.current.style.transform = `translate(${cX * 0.35}px, ${cY * 0.25}px)`
      }
      raf = requestAnimationFrame(tick)
    }

    window.addEventListener('mousemove', onMove, { passive: true })
    raf = requestAnimationFrame(tick)
    return () => { window.removeEventListener('mousemove', onMove); cancelAnimationFrame(raf) }
  }, [])

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
            className="text-[11px] font-mono text-[#333350] tracking-widest uppercase mb-2"
          >
            {todayLabel}
          </p>
          <h1
            className="text-[28px] font-bold text-[#e8e8f0] tracking-tight leading-tight"
            style={{ fontFamily: 'var(--font-display, Syne, sans-serif)' }}
          >
            {greeting}, {name}
          </h1>
          <p className="text-sm mt-1.5 font-medium" style={{ color: '#42425a' }}>
            {overdueDeadlines.length > 0 ? (
              <span style={{ color: '#fb7185' }}>
                {overdueDeadlines.length} overdue item{overdueDeadlines.length > 1 ? 's' : ''} need attention
              </span>
            ) : (
              'Everything looks on track today'
            )}
          </p>
        </div>

        {/* Right: glass orb + CTA */}
        <div className="flex items-center gap-3 shrink-0">
          {/* ball-of-glass: R3F orb with MeshTransmissionMaterial */}
          <div className="relative hidden md:block">
            <div className="orb-glow" />
            <GlassOrb className="w-[88px] h-[88px] -mt-5 -mr-1" />
          </div>

          <Link
            href="/documents"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white whitespace-nowrap transition-all hover:scale-[1.02] active:scale-[0.98]"
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

      {/* ── KPI Strip — depth-gallery near layer ─────────────────────── */}
      <div
        ref={kpiRef}
        className="grid grid-cols-2 md:grid-cols-4 gap-3"
        style={{ willChange: 'transform' }}
      >
        {kpis.map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 22, rotateX: 14 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{
              delay: i * 0.072,
              duration: 0.55,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            <TiltCard
              accentRgb={kpi.accentRgb}
              href={kpi.href}
              style={{
                background: 'linear-gradient(145deg, rgba(14,14,22,0.96) 0%, rgba(9,9,16,0.94) 100%)',
                border: '1px solid rgba(255,255,255,0.058)',
              }}
              className="p-4"
            >
              {/* Icon badge with ambient glow */}
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center mb-3.5 relative"
                style={{
                  background: `rgba(${kpi.accentRgb},0.1)`,
                  border: `1px solid rgba(${kpi.accentRgb},0.18)`,
                }}
              >
                {/* romantic-comfort: pulse glow behind icon */}
                <div
                  className="absolute inset-0 rounded-xl animate-pulse-glow"
                  style={{ background: `rgba(${kpi.accentRgb},0.1)` }}
                />
                <kpi.icon
                  className="w-4 h-4 relative z-10"
                  style={{ color: `rgb(${kpi.accentRgb})` }}
                />
              </div>

              {/* Value */}
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
                className="text-[11px] font-medium leading-snug mt-1.5"
                style={{ color: '#373752' }}
              >
                {kpi.label}
              </div>
            </TiltCard>
          </motion.div>
        ))}
      </div>

      {/* ── Widget Grid — depth-gallery far layer ────────────────────── */}
      <div
        ref={widgetRef}
        className="grid grid-cols-1 lg:grid-cols-2 gap-4"
        style={{ willChange: 'transform' }}
      >
        {/* Deadlines */}
        <motion.div variants={staggerItem(4)} initial="hidden" animate="show">
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
                            <p className="text-[11px] mt-0.5 font-mono" style={{ color: '#363652' }}>{formatDate(d.due_date)}</p>
                          </div>
                          <div className="flex items-center gap-1.5 ml-2 shrink-0">
                            <span className={`text-[11px] font-mono font-bold ${getUrgencyColor(days)}`}>
                              {days === 0 ? 'Today' : days < 0 ? `${Math.abs(days)}d late` : `${days}d`}
                            </span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${getPriorityBadge(d.priority)}`}>
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
        <motion.div variants={staggerItem(5)} initial="hidden" animate="show">
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
                            <p className="text-[11px] mt-0.5 font-mono" style={{ color: '#363652' }}>Renews {formatDate(s.next_renewal_date)}</p>
                          </div>
                          <span
                            className="text-[11px] font-mono font-bold ml-2 shrink-0"
                            style={{ color: days <= 7 ? '#fbbf24' : '#3a3a58' }}
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
        <motion.div variants={staggerItem(6)} initial="hidden" animate="show">
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
                            <p className="text-[11px] mt-0.5 font-mono" style={{ color: '#363652' }}>Due {formatDate(b.due_date)}</p>
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
        <motion.div variants={staggerItem(7)} initial="hidden" animate="show">
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
                          <p className="text-[11px] font-mono mt-0.5" style={{ color: '#363652' }}>
                            {doc.document_type}{doc.vendor_name ? ` · ${doc.vendor_name}` : ''}
                          </p>
                        </div>
                        {doc.ai_extracted && (
                          <span
                            className="text-[10px] px-1.5 py-0.5 rounded-full shrink-0 font-mono"
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
        <motion.div variants={staggerItem(8)} initial="hidden" animate="show">
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
                          className="rounded-xl px-2 py-1.5 text-center leading-tight shrink-0 min-w-[40px]"
                          style={{ background: 'rgba(155,124,247,0.08)', border: '1px solid rgba(155,124,247,0.15)' }}
                        >
                          <div className="text-[9px] text-[#363652] font-mono uppercase tracking-wide">
                            {new Date(a.date_time).toLocaleDateString('en', { month: 'short' })}
                          </div>
                          <div
                            className="text-sm font-bold leading-tight"
                            style={{ color: '#c4b5fd', fontFamily: 'var(--font-display, Syne, sans-serif)' }}
                          >
                            {new Date(a.date_time).getDate()}
                          </div>
                        </div>
                        <div className="min-w-0">
                          <p className="text-[13px] text-[#c4c4d8] font-medium leading-tight truncate">{a.title}</p>
                          <p className="text-[11px] font-mono mt-0.5" style={{ color: '#363652' }}>
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
        <motion.div variants={staggerItem(9)} initial="hidden" animate="show">
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
                            <p className="text-[11px] font-mono mt-0.5" style={{ color: '#363652' }}>Expires {formatDate(w.expiry_date)}</p>
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
  )
}
