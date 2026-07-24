'use client'

import { useEffect, useRef, useState } from 'react'
import { CreditCard, Calendar, FileText, Bell, CheckCircle2 } from 'lucide-react'

// Static sample data only — this replica never calls Supabase or any API.
const TABS = ['This week', 'This month'] as const
type TabKey = (typeof TABS)[number]

const KPI_BY_TAB: Record<TabKey, { label: string; value: string; icon: typeof CreditCard }[]> = {
  'This week': [
    { label: 'Subscriptions', value: '12 active', icon: CreditCard },
    { label: 'Deadlines', value: '3 upcoming', icon: Calendar },
    { label: 'Documents', value: '24 stored', icon: FileText },
  ],
  'This month': [
    { label: 'Subscriptions', value: '$142.50', icon: CreditCard },
    { label: 'Deadlines', value: '9 upcoming', icon: Calendar },
    { label: 'Documents', value: '31 stored', icon: FileText },
  ],
}

const CHART_POINTS = [
  { month: 'Feb', subs: 118, bills: 64 },
  { month: 'Mar', subs: 124, bills: 70 },
  { month: 'Apr', subs: 131, bills: 58 },
  { month: 'May', subs: 128, bills: 82 },
  { month: 'Jun', subs: 142, bills: 66 },
  { month: 'Jul', subs: 137, bills: 74 },
]

const BILLS = [
  { name: 'Internet', due: 'Due in 2 days', amount: '$68.99', paid: false },
  { name: 'Car insurance', due: 'Due in 6 days', amount: '$144.50', paid: false },
  { name: 'Electricity', due: 'Paid · May 12', amount: '$72.11', paid: true },
]

type Callout = {
  n: number
  label: string
  x: number
  y: number
  anchorX: number
  anchorY: number
  side: 'left' | 'right'
}

// Percentage coordinates relative to the `.landing-map` outer wrapper —
// callout label position (x/y) and the replica point it connects to
// (anchorX/anchorY). Approximate/decorative, per LANDING-RESEARCH-FINAL
// Section 5's percentage-based coordinate system.
const CALLOUTS: Callout[] = [
  { n: 1, label: 'See what needs attention', x: 4, y: 10, anchorX: 27, anchorY: 22, side: 'left' },
  { n: 2, label: 'Track recurring costs', x: 4, y: 46, anchorX: 30, anchorY: 52, side: 'left' },
  { n: 3, label: 'Catch deadlines early', x: 96, y: 14, anchorX: 68, anchorY: 20, side: 'right' },
  { n: 4, label: 'Keep documents close', x: 96, y: 52, anchorX: 70, anchorY: 56, side: 'right' },
  { n: 5, label: 'Set one weekly focus', x: 50, y: 96, anchorX: 50, anchorY: 82, side: 'right' },
]

