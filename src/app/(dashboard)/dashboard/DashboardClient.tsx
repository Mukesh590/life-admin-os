'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { animate } from 'framer-motion'
import {
  formatDate, getDaysUntil, getGreeting, getUrgencyColor,
  getPriorityBadge, getCategoryColor, monthlyCost, isExpiringSoon
} from '@/lib/utils'
import type { Subscription, Deadline, Document, Bill, Appointment, Warranty } from '@/types'
import type { User } from '@supabase/supabase-js'
import {
  CreditCard, Calendar, FileText, Receipt, Clock, Package,
  AlertTriangle, Plus, ArrowRight, CheckCircle2, Brain
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
    const controls = animate(0, to, {
      duration: 1.1,
      ease: [0.16, 1, 0.3, 1],
      onUpdate(v) {
        if (ref.current) ref.current.textContent = fmtRef.current(v)
      },
    })
    return controls.stop
  }, [to])

  return <span ref={ref}>{format(0)}</span>
}

function EmptyWidget({
  icon: Icon,
  text,
  iconColor = 'text-zinc-800',
}: {
  icon: React.ElementType
  text: string
  iconColor?: string
}) {
  return (
    <div className="text-center py-8">
      <Icon className={`w-8 h-8 ${iconColor} mx-auto mb-2.5`} />
      <p className="text-sm text-zinc-600">{text}</p>
    </div>
  )
}

const glass = { background: '#111118', border: '1px solid rgba(255,255,255,0.06)' }

const stagger = (i: number) => ({
  hidden: { y: 20, opacity: 0 },
  show: {
    y: 0,
    opacity: 1,
    transition: { delay: i * 0.08, duration: 0.4, ease: [0.16, 1, 0.3, 1] as const },
  },
})

