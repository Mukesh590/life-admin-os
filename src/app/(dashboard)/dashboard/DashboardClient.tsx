'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { formatCurrency, formatDate, getDaysUntil, getGreeting, getUrgencyColor, getUrgencyBg, getPriorityBadge, monthlyCost, isExpiringSoon } from '@/lib/utils'
import type { Subscription, Deadline, Document, Bill, Appointment, Warranty } from '@/types'
import type { User } from '@supabase/supabase-js'
import {
  CreditCard, Calendar, FileText, Receipt, Clock, Package,
  AlertTriangle, Plus, ArrowRight, CheckCircle2
} from 'lucide-react'
import { addDays, isBefore, isAfter } from 'date-fns'

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

export function DashboardClient({ user, profile, subscriptions, deadlines, documents, bills, appointments, warranties }: Props) {
  const dashboardRef = useRef<HTMLDivElement>(null)
  const name = profile?.full_name || user.email?.split('@')[0] || 'there'
  const greeting = getGreeting()
  const now = new Date()
  const nextWeek = addDays(now, 7)

  // KPI calculations
  const monthlySubCost = subscriptions.reduce((sum, s) => sum + monthlyCost(s.amount, s.billing_cycle), 0)
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
  const upcomingAppointments = appointments
    .filter(a => isAfter(new Date(a.date_time), now))
    .slice(0, 3)
  const recentDocs = documents.slice(0, 4)

  useGSAP(() => {
    gsap.fromTo('.kpi-card',
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.08, duration: 0.5, ease: 'power2.out' }
    )
    gsap.fromTo('.dashboard-widget',
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.1, duration: 0.6, ease: 'power2.out', delay: 0.3 }
    )
    gsap.fromTo('.dashboard-header',
      { y: -10, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.4, ease: 'power2.out' }
    )
  }, { scope: dashboardRef })

  const kpis = [
    {
      label: 'Monthly subscriptions',
      value: formatCurrency(monthlySubCost),
      icon: CreditCard,
      color: 'text-indigo-400',
      glow: 'rgba(99,102,241,0.1)',
      border: 'rgba(99,102,241,0.2)',
      href: '/subscriptions',
    },
    {
      label: 'Expiring this week',
      value: `${expiringThisWeek} items`,
      icon: AlertTriangle,
      color: expiringThisWeek > 0 ? 'text-amber-400' : 'text-emerald-400',
      glow: expiringThisWeek > 0 ? 'rgba(245,158,11,0.1)' : 'rgba(16,185,129,0.1)',
      border: expiringThisWeek > 0 ? 'rgba(245,158,11,0.2)' : 'rgba(16,185,129,0.2)',
      href: '/subscriptions',
    },
    {
      label: 'Deadlines this week',
      value: `${deadlinesThisWeek} tasks`,
      icon: Calendar,
      color: deadlinesThisWeek > 0 ? 'text-rose-400' : 'text-emerald-400',
      glow: deadlinesThisWeek > 0 ? 'rgba(244,63,94,0.1)' : 'rgba(16,185,129,0.1)',
      border: deadlinesThisWeek > 0 ? 'rgba(244,63,94,0.2)' : 'rgba(16,185,129,0.2)',
      href: '/deadlines',
    },
    {
      label: 'Documents tracked',
      value: `${documents.length}`,
      icon: FileText,
      color: 'text-cyan-400',
      glow: 'rgba(6,182,212,0.1)',
      border: 'rgba(6,182,212,0.2)',
      href: '/documents',
    },
  ]

  return (
    <div ref={dashboardRef} className="space-y-5">
      {/* Header */}
      <div className="dashboard-header flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#fafafa] tracking-tight">
            {greeting}, {name.split(' ')[0]}
          </h1>
          <p className="text-zinc-500 text-sm mt-1">
            {overdueDeadlines.length > 0
              ? `${overdueDeadlines.length} overdue item${overdueDeadlines.length > 1 ? 's' : ''} needing attention`
              : "Here's what needs your attention today"}
          </p>
        </div>
        <Link
          href="/documents"
          className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all hover:-translate-y-0.5 shadow-lg shadow-indigo-500/20"
        >
          <Plus className="w-4 h-4" />
          Add item
        </Link>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {kpis.map((kpi) => (
          <Link
            key={kpi.label}
            href={kpi.href}
            className="kpi-card rounded-xl p-4 transition-all duration-300 group"
            style={{
              background: '#111115',
              border: `1px solid rgba(255,255,255,0.06)`,
            }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLElement
              el.style.background = '#18181c'
              el.style.border = `1px solid ${kpi.border}`
              el.style.boxShadow = `inset 0 0 24px ${kpi.glow}`
              el.style.transform = 'translateY(-1px)'
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLElement
              el.style.background = '#111115'
              el.style.border = '1px solid rgba(255,255,255,0.06)'
              el.style.boxShadow = 'none'
              el.style.transform = ''
            }}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center mb-3"
              style={{ background: kpi.glow, border: `1px solid ${kpi.border}` }}
            >
              <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
            </div>
            <div className={`text-xl font-bold font-mono ${kpi.color}`}>{kpi.value}</div>
            <div className="text-xs text-zinc-600 mt-1 leading-tight">{kpi.label}</div>
          </Link>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Upcoming deadlines */}
        <div
          className="dashboard-widget rounded-xl p-5"
          style={{ background: '#111115', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-rose-400" />
              <h2 className="text-sm font-semibold text-zinc-200">Upcoming deadlines</h2>
            </div>
            <Link href="/deadlines" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {upcomingDeadlines.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle2 className="w-8 h-8 text-emerald-400/30 mx-auto mb-2" />
              <p className="text-sm text-zinc-600">No upcoming deadlines</p>
              <Link href="/deadlines" className="text-xs text-indigo-400 hover:text-indigo-300 mt-2 inline-block transition-colors">Add one</Link>
            </div>
          ) : (
            <div className="space-y-2">
              {upcomingDeadlines.map((d) => {
                const days = getDaysUntil(d.due_date)
                return (
                  <Link
                    key={d.id}
                    href="/deadlines"
                    className={`flex items-center justify-between p-3 rounded-lg border transition-all hover:bg-white/[0.03] ${getUrgencyBg(days)}`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-zinc-200 font-medium truncate">{d.title}</p>
                      <p className="text-xs text-zinc-600 mt-0.5">{formatDate(d.due_date)}</p>
                    </div>
                    <div className="flex items-center gap-2 ml-3">
                      <span className={`text-xs font-mono font-medium ${getUrgencyColor(days)}`}>
                        {days === 0 ? 'Today' : days < 0 ? `${Math.abs(days)}d overdue` : `${days}d`}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${getPriorityBadge(d.priority)}`}>
                        {d.priority}
                      </span>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>

        {/* Active subscriptions */}
        <div
          className="dashboard-widget rounded-xl p-5"
          style={{ background: '#111115', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-indigo-400" />
              <h2 className="text-sm font-semibold text-zinc-200">Active subscriptions</h2>
            </div>
            <Link href="/subscriptions" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {subscriptions.length === 0 ? (
            <div className="text-center py-8">
              <CreditCard className="w-8 h-8 text-indigo-400/20 mx-auto mb-2" />
              <p className="text-sm text-zinc-600">No subscriptions tracked</p>
              <Link href="/subscriptions" className="text-xs text-indigo-400 hover:text-indigo-300 mt-2 inline-block transition-colors">Add one</Link>
            </div>
          ) : (
            <div className="space-y-2">
              {subscriptions.slice(0, 5).map((s) => {
                const days = getDaysUntil(s.next_renewal_date)
                return (
                  <div
                    key={s.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-white/[0.05] hover:bg-white/[0.03] transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-zinc-200 font-medium truncate">{s.name}</p>
                      <p className="text-xs text-zinc-600 mt-0.5">Renews {formatDate(s.next_renewal_date)}</p>
                    </div>
                    <div className="flex items-center gap-2 ml-3">
                      <span className={`text-xs font-mono font-medium ${days <= 7 ? 'text-amber-400' : 'text-zinc-500'}`}>
                        {formatCurrency(s.amount)}/{s.billing_cycle === 'annual' ? 'yr' : 'mo'}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Unpaid bills */}
        <div
          className="dashboard-widget rounded-xl p-5"
          style={{ background: '#111115', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Receipt className="w-4 h-4 text-amber-400" />
              <h2 className="text-sm font-semibold text-zinc-200">Unpaid bills</h2>
            </div>
            <Link href="/bills" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {bills.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle2 className="w-8 h-8 text-emerald-400/30 mx-auto mb-2" />
              <p className="text-sm text-zinc-600">All bills paid</p>
            </div>
          ) : (
            <div className="space-y-2">
              {bills.slice(0, 4).map((b) => {
                const days = getDaysUntil(b.due_date)
                return (
                  <div
                    key={b.id}
                    className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${getUrgencyBg(days)}`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-zinc-200 font-medium truncate">{b.name}</p>
                      <p className="text-xs text-zinc-600 mt-0.5">Due {formatDate(b.due_date)}</p>
                    </div>
                    <span className={`text-sm font-mono font-bold ml-3 ${getUrgencyColor(days)}`}>
                      {formatCurrency(b.amount)}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Recent documents */}
        <div
          className="dashboard-widget rounded-xl p-5"
          style={{ background: '#111115', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm font-semibold text-zinc-200">Recent documents</h2>
            </div>
            <Link href="/documents" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {recentDocs.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-8 h-8 text-cyan-400/20 mx-auto mb-2" />
              <p className="text-sm text-zinc-600">No documents yet</p>
              <Link href="/documents" className="text-xs text-indigo-400 hover:text-indigo-300 mt-2 inline-block transition-colors">Upload one</Link>
            </div>
          ) : (
            <div className="space-y-2">
              {recentDocs.map((doc) => (
                <div key={doc.id} className="flex items-center gap-3 p-3 rounded-lg border border-white/[0.05] hover:bg-white/[0.03] transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-zinc-200 font-medium truncate">{doc.file_name}</p>
                    <p className="text-xs text-zinc-600">{doc.document_type}{doc.vendor_name ? ` · ${doc.vendor_name}` : ''}</p>
                  </div>
                  {doc.ai_extracted && (
                    <span className="text-xs bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-full shrink-0 font-mono">AI</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom row: Appointments + Warranties */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div
          className="dashboard-widget rounded-xl p-5"
          style={{ background: '#111115', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-violet-400" />
              <h2 className="text-sm font-semibold text-zinc-200">Upcoming appointments</h2>
            </div>
            <Link href="/appointments" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {upcomingAppointments.length === 0 ? (
            <div className="text-center py-6">
              <Clock className="w-7 h-7 text-violet-400/20 mx-auto mb-2" />
              <p className="text-sm text-zinc-600">No upcoming appointments</p>
            </div>
          ) : (
            <div className="space-y-2">
              {upcomingAppointments.map((a) => (
                <div key={a.id} className="flex items-center gap-3 p-3 rounded-lg border border-white/[0.05]">
                  <div className="text-xs font-mono text-violet-400 bg-violet-500/10 border border-violet-500/20 rounded-lg px-2 py-1.5 text-center leading-tight shrink-0">
                    {new Date(a.date_time).toLocaleDateString('en', { month: 'short' })}
                    <br />
                    <span className="font-bold text-sm">{new Date(a.date_time).getDate()}</span>
                  </div>
                  <div>
                    <p className="text-sm text-zinc-200 font-medium">{a.title}</p>
                    <p className="text-xs text-zinc-600">
                      {new Date(a.date_time).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}
                      {a.location ? ` · ${a.location}` : ''}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div
          className="dashboard-widget rounded-xl p-5"
          style={{ background: '#111115', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-emerald-400" />
              <h2 className="text-sm font-semibold text-zinc-200">Warranties expiring soon</h2>
            </div>
            <Link href="/warranties" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {warranties.filter(w => isExpiringSoon(w.expiry_date, 60)).length === 0 ? (
            <div className="text-center py-6">
              <CheckCircle2 className="w-7 h-7 text-emerald-400/30 mx-auto mb-2" />
              <p className="text-sm text-zinc-600">No warranties expiring soon</p>
            </div>
          ) : (
            <div className="space-y-2">
              {warranties.filter(w => isExpiringSoon(w.expiry_date, 60)).slice(0, 4).map((w) => {
                const days = getDaysUntil(w.expiry_date)
                return (
                  <div key={w.id} className={`flex items-center justify-between p-3 rounded-lg border ${getUrgencyBg(days)}`}>
                    <div>
                      <p className="text-sm text-zinc-200 font-medium">{w.product_name}</p>
                      <p className="text-xs text-zinc-600">Expires {formatDate(w.expiry_date)}</p>
                    </div>
                    <span className={`text-xs font-mono font-bold ${getUrgencyColor(days)}`}>{days}d</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