export function DashboardReplica() {
  const [tab, setTab] = useState<TabKey>('This week')
  const [showPaid, setShowPaid] = useState(true)
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null)
  const mapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = mapRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            observer.unobserve(entry.target)
          }
        }
      },
      { threshold: 0.3 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const visibleBills = showPaid ? BILLS : BILLS.filter((b) => !b.paid)
  const maxVal = Math.max(...CHART_POINTS.map((p) => Math.max(p.subs, p.bills)))

  return (
    <section className="bg-[var(--canvas)] px-6 py-24 md:py-32">
      <div className="mx-auto max-w-5xl text-center mb-14 md:mb-20">
        <h2 className="font-landing-display font-bold text-[clamp(1.75rem,4.5vw,3rem)] leading-tight tracking-tight text-[var(--ink)]">
          Everything important, already surfaced.
        </h2>
      </div>

      <div
        ref={mapRef}
        className="landing-map relative mx-auto max-w-6xl px-0 lg:px-[13rem]"
      >
        {/* Desktop connector lines — hidden below lg, where the stacked
            numbered list replaces them entirely. */}
        <svg
          className="landing-map__lines hidden lg:block absolute inset-0 w-full h-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          {CALLOUTS.map((c) => (
            <path
              key={c.n}
              pathLength="1"
              vectorEffect="non-scaling-stroke"
              d={`M ${c.x} ${c.y} L ${c.anchorX} ${c.anchorY}`}
            />
          ))}
        </svg>

        {/* Desktop callout labels */}
        {CALLOUTS.map((c) => (
          <div
            key={c.n}
            className="callout hidden lg:flex absolute items-center gap-2 max-w-[12rem]"
            style={{
              left: `${c.x}%`,
              top: `${c.y}%`,
              transform: `translate(${c.side === 'left' ? '-100%' : '0'}, -50%)`,
              flexDirection: c.side === 'left' ? 'row-reverse' : 'row',
            }}
          >
            <span className="shrink-0 w-5 h-5 rounded-full bg-[var(--accent)] text-white text-[11px] font-bold flex items-center justify-center">
              {c.n}
            </span>
            <p className="text-[13px] font-medium text-[var(--ink)]/80 leading-snug">{c.label}</p>
          </div>
        ))}

        {/* ── The replica itself — contained dark-glass dashboard ── */}
        <div
          className="relative rounded-[28px] overflow-hidden mx-auto max-w-[900px] p-4 sm:p-6"
          style={{
            backgroundImage: "linear-gradient(155deg, rgba(20,14,10,0.94) 0%, rgba(10,8,6,0.97) 100%), url('/dashboard-bg.jpg')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="relative z-10 space-y-4">
            {/* Header + tabs */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <p className="text-[11px] font-mono tracking-widest uppercase text-[#8a8aa3]">Overview</p>
                <h3 className="text-lg font-bold text-white" style={{ fontFamily: 'var(--font-display, Syne, sans-serif)' }}>
                  Good afternoon
                </h3>
              </div>
              <div className="flex rounded-full p-1 gap-1" style={{ border: '1px solid rgba(255,255,255,0.12)' }}>
                {TABS.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTab(t)}
                    className="px-3 py-1.5 rounded-full text-[11px] font-semibold transition-colors"
                    style={{
                      background: tab === t ? 'var(--warm-orange-bright, #f3924f)' : 'transparent',
                      color: tab === t ? '#17110c' : '#c4c4d8',
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* KPI strip */}
            <div className="grid grid-cols-3 rounded-3xl divide-x divide-white/[0.06] overflow-hidden" style={{ background: 'rgba(11,11,19,0.55)', border: '1px solid rgba(255,255,255,0.08)' }}>
              {KPI_BY_TAB[tab].map((kpi) => (
                <div key={kpi.label} className="flex flex-col items-center gap-1.5 px-2 py-4 text-center">
                  <kpi.icon className="w-3.5 h-3.5" style={{ color: '#f3924f' }} />
                  <p className="text-[13px] font-bold text-white tabular-nums">{kpi.value}</p>
                  <p className="text-[10px] font-medium text-[#8a8aa3]">{kpi.label}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[1.3fr_1fr] gap-4">
              {/* Cost forecast mini-chart with hoverable points */}
              <div className="rounded-3xl p-4" style={{ background: 'rgba(11,11,19,0.55)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <p className="text-[13px] font-bold text-white mb-3">Cost forecast</p>
                <svg viewBox="0 0 240 90" className="w-full h-20" role="img" aria-label="Six month subscriptions and bills forecast chart">
                  <polyline
                    fill="none"
                    stroke="rgba(255,255,255,0.35)"
                    strokeWidth="2"
                    points={CHART_POINTS.map((p, i) => `${i * 44 + 8},${86 - (p.bills / maxVal) * 76}`).join(' ')}
                  />
                  <polyline
                    fill="none"
                    stroke="#f3924f"
                    strokeWidth="2.5"
                    points={CHART_POINTS.map((p, i) => `${i * 44 + 8},${86 - (p.subs / maxVal) * 76}`).join(' ')}
                  />
                  {CHART_POINTS.map((p, i) => {
                    const cx = i * 44 + 8
                    const cy = 86 - (p.subs / maxVal) * 76
                    const active = hoveredPoint === i
                    return (
                      <g key={p.month}>
                        <circle
                          cx={cx}
                          cy={cy}
                          r={active ? 5 : 3}
                          fill="#f3924f"
                          stroke="#17110c"
                          strokeWidth={1.5}
                          style={{ cursor: 'pointer', transition: 'r 150ms ease' }}
                          onMouseEnter={() => setHoveredPoint(i)}
                          onMouseLeave={() => setHoveredPoint(null)}
                          onFocus={() => setHoveredPoint(i)}
                          onBlur={() => setHoveredPoint(null)}
                          tabIndex={0}
                          role="button"
                          aria-label={`${p.month}: $${p.subs} subscriptions`}
                        />
                        {active && (
                          <text x={cx} y={cy - 10} textAnchor="middle" fontSize="9" fill="#ffffff">
                            ${p.subs}
                          </text>
                        )}
                      </g>
                    )
                  })}
                </svg>
              </div>

              {/* Bills widget with paid/unpaid toggle */}
              <div className="rounded-3xl p-4" style={{ background: 'rgba(11,11,19,0.55)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[13px] font-bold text-white">Upcoming</p>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={showPaid}
                    onClick={() => setShowPaid((v) => !v)}
                    className="flex items-center gap-1.5 text-[10px] font-medium text-[#8a8aa3]"
                  >
                    <span
                      className="relative inline-flex h-4 w-7 rounded-full transition-colors"
                      style={{ background: showPaid ? '#f3924f' : 'rgba(255,255,255,0.14)' }}
                    >
                      <span
                        className="absolute top-0.5 h-3 w-3 rounded-full bg-white transition-transform"
                        style={{ transform: showPaid ? 'translateX(14px)' : 'translateX(2px)' }}
                      />
                    </span>
                    Show paid
                  </button>
                </div>
                <ul className="space-y-2.5">
                  {visibleBills.map((b) => (
                    <li key={b.name} className="flex items-center justify-between gap-2 text-[12px]">
                      <div className="flex items-center gap-2 min-w-0">
                        {b.paid ? (
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
                        ) : (
                          <Bell className="w-3.5 h-3.5 shrink-0" style={{ color: '#f3924f' }} />
                        )}
                        <div className="min-w-0">
                          <p className="font-medium text-white truncate">{b.name}</p>
                          <p className="text-[10px] text-[#8a8aa3]">{b.due}</p>
                        </div>
                      </div>
                      <span className="font-mono font-bold text-white shrink-0">{b.amount}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile: numbered markers + stacked explanations, replacing the
            SVG connectors below `lg`. */}
        <ol className="lg:hidden mt-8 space-y-4">
          {CALLOUTS.map((c) => (
            <li key={c.n} className="flex items-start gap-3">
              <span className="shrink-0 w-6 h-6 rounded-full bg-[var(--accent)] text-white text-[12px] font-bold flex items-center justify-center mt-0.5">
                {c.n}
              </span>
              <p className="text-[15px] font-medium text-[var(--ink)]/80 leading-snug pt-0.5">{c.label}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