export function DashboardClient({
  user, profile, subscriptions, deadlines, documents, bills, appointments, warranties,
}: Props) {
  const name = profile?.full_name?.split(' ')[0] || user.email?.split('@')[0] || 'there'
  const greeting = getGreeting()
  const now = new Date()
  const nextWeek = addDays(now, 7)

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
      label: 'Monthly subscriptions',
      value: monthlySubCost,
      format: (n: number) => `$${n.toFixed(2)}`,
      icon: CreditCard,
      iconBg: 'bg-indigo-500/15 border border-indigo-500/20',
      iconColor: 'text-indigo-400',
      valueColor: 'text-indigo-300',
      href: '/subscriptions',
    },
    {
      label: 'Expiring this week',
      value: expiringThisWeek,
      format: (n: number) => `${Math.round(n)} items`,
      icon: AlertTriangle,
      iconBg: expiringThisWeek > 0 ? 'bg-amber-500/15 border border-amber-500/20' : 'bg-emerald-500/15 border border-emerald-500/20',
      iconColor: expiringThisWeek > 0 ? 'text-amber-400' : 'text-emerald-400',
      valueColor: expiringThisWeek > 0 ? 'text-amber-300' : 'text-emerald-300',
      href: '/subscriptions',
    },
    {
      label: 'Deadlines this week',
      value: deadlinesThisWeek,
      format: (n: number) => `${Math.round(n)} tasks`,
      icon: Calendar,
      iconBg: deadlinesThisWeek > 0 ? 'bg-rose-500/15 border border-rose-500/20' : 'bg-emerald-500/15 border border-emerald-500/20',
      iconColor: deadlinesThisWeek > 0 ? 'text-rose-400' : 'text-emerald-400',
      valueColor: deadlinesThisWeek > 0 ? 'text-rose-300' : 'text-emerald-300',
      href: '/deadlines',
    },
    {
      label: 'Documents tracked',
      value: documents.length,
      format: (n: number) => `${Math.round(n)}`,
      icon: FileText,
      iconBg: 'bg-cyan-500/15 border border-cyan-500/20',
      iconColor: 'text-cyan-400',
      valueColor: 'text-cyan-300',
      href: '/documents',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="flex items-start justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">
            {greeting}, {name}
          </h1>
          <p className="text-zinc-500 text-sm mt-1">
            {overdueDeadlines.length > 0
              ? `${overdueDeadlines.length} overdue item${overdueDeadlines.length > 1 ? 's' : ''} need attention`
              : "Here's your life summary for today"}
          </p>
        </div>
        <Link
          href="/documents"
          className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-violet-600 hover:opacity-90 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-opacity shadow-lg shadow-indigo-500/20"
        >
          <Plus className="w-4 h-4" />
          Add item
        </Link>
      </motion.div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {kpis.map((kpi, i) => (
          <Link key={kpi.label} href={kpi.href}>
            <motion.div
              variants={stagger(i)}
              initial="hidden"
              animate="show"
              whileHover={{ scale: 1.02, boxShadow: '0 8px 32px rgba(0,0,0,0.5)', transition: { duration: 0.15 } }}
              className="rounded-xl p-4 cursor-pointer"
              style={glass}
            >
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${kpi.iconBg}`}>
                <kpi.icon className={`w-4 h-4 ${kpi.iconColor}`} />
              </div>
              <div className={`text-xl font-bold font-mono tabular-nums ${kpi.valueColor}`}>
                <AnimCountUp to={kpi.value} format={kpi.format} />
              </div>
              <div className="text-xs text-zinc-600 mt-1.5 font-medium leading-snug">{kpi.label}</div>
            </motion.div>
          </Link>
        ))}
      </div>

      {/* Main widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Upcoming deadlines */}
        <motion.div
          variants={stagger(4)}
          initial="hidden"
          animate="show"
          className="rounded-xl p-5"
          style={glass}
        >
          <WidgetHeader icon={Calendar} iconBg="bg-rose-500/15 border-rose-500/20" iconColor="text-rose-400" title="Upcoming deadlines" href="/deadlines" />
          {upcomingDeadlines.length === 0 ? (
            <EmptyWidget icon={CheckCircle2} text="No upcoming deadlines" iconColor="text-emerald-400/30" />
          ) : (
            <div className="space-y-1">
              {upcomingDeadlines.map(d => {
                const days = getDaysUntil(d.due_date)
                return (
                  <Link key={d.id} href="/deadlines">
                    <div className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-white/[0.03] transition-colors">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-zinc-200 font-medium truncate">{d.title}</p>
                        <p className="text-xs text-zinc-600 mt-0.5">{formatDate(d.due_date)}</p>
                      </div>
                      <div className="flex items-center gap-2 ml-3 shrink-0">
                        <span className={`text-xs font-mono font-semibold ${getUrgencyColor(days)}`}>
                          {days === 0 ? 'Today' : days < 0 ? `${Math.abs(days)}d ago` : `${days}d`}
                        </span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${getPriorityBadge(d.priority)}`}>
                          {d.priority}
                        </span>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </motion.div>

        {/* Active subscriptions */}
        <motion.div
          variants={stagger(5)}
          initial="hidden"
          animate="show"
          className="rounded-xl p-5"
          style={glass}
        >
          <WidgetHeader icon={CreditCard} iconBg="bg-indigo-500/15 border-indigo-500/20" iconColor="text-indigo-400" title="Active subscriptions" href="/subscriptions" />
          {subscriptions.length === 0 ? (
            <EmptyWidget icon={CreditCard} text="No subscriptions tracked" iconColor="text-indigo-400/20" />
          ) : (
            <div className="space-y-1">
              {subscriptions.slice(0, 5).map(s => {
                const days = getDaysUntil(s.next_renewal_date)
                return (
                  <div key={s.id} className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-white/[0.03] transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-zinc-200 font-medium truncate">{s.name}</p>
                      <p className="text-xs text-zinc-600 mt-0.5">Renews {formatDate(s.next_renewal_date)}</p>
                    </div>
                    <span className={`text-xs font-mono font-semibold ml-3 shrink-0 ${days <= 7 ? 'text-amber-400' : 'text-zinc-500'}`}>
                      ${monthlyCost(s.amount, s.billing_cycle).toFixed(2)}/mo
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </motion.div>

        {/* Unpaid bills */}
        <motion.div
          variants={stagger(6)}
          initial="hidden"
          animate="show"
          className="rounded-xl p-5"
          style={glass}
        >
          <WidgetHeader icon={Receipt} iconBg="bg-amber-500/15 border-amber-500/20" iconColor="text-amber-400" title="Unpaid bills" href="/bills" />
          {unpaidBills.length === 0 ? (
            <EmptyWidget icon={CheckCircle2} text="All bills are paid" iconColor="text-emerald-400/30" />
          ) : (
            <div className="space-y-1">
              {unpaidBills.map(b => {
                const days = getDaysUntil(b.due_date)
                return (
                  <div key={b.id} className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-white/[0.03] transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-zinc-200 font-medium truncate">{b.name}</p>
                      <p className="text-xs text-zinc-600 mt-0.5">Due {formatDate(b.due_date)}</p>
                    </div>
                    <span className={`text-sm font-mono font-bold ml-3 shrink-0 ${getUrgencyColor(days)}`}>
                      ${b.amount.toFixed(2)}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </motion.div>

        {/* Recent documents */}
        <motion.div
          variants={stagger(7)}
          initial="hidden"
          animate="show"
          className="rounded-xl p-5"
          style={glass}
        >
          <WidgetHeader icon={FileText} iconBg="bg-cyan-500/15 border-cyan-500/20" iconColor="text-cyan-400" title="Recent documents" href="/documents" />
          {recentDocs.length === 0 ? (
            <EmptyWidget icon={FileText} text="No documents uploaded yet" iconColor="text-cyan-400/20" />
          ) : (
            <div className="space-y-1">
              {recentDocs.map(doc => (
                <div key={doc.id} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/[0.03] transition-colors">
                  <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
                    <FileText className="w-3.5 h-3.5 text-cyan-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-zinc-200 font-medium truncate">{doc.file_name}</p>
                    <p className="text-xs text-zinc-600">{doc.document_type}{doc.vendor_name ? ` · ${doc.vendor_name}` : ''}</p>
                  </div>
                  {doc.ai_extracted && (
                    <span className="text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-1.5 py-0.5 rounded-full shrink-0 font-mono">AI</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Appointments */}
        <motion.div
          variants={stagger(8)}
          initial="hidden"
          animate="show"
          className="rounded-xl p-5"
          style={glass}
        >
          <WidgetHeader icon={Clock} iconBg="bg-violet-500/15 border-violet-500/20" iconColor="text-violet-400" title="Upcoming appointments" href="/appointments" />
          {upcomingAppointments.length === 0 ? (
            <EmptyWidget icon={Clock} text="No upcoming appointments" iconColor="text-violet-400/20" />
          ) : (
            <div className="space-y-1">
              {upcomingAppointments.map(a => (
                <div key={a.id} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/[0.03] transition-colors">
                  <div className="text-xs font-mono text-violet-400 bg-violet-500/10 border border-violet-500/20 rounded-lg px-2 py-1 text-center leading-tight shrink-0 min-w-[36px]">
                    {new Date(a.date_time).toLocaleDateString('en', { month: 'short' })}
                    <br />
                    <span className="font-bold text-sm leading-none">{new Date(a.date_time).getDate()}</span>
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
        </motion.div>

        {/* Warranties */}
        <motion.div
          variants={stagger(9)}
          initial="hidden"
          animate="show"
          className="rounded-xl p-5"
          style={glass}
        >
          <WidgetHeader icon={Package} iconBg="bg-emerald-500/15 border-emerald-500/20" iconColor="text-emerald-400" title="Warranties expiring soon" href="/warranties" />
          {expiringWarranties.length === 0 ? (
            <EmptyWidget icon={CheckCircle2} text="No warranties expiring soon" iconColor="text-emerald-400/30" />
          ) : (
            <div className="space-y-1">
              {expiringWarranties.map(w => {
                const days = getDaysUntil(w.expiry_date)
                return (
                  <div key={w.id} className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-white/[0.03] transition-colors">
                    <div>
                      <p className="text-sm text-zinc-200 font-medium">{w.product_name}</p>
                      <p className="text-xs text-zinc-600">Expires {formatDate(w.expiry_date)}</p>
                    </div>
                    <span className={`text-xs font-mono font-bold shrink-0 ${getUrgencyColor(days)}`}>{days}d</span>
                  </div>
                )
              })}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}

function WidgetHeader({
  icon: Icon,
  iconBg,
  iconColor,
  title,
  href,
}: {
  icon: React.ElementType
  iconBg: string
  iconColor: string
  title: string
  href: string
}) {
  return (
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        <div className={`w-6 h-6 rounded-md border flex items-center justify-center ${iconBg}`}>
          <Icon className={`w-3.5 h-3.5 ${iconColor}`} />
        </div>
        <h2 className="text-sm font-semibold text-zinc-200">{title}</h2>
      </div>
      <Link href={href} className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors">
        View all <ArrowRight className="w-3 h-3" />
      </Link>
    </div>
  )
}
