'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import {
  AlertTriangle,
  ArrowRight,
  Brain,
  CalendarCheck,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleDollarSign,
  FileWarning,
  Flame,
  Inbox,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Sparkles,
  Target,
  Trash2,
  TrendingDown,
  TrendingUp,
} from 'lucide-react'
import { format, startOfMonth, startOfWeek, subMonths } from 'date-fns'
import { createClient } from '@/lib/supabase/client'
import { cn, monthlyCost } from '@/lib/utils'
import {
  buildEntropyNudges,
  calculateBudget,
  compareMonthlyTrends,
  computeBestStreak,
  computeCompletionScore,
  findMissingDocumentation,
  getUrgencyStatus,
  isOccurrenceComplete,
  summarizePostponements,
  urgencyClasses,
} from '@/lib/life-admin'
import type {
  Appointment,
  Bill,
  CategoryBudget,
  CompletionEvent,
  DashboardFeatureData,
  Deadline,
  Document,
  QuickInboxItem,
  Subscription,
  Warranty,
  WeeklyFocusNote,
} from '@/types'

type Props = {
  userId: string
  subscriptions: Subscription[]
  deadlines: Deadline[]
  documents: Document[]
  bills: Bill[]
  appointments: Appointment[]
  warranties: Warranty[]
  initialFeatureData: DashboardFeatureData
}

type InboxTarget = NonNullable<QuickInboxItem['processed_into_type']>

const card = 'glass rounded-3xl border border-white/[0.07]'
const field = 'w-full rounded-xl border border-white/[0.1] bg-black/20 px-3 py-2.5 text-sm text-white placeholder:text-[#8a8aa3] focus:outline-none focus:ring-2 focus:ring-[#f3924f]/60 disabled:cursor-not-allowed disabled:opacity-50'
const button = 'inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-[#f3924f]/70 disabled:cursor-not-allowed disabled:opacity-50'
const orangeButton = `${button} bg-[#e2793d] text-white hover:bg-[#f3924f]`
const quietButton = `${button} border border-white/[0.1] bg-white/[0.04] text-[#d8d8e5] hover:bg-white/[0.08]`

function Delta({
  value,
  suffix = '',
  lowerIsBetter = false,
}: {
  value: number
  suffix?: string
  lowerIsBetter?: boolean
}) {
  const improved = lowerIsBetter ? value <= 0 : value >= 0
  const Icon = value >= 0 ? TrendingUp : TrendingDown
  return (
    <span className={cn('inline-flex items-center gap-1 text-xs font-semibold', improved ? 'text-emerald-300' : 'text-rose-300')}>
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {value > 0 ? '+' : ''}{value}{suffix} vs last month
    </span>
  )
}

function SectionHeading({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType
  title: string
  description?: string
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-[#f3924f]/20 bg-[#e2793d]/10 text-[#f3924f]">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>
      <div>
        <h2 className="text-base font-bold text-white">{title}</h2>
        {description && <p className="mt-0.5 text-xs leading-relaxed text-[#8a8aa3]">{description}</p>}
      </div>
    </div>
  )
}

export function ProductivityDashboard({
  userId,
  subscriptions,
  deadlines,
  documents,
  bills,
  appointments,
  warranties,
  initialFeatureData,
}: Props) {
  const supabase = useMemo(() => createClient(), [])
  const [inboxItems, setInboxItems] = useState(initialFeatureData.inboxItems)
  const [budgets, setBudgets] = useState(initialFeatureData.budgets)
  const [focus, setFocus] = useState(initialFeatureData.weeklyFocus)
  const [completionEvents, setCompletionEvents] = useState(initialFeatureData.completionEvents)
  const [report, setReport] = useState(initialFeatureData.latestReport?.report_text ?? '')
  const [captureTitle, setCaptureTitle] = useState('')
  const [captureDetails, setCaptureDetails] = useState(false)
  const [captureNote, setCaptureNote] = useState('')
  const [captureCategory, setCaptureCategory] = useState('')
  const [captureDue, setCaptureDue] = useState('')
  const [focusDraft, setFocusDraft] = useState(focus?.focus_text ?? '')
  const [editingFocus, setEditingFocus] = useState(!focus)
  const [budgetCategory, setBudgetCategory] = useState('')
  const [budgetCap, setBudgetCap] = useState('')
  const [budgetRollover, setBudgetRollover] = useState(false)
  const [inboxTargets, setInboxTargets] = useState<Record<string, InboxTarget>>({})
  const [busy, setBusy] = useState<string | null>(null)
  const [featureError, setFeatureError] = useState<string | null>(null)

  const now = useMemo(() => new Date(), [])
  const weekStart = format(startOfWeek(now, { weekStartsOn: 1 }), 'yyyy-MM-dd')
  const monthStart = format(startOfMonth(now), 'yyyy-MM-dd')
  const previousMonth = subMonths(now, 1)

  const missingDocumentation = useMemo(
    () => findMissingDocumentation(warranties, bills, documents),
    [warranties, bills, documents],
  )

  const attentionItems = useMemo(() => {
    const items: {
      id: string
      title: string
      kind: string
      href: string
      dueAt: string
      complete: boolean
    }[] = [
      ...deadlines.map(item => ({
        id: item.id,
        title: item.title,
        kind: 'Deadline',
        href: '/deadlines',
        dueAt: item.due_date,
        complete: item.status === 'completed',
      })),
      ...bills.map(item => ({
        id: item.id,
        title: item.name,
        kind: 'Bill',
        href: '/bills',
        dueAt: item.due_date,
        complete: item.paid,
      })),
      ...subscriptions.filter(item => item.status === 'active').map(item => ({
        id: item.id,
        title: item.name,
        kind: 'Renewal',
        href: '/subscriptions',
        dueAt: item.next_renewal_date,
        complete: false,
      })),
      ...appointments.map(item => ({
        id: item.id,
        title: item.title,
        kind: 'Appointment',
        href: '/appointments',
        dueAt: item.date_time,
        complete: false,
      })),
      ...warranties.map(item => ({
        id: item.id,
        title: item.product_name,
        kind: 'Warranty',
        href: '/warranties',
        dueAt: item.expiry_date,
        complete: false,
      })),
      ...documents.filter(item => item.expiry_date).map(item => ({
        id: item.id,
        title: item.file_name,
        kind: 'Document',
        href: '/documents',
        dueAt: item.expiry_date!,
        complete: false,
      })),
    ]
    return items
      .filter(item => !item.complete)
      .map(item => ({ ...item, urgency: getUrgencyStatus(item.dueAt, now) }))
      .filter(item => item.urgency.days <= 14)
      .sort((a, b) => a.urgency.days - b.urgency.days)
  }, [appointments, bills, deadlines, documents, now, subscriptions, warranties])

  const trend = useMemo(() => compareMonthlyTrends({
    completions: completionEvents,
    dueItems: [
      ...deadlines.map(item => ({ dueAt: item.due_date, complete: item.status === 'completed' })),
      ...bills.map(item => ({ dueAt: item.due_date, complete: item.paid })),
      ...appointments.map(item => ({ dueAt: item.date_time, complete: new Date(item.date_time) < now })),
      ...warranties.map(item => ({ dueAt: item.expiry_date, complete: false })),
    ],
    recurringCosts: [
      ...subscriptions.filter(item => item.status === 'active').map(item => ({
        createdAt: item.created_at,
        monthlyAmount: monthlyCost(item.amount, item.billing_cycle),
      })),
      ...bills.filter(item => item.recurring).map(item => ({
        createdAt: item.created_at,
        monthlyAmount: Number(item.amount),
      })),
    ],
    now,
  }), [appointments, bills, completionEvents, deadlines, now, subscriptions, warranties])

  const streak = useMemo(() => computeBestStreak(completionEvents, now), [completionEvents, now])
  const recurringItems = useMemo(() => [
    ...deadlines.filter(item => item.recurring).map(item => ({
      id: item.id,
      type: 'deadline' as const,
      title: item.title,
      occurrenceDate: item.due_date.slice(0, 10),
      dueAt: item.due_date,
    })),
    ...bills.filter(item => item.recurring).map(item => ({
      id: item.id,
      type: 'bill' as const,
      title: item.name,
      occurrenceDate: item.due_date.slice(0, 10),
      dueAt: item.due_date,
    })),
  ].sort((a, b) => a.dueAt.localeCompare(b.dueAt)), [bills, deadlines])

  const score = useMemo(() => {
    const totalOpen = deadlines.filter(item => item.status !== 'completed').length + bills.filter(item => !item.paid).length
    const overdue = attentionItems.filter(item => item.urgency.level === 'overdue').length
    const upcoming = attentionItems.filter(item => item.urgency.days >= 0).length
    const upcomingPrepared = attentionItems.filter(item => item.urgency.days >= 0 && item.urgency.days > 3).length
    const recurringDue = recurringItems.filter(item => new Date(item.dueAt) <= now).length
    const recurringCompleted = recurringItems.filter(item =>
      isOccurrenceComplete(completionEvents, item.type, item.id, item.occurrenceDate)
    ).length
    return computeCompletionScore({
      totalOpen,
      overdue,
      upcoming,
      upcomingPrepared,
      recurringDue,
      recurringCompleted,
      missingDocumentation: missingDocumentation.length,
      documentationCandidates: warranties.length + bills.length,
      inboxItems,
      now,
    })
  }, [attentionItems, bills, completionEvents, deadlines, inboxItems, missingDocumentation.length, now, recurringItems, warranties.length])

  const budgetRows = useMemo(() => budgets.map(budget => {
    const previousBudget = initialFeatureData.previousBudgets.find(item => item.category === budget.category)
    const previousCalculation = previousBudget
      ? calculateBudget({
          budget: previousBudget,
          bills,
          subscriptions,
          now: previousMonth,
        })
      : null
    return {
      budget,
      calculation: calculateBudget({
        budget,
        bills,
        subscriptions,
        previousRemaining: previousCalculation?.remaining ?? 0,
        now,
      }),
    }
  }), [bills, budgets, initialFeatureData.previousBudgets, now, previousMonth, subscriptions])

  const nudges = useMemo(() => buildEntropyNudges({
    activityEvents: initialFeatureData.activityEvents,
    overdueNow: trend.current.urgent,
    overduePrevious: trend.previous.urgent,
    missingDocumentation: missingDocumentation.length,
    inboxItems,
    recurringCostDelta: trend.delta.recurringCost,
  }), [inboxItems, initialFeatureData.activityEvents, missingDocumentation.length, trend])

  const postponements = useMemo(() => {
    const grouped = new Map<string, typeof initialFeatureData.activityEvents>()
    initialFeatureData.activityEvents
      .filter(event => event.event_type === 'postponed')
      .forEach(event => grouped.set(event.item_id, [...(grouped.get(event.item_id) ?? []), event]))
    return Array.from(grouped.entries())
      .map(([itemId, events]) => ({
        itemId,
        title: deadlines.find(item => item.id === itemId)?.title ?? bills.find(item => item.id === itemId)?.name ?? 'Tracked item',
        ...summarizePostponements(events),
      }))
      .sort((a, b) => b.count - a.count)
  }, [bills, deadlines, initialFeatureData])

  const nextAction = attentionItems[0]
    ? {
        title: attentionItems[0].title,
        detail: `${attentionItems[0].kind}: ${attentionItems[0].urgency.label}`,
        href: attentionItems[0].href,
        label: 'Open item',
      }
    : inboxItems.some(item => item.state === 'inbox')
      ? {
          title: 'Process your oldest inbox item',
          detail: 'Your urgent queue is clear. Turn one capture into an action.',
          href: '#inbox',
          label: 'Open inbox',
        }
      : missingDocumentation[0]
        ? {
            title: `Attach support for ${missingDocumentation[0].title}`,
            detail: missingDocumentation[0].reason,
            href: '/documents',
            label: 'Upload document',
          }
        : {
            title: 'You are clear for now',
            detail: 'Capture anything new before it becomes mental clutter.',
            href: '#inbox',
            label: 'Quick capture',
          }

  function guardMigration() {
    if (initialFeatureData.migrationReady) return true
    setFeatureError('Persistence is waiting for the reviewed Supabase migration. Existing features remain available.')
    return false
  }

  async function addInboxItem(event: React.FormEvent) {
    event.preventDefault()
    if (!captureTitle.trim() || !guardMigration()) return
    setBusy('capture')
    setFeatureError(null)
    const payload = {
      user_id: userId,
      title: captureTitle.trim(),
      note: captureNote.trim() || null,
      category: captureCategory.trim() || null,
      due_date: captureDue || null,
    }
    const { data, error } = await supabase.from('quick_inbox_items').insert(payload).select().single()
    if (error || !data) {
      setFeatureError('Quick capture could not be saved. The migration may still need to be applied.')
    } else {
      setInboxItems(items => [data as QuickInboxItem, ...items])
      setCaptureTitle('')
      setCaptureNote('')
      setCaptureCategory('')
      setCaptureDue('')
      setCaptureDetails(false)
    }
    setBusy(null)
  }

  async function processInboxItem(item: QuickInboxItem) {
    if (!guardMigration()) return
    const target = inboxTargets[item.id] ?? 'deadline'
    setBusy(`process:${item.id}`)
    setFeatureError(null)
    const { data, error } = await supabase.from('quick_inbox_items').update({
      state: 'processed',
      processed_into_type: target,
      processed_into_id: null,
      processed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }).eq('id', item.id).select().single()

    if (error || !data) {
      setFeatureError('The inbox item could not be processed.')
    } else {
      setInboxItems(items => items.map(current => current.id === item.id ? data as QuickInboxItem : current))
    }
    setBusy(null)
  }

  async function removeInboxItem(id: string) {
    if (!guardMigration()) return
    const { error } = await supabase.from('quick_inbox_items').delete().eq('id', id)
    if (error) setFeatureError('The inbox item could not be removed.')
    else setInboxItems(items => items.filter(item => item.id !== id))
  }

  async function saveFocus(event: React.FormEvent) {
    event.preventDefault()
    if (!focusDraft.trim() || !guardMigration()) return
    setBusy('focus')
    const { data, error } = await supabase.from('weekly_focus_notes').upsert({
      user_id: userId,
      week_start: weekStart,
      focus_text: focusDraft.trim(),
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,week_start' }).select().single()
    if (error || !data) setFeatureError('Weekly focus could not be saved.')
    else {
      setFocus(data as WeeklyFocusNote)
      setEditingFocus(false)
    }
    setBusy(null)
  }

  async function toggleOccurrence(item: typeof recurringItems[number]) {
    if (!guardMigration()) return
    const existing = completionEvents.find(event =>
      event.item_type === item.type &&
      event.item_id === item.id &&
      event.occurrence_date.slice(0, 10) === item.occurrenceDate
    )
    setBusy(`occurrence:${item.type}:${item.id}`)
    if (existing) {
      const { error } = await supabase.from('item_completion_events').delete().eq('id', existing.id)
      if (error) setFeatureError('The occurrence could not be reopened.')
      else setCompletionEvents(events => events.filter(event => event.id !== existing.id))
    } else {
      const { data, error } = await supabase.from('item_completion_events').insert({
        user_id: userId,
        item_type: item.type,
        item_id: item.id,
        occurrence_date: item.occurrenceDate,
        due_at: item.dueAt,
      }).select().single()
      if (error || !data) setFeatureError('The occurrence completion could not be saved.')
      else setCompletionEvents(events => [data as CompletionEvent, ...events])
    }
    setBusy(null)
  }

  async function saveBudget(event: React.FormEvent) {
    event.preventDefault()
    const cap = Number(budgetCap)
    if (!budgetCategory.trim() || !Number.isFinite(cap) || cap < 0 || !guardMigration()) return
    setBusy('budget')
    const { data, error } = await supabase.from('category_budgets').upsert({
      user_id: userId,
      category: budgetCategory.trim().toLocaleLowerCase(),
      month_start: monthStart,
      monthly_cap: cap,
      rollover_enabled: budgetRollover,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,category,month_start' }).select().single()
    if (error || !data) setFeatureError('The category budget could not be saved.')
    else {
      setBudgets(items => [
        ...items.filter(item => item.category !== data.category),
        data as CategoryBudget,
      ])
      setBudgetCategory('')
      setBudgetCap('')
      setBudgetRollover(false)
    }
    setBusy(null)
  }

  async function removeBudget(id: string) {
    if (!guardMigration()) return
    const { error } = await supabase.from('category_budgets').delete().eq('id', id)
    if (error) setFeatureError('The category budget could not be removed.')
    else setBudgets(items => items.filter(item => item.id !== id))
  }

  async function generateReport() {
    setBusy('report')
    setFeatureError(null)
    try {
      const response = await fetch('/api/weekly-report', { method: 'POST' })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Report generation failed')
      setReport(result.report)
      if (result.cached === false && !initialFeatureData.migrationReady) {
        setFeatureError('Report generated, but caching is waiting for the migration.')
      }
    } catch {
      setFeatureError('The AI report is unavailable right now. Your computed dashboard summary is still current.')
    } finally {
      setBusy(null)
    }
  }

  const categoryOptions = Array.from(new Set([
    ...bills.map(item => item.category),
    ...subscriptions.map(item => item.category),
    'utilities',
    'financial',
    'personal',
    'insurance',
    'software',
    'entertainment',
    'other',
  ])).filter(Boolean).sort()
  // All entities now live as sections on one page (redesign v2), so a
  // capture link needs the target entity in the query string (multiple
  // section forms are mounted at once — captureTarget is how each one knows
  // whether this capture is meant for it) plus the section's anchor hash.
  const sectionForTarget: Record<InboxTarget, string> = {
    deadline: 'deadlines',
    bill: 'bills',
    document: 'documents',
    subscription: 'subscriptions',
    appointment: 'appointments',
    warranty: 'warranties',
  }

  function captureHref(item: QuickInboxItem, target: InboxTarget) {
    const params = new URLSearchParams({ captureTitle: item.title, captureTarget: target })
    if (item.note) params.set('captureNote', item.note)
    if (item.due_date) params.set('captureDue', item.due_date)
    return `/dashboard?${params.toString()}#${sectionForTarget[target]}`
  }

  return (
    <section aria-label="Life AdminOS productivity system" className="space-y-4">
      {!initialFeatureData.migrationReady && (
        <div role="status" className="flex items-start gap-3 rounded-2xl border border-amber-400/20 bg-amber-400/[0.08] px-4 py-3 text-sm text-amber-100">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <p>
            Productivity persistence is staged but inactive until the new Supabase migration is reviewed and applied.
            Existing dashboard data and computed insights continue to work.
          </p>
        </div>
      )}
      {featureError && (
        <div role="alert" className="flex items-start justify-between gap-3 rounded-2xl border border-rose-400/20 bg-rose-400/[0.08] px-4 py-3 text-sm text-rose-100">
          <span>{featureError}</span>
          <button onClick={() => setFeatureError(null)} className="shrink-0 rounded-lg px-2 py-1 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-rose-300">
            Dismiss
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(300px,.65fr)]">
        <div className={`${card} relative overflow-hidden p-5 sm:p-6`}>
          <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_center,rgba(226,121,61,.18),transparent_68%)]" aria-hidden="true" />
          <div className="relative">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#f3924f]">
              <Target className="h-4 w-4" aria-hidden="true" />
              Next action
            </div>
            <h2 className="mt-3 max-w-2xl text-xl font-bold text-white sm:text-2xl">{nextAction.title}</h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#b6b6c8]">{nextAction.detail}</p>
            <Link href={nextAction.href} className={`${orangeButton} mt-5`}>
              {nextAction.label}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>

        <div className={`${card} p-5`}>
          <div className="flex items-start justify-between gap-4">
            <SectionHeading icon={Target} title="Weekly focus" description={`Week of ${format(new Date(`${weekStart}T12:00:00`), 'MMM d')}`} />
            {focus && !editingFocus && (
              <button onClick={() => setEditingFocus(true)} className="rounded-xl p-2 text-[#8a8aa3] hover:bg-white/[0.06] hover:text-white focus:outline-none focus:ring-2 focus:ring-[#f3924f]/70" aria-label="Edit weekly focus">
                <Pencil className="h-4 w-4" />
              </button>
            )}
          </div>
          {editingFocus ? (
            <form onSubmit={saveFocus} className="mt-4">
              <label htmlFor="weekly-focus" className="sr-only">One short focus for this week</label>
              <input
                id="weekly-focus"
                value={focusDraft}
                maxLength={120}
                onChange={event => setFocusDraft(event.target.value)}
                placeholder="What matters most this week?"
                className={field}
                disabled={!initialFeatureData.migrationReady}
              />
              <div className="mt-2 flex items-center justify-between gap-3">
                <span className="text-xs text-[#8a8aa3]">{focusDraft.length}/120</span>
                <button className={orangeButton} disabled={busy === 'focus' || !focusDraft.trim() || !initialFeatureData.migrationReady}>
                  {busy === 'focus' && <Loader2 className="h-4 w-4 animate-spin" />}
                  Save focus
                </button>
              </div>
            </form>
          ) : (
            <p className="mt-5 text-lg font-semibold leading-snug text-white">{focus?.focus_text}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,.6fr)]">
        <div id="attention" className={`${card} p-5 sm:p-6`}>
          <div className="flex items-start justify-between gap-4">
            <SectionHeading icon={AlertTriangle} title="Attention queue" description="One urgency rule across dates, renewals, expiries, and due items." />
            <span className="rounded-full border border-white/10 px-3 py-1 text-xs font-semibold text-[#b6b6c8]">
              {attentionItems.length} within 14d
            </span>
          </div>
          {attentionItems.length === 0 ? (
            <div className="mt-6 flex items-center gap-3 rounded-2xl border border-emerald-400/15 bg-emerald-400/[0.06] p-4 text-sm text-emerald-100">
              <CheckCircle2 className="h-5 w-5 shrink-0" />
              No urgent or overdue items. Your near-term queue is clear.
            </div>
          ) : (
            <div className="mt-5 grid gap-2">
              {attentionItems.slice(0, 6).map(item => (
                <Link
                  key={`${item.kind}:${item.id}`}
                  href={item.href}
                  className="flex min-h-14 items-center gap-3 rounded-2xl border border-white/[0.06] bg-black/10 px-4 py-3 transition hover:border-white/[0.12] hover:bg-white/[0.04] focus:outline-none focus:ring-2 focus:ring-[#f3924f]/70"
                >
                  <span className={cn('rounded-lg border px-2 py-1 text-[11px] font-bold', urgencyClasses[item.urgency.level])}>
                    {item.urgency.level === 'red' ? 'Urgent' : item.urgency.level[0].toUpperCase() + item.urgency.level.slice(1)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-white">{item.title}</span>
                    <span className="block text-xs text-[#8a8aa3]">{item.kind}</span>
                  </span>
                  <span className="shrink-0 text-xs font-semibold text-[#c8c8d6]">{item.urgency.label}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className={`${card} p-5 sm:p-6`}>
          <div className="flex items-center justify-between gap-4">
            <SectionHeading icon={CheckCircle2} title="Completion score" description="A formula, not an AI verdict." />
            <div
              role="img"
              aria-label={`Completion score ${score.score} out of 100`}
              className="grid h-24 w-24 shrink-0 place-items-center rounded-full"
              style={{ background: `conic-gradient(#f3924f ${score.score * 3.6}deg, rgba(255,255,255,.08) 0)` }}
            >
              <div className="grid h-[74px] w-[74px] place-items-center rounded-full bg-[#111018]">
                <span className="text-2xl font-bold text-white">{score.score}</span>
              </div>
            </div>
          </div>
          <details className="group mt-5">
            <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between rounded-xl border border-white/[0.08] px-3 text-sm font-semibold text-[#d8d8e5] focus:outline-none focus:ring-2 focus:ring-[#f3924f]/70">
              Show calculation
              <ChevronDown className="h-4 w-4 transition group-open:rotate-180" />
            </summary>
            <div className="mt-3 space-y-2">
              {score.factors.map(factor => (
                <div key={factor.key} className="rounded-xl bg-white/[0.03] p-3">
                  <div className="flex justify-between gap-3 text-xs font-semibold text-white">
                    <span>{factor.label}</span>
                    <span>{factor.earned}/{factor.weight}</span>
                  </div>
                  <p className="mt-1 text-xs text-[#8a8aa3]">{factor.explanation}</p>
                </div>
              ))}
            </div>
          </details>
        </div>
      </div>

      <div className={`${card} p-5 sm:p-6`}>
        <SectionHeading icon={TrendingUp} title="Monthly trend digest" description="Current month compared with the previous month." />
        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-white/[0.06] bg-black/10 p-4">
            <p className="text-xs text-[#8a8aa3]">Items completed</p>
            <p className="mt-2 text-2xl font-bold text-white">{trend.current.completed}</p>
            <Delta value={trend.delta.completed} />
          </div>
          <div className="rounded-2xl border border-white/[0.06] bg-black/10 p-4">
            <p className="text-xs text-[#8a8aa3]">Upcoming load</p>
            <p className="mt-2 text-2xl font-bold text-white">{trend.current.upcomingLoad}</p>
            <Delta value={trend.delta.upcomingLoad} lowerIsBetter />
          </div>
          <div className="rounded-2xl border border-white/[0.06] bg-black/10 p-4">
            <p className="text-xs text-[#8a8aa3]">Overdue movement</p>
            <p className="mt-2 text-2xl font-bold text-white">{trend.current.urgent}</p>
            <Delta value={trend.delta.urgent} lowerIsBetter />
          </div>
          <div className="rounded-2xl border border-white/[0.06] bg-black/10 p-4">
            <p className="text-xs text-[#8a8aa3]">Tracked recurring cost</p>
            <p className="mt-2 text-2xl font-bold text-white">${trend.current.recurringCost.toFixed(2)}</p>
            <Delta value={Number(trend.delta.recurringCost.toFixed(2))} suffix="" lowerIsBetter />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <div className={`${card} p-5 sm:p-6`}>
          <div className="flex items-start justify-between gap-4">
            <SectionHeading icon={Flame} title="Recurring rhythm" description="Occurrence checkmarks preserve each recurring source item." />
            <div className="text-right">
              <p className="text-xl font-bold text-white">{streak.current}</p>
              <p className="text-[11px] text-[#8a8aa3]">current · best {streak.best}</p>
            </div>
          </div>
          {recurringItems.length === 0 ? (
            <div className="mt-5 rounded-2xl border border-emerald-400/15 bg-emerald-400/[0.06] p-4 text-sm text-emerald-100">
              No recurring occurrences need a checkmark yet. A zero streak is a clean starting point.
            </div>
          ) : (
            <div className="mt-5 space-y-2">
              {recurringItems.slice(0, 5).map(item => {
                const complete = isOccurrenceComplete(completionEvents, item.type, item.id, item.occurrenceDate)
                return (
                  <button
                    key={`${item.type}:${item.id}:${item.occurrenceDate}`}
                    onClick={() => toggleOccurrence(item)}
                    disabled={busy === `occurrence:${item.type}:${item.id}` || !initialFeatureData.migrationReady}
                    className="flex min-h-14 w-full items-center gap-3 rounded-2xl border border-white/[0.07] bg-black/10 px-4 py-3 text-left transition hover:bg-white/[0.04] focus:outline-none focus:ring-2 focus:ring-[#f3924f]/70 disabled:opacity-50"
                  >
                    <span className={cn('grid h-6 w-6 shrink-0 place-items-center rounded-lg border', complete ? 'border-emerald-400/30 bg-emerald-400/15 text-emerald-300' : 'border-white/20 text-transparent')}>
                      <Check className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-white">{item.title}</span>
                      <span className="text-xs capitalize text-[#8a8aa3]">{item.type} occurrence · {format(new Date(`${item.occurrenceDate}T12:00:00`), 'MMM d')}</span>
                    </span>
                    <span className="text-xs font-semibold text-[#b6b6c8]">{complete ? 'Completed' : 'Mark done'}</span>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        <div className={`${card} p-5 sm:p-6`}>
          <SectionHeading icon={CircleDollarSign} title="Category budgets" description="Tracked bills and subscriptions only. No bank connection." />
          <form onSubmit={saveBudget} className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-[1fr_130px_auto]">
            <select value={budgetCategory} onChange={event => setBudgetCategory(event.target.value)} className={field} aria-label="Budget category" disabled={!initialFeatureData.migrationReady}>
              <option value="">Category</option>
              {categoryOptions.map(category => <option key={category} value={category} className="bg-[#15121a] capitalize">{category}</option>)}
            </select>
            <input value={budgetCap} onChange={event => setBudgetCap(event.target.value)} type="number" min="0" step="0.01" placeholder="Monthly cap" className={field} aria-label="Monthly cap" disabled={!initialFeatureData.migrationReady} />
            <button className={orangeButton} disabled={busy === 'budget' || !initialFeatureData.migrationReady}>
              <Plus className="h-4 w-4" /> Add
            </button>
            <label className="flex min-h-11 items-center gap-2 text-xs text-[#b6b6c8] sm:col-span-3">
              <input type="checkbox" checked={budgetRollover} onChange={event => setBudgetRollover(event.target.checked)} className="h-4 w-4 accent-[#e2793d]" disabled={!initialFeatureData.migrationReady} />
              Roll positive remaining amount into next month
            </label>
          </form>
          {budgetRows.length === 0 ? (
            <p className="mt-4 rounded-2xl bg-white/[0.03] p-4 text-sm text-[#b6b6c8]">No limits set. Add one only where a cap would help.</p>
          ) : (
            <div className="mt-4 space-y-3">
              {budgetRows.map(({ budget, calculation }) => (
                <div key={budget.id} className="rounded-2xl border border-white/[0.07] bg-black/10 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold capitalize text-white">{budget.category}</p>
                      <p className="mt-1 text-xs text-[#8a8aa3]">
                        ${calculation.actual.toFixed(2)} tracked · ${calculation.remaining.toFixed(2)} remaining
                        {calculation.rollover > 0 && ` · $${calculation.rollover.toFixed(2)} rolled over`}
                      </p>
                    </div>
                    <button onClick={() => removeBudget(budget.id)} className="rounded-lg p-2 text-[#8a8aa3] hover:bg-rose-400/10 hover:text-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-300" aria-label={`Remove ${budget.category} budget`}>
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/[0.08]" role="progressbar" aria-label={`${budget.category} budget progress`} aria-valuenow={Math.min(calculation.progress, 100)} aria-valuemin={0} aria-valuemax={100}>
                    <div className={cn('h-full rounded-full', calculation.warning ? 'bg-rose-400' : 'bg-[#e2793d]')} style={{ width: `${Math.min(calculation.progress, 100)}%` }} />
                  </div>
                  <div className="mt-2 flex justify-between text-xs">
                    <span className={calculation.warning ? 'font-semibold text-rose-300' : 'text-[#8a8aa3]'}>
                      {calculation.warning ? 'Limit reached' : `${calculation.progress}% used`}
                    </span>
                    <span className="text-[#b6b6c8]">${calculation.effectiveCap.toFixed(2)} limit</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div id="inbox" className={`${card} p-5 sm:p-6`}>
        <SectionHeading icon={Inbox} title="Quick inbox" description="Capture first. Sort it into an existing workflow when ready." />
        <form onSubmit={addInboxItem} className="mt-5">
          <div className="flex flex-col gap-2 sm:flex-row">
            <label htmlFor="capture-title" className="sr-only">Quick capture title</label>
            <input id="capture-title" autoComplete="off" value={captureTitle} onChange={event => setCaptureTitle(event.target.value)} maxLength={160} placeholder="Type something to remember…" className={`${field} flex-1`} disabled={!initialFeatureData.migrationReady} />
            <button type="button" onClick={() => setCaptureDetails(value => !value)} className={quietButton} aria-expanded={captureDetails}>
              Details <ChevronDown className={cn('h-4 w-4 transition', captureDetails && 'rotate-180')} />
            </button>
            <button className={orangeButton} disabled={!captureTitle.trim() || busy === 'capture' || !initialFeatureData.migrationReady}>
              {busy === 'capture' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Capture
            </button>
          </div>
          {captureDetails && (
            <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-3">
              <input value={captureNote} onChange={event => setCaptureNote(event.target.value)} maxLength={1000} placeholder="Optional note" className={field} aria-label="Optional capture note" />
              <input value={captureCategory} onChange={event => setCaptureCategory(event.target.value)} maxLength={80} placeholder="Optional category" className={field} aria-label="Optional capture category" />
              <input value={captureDue} onChange={event => setCaptureDue(event.target.value)} type="date" className={field} aria-label="Optional due date" />
            </div>
          )}
        </form>

        <div className="mt-5 grid gap-2">
          {inboxItems.filter(item => item.state === 'inbox').length === 0 ? (
            <div className="rounded-2xl border border-emerald-400/15 bg-emerald-400/[0.06] p-4 text-sm text-emerald-100">
              Inbox clear. New captures will wait here without getting lost.
            </div>
          ) : inboxItems.filter(item => item.state === 'inbox').slice(0, 8).map(item => {
            const target = inboxTargets[item.id] ?? 'deadline'
            return (
              <div key={item.id} className="flex flex-col gap-3 rounded-2xl border border-white/[0.07] bg-black/10 p-4 lg:flex-row lg:items-center">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-white">{item.title}</p>
                  <p className="mt-1 text-xs text-[#8a8aa3]">
                    {item.category || 'Unsorted'}{item.due_date ? ` · due ${format(new Date(`${item.due_date}T12:00:00`), 'MMM d')}` : ''}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={target}
                    onChange={event => setInboxTargets(current => ({ ...current, [item.id]: event.target.value as InboxTarget }))}
                    className={`${field} min-w-[150px]`}
                    aria-label={`Workflow for ${item.title}`}
                  >
                    {(Object.keys(sectionForTarget) as InboxTarget[]).map(value => <option key={value} value={value} className="bg-[#15121a] capitalize">{value}</option>)}
                  </select>
                  <Link href={captureHref(item, target)} className={orangeButton}>Open {target}</Link>
                  <button onClick={() => processInboxItem(item)} className={quietButton} disabled={busy === `process:${item.id}`}>
                    {busy === `process:${item.id}` ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                    Mark processed
                  </button>
                  <button onClick={() => removeInboxItem(item.id)} className="grid min-h-11 min-w-11 place-items-center rounded-xl text-[#8a8aa3] hover:bg-rose-400/10 hover:text-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-300" aria-label={`Remove ${item.title}`}>
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className={`${card} p-5 sm:p-6 xl:col-span-2`}>
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
            <SectionHeading icon={Brain} title="AI weekly report" description="On demand, grounded in your authenticated Life AdminOS data." />
            <button onClick={generateReport} className={orangeButton} disabled={busy === 'report'}>
              {busy === 'report' ? <Loader2 className="h-4 w-4 animate-spin" /> : report ? <RefreshCw className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
              {report ? 'Refresh report' : 'Generate report'}
            </button>
          </div>
          {report ? (
            <div className="mt-5 whitespace-pre-wrap rounded-2xl border border-white/[0.07] bg-black/10 p-5 text-sm leading-7 text-[#d8d8e5]">{report}</div>
          ) : (
            <p className="mt-5 rounded-2xl bg-white/[0.03] p-5 text-sm leading-relaxed text-[#b6b6c8]">
              Nothing is generated automatically. Ask for a report when you want a plain-language review of progress, upcoming risk, and one next action.
            </p>
          )}
        </div>

        <div className={`${card} p-5 sm:p-6`}>
          <SectionHeading icon={Sparkles} title="System nudges" description="Neutral observations with a clear action." />
          {nudges.length === 0 ? (
            <div className="mt-5 rounded-2xl border border-emerald-400/15 bg-emerald-400/[0.06] p-4 text-sm text-emerald-100">
              No cleanup nudge is needed right now.
            </div>
          ) : (
            <div className="mt-5 space-y-3">
              {nudges.slice(0, 3).map(nudge => (
                <div key={`${nudge.message}:${nudge.href}`} className="rounded-2xl border border-white/[0.07] bg-black/10 p-4">
                  <p className="text-sm font-semibold text-white">{nudge.message}</p>
                  <Link href={nudge.href} className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[#f3924f] hover:text-white focus:outline-none focus:ring-2 focus:ring-[#f3924f]/70">
                    {nudge.action} <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <div className={`${card} p-5 sm:p-6`}>
          <SectionHeading icon={FileWarning} title="Missing documentation" description="Records that reasonably need a receipt or matching file." />
          {missingDocumentation.length === 0 ? (
            <div className="mt-5 flex items-center gap-3 rounded-2xl border border-emerald-400/15 bg-emerald-400/[0.06] p-4 text-sm text-emerald-100">
              <CheckCircle2 className="h-5 w-5 shrink-0" />
              Supporting-document checks are clear.
            </div>
          ) : (
            <div className="mt-5 space-y-2">
              {missingDocumentation.slice(0, 5).map(flag => (
                <div key={`${flag.itemType}:${flag.itemId}`} className="flex items-center gap-3 rounded-2xl border border-white/[0.07] bg-black/10 p-4">
                  <FileWarning className="h-5 w-5 shrink-0 text-amber-300" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-white">{flag.title}</span>
                    <span className="block text-xs text-[#8a8aa3]">{flag.reason}</span>
                  </span>
                  <Link href={flag.actionHref} className={quietButton}>Upload</Link>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={`${card} p-5 sm:p-6`}>
          <SectionHeading icon={CalendarCheck} title="Schedule movement" description="Event-derived postponement history, using neutral language." />
          {postponements.length === 0 ? (
            <div className="mt-5 rounded-2xl border border-emerald-400/15 bg-emerald-400/[0.06] p-4 text-sm text-emerald-100">
              No reschedules recorded. Nothing is being repeatedly pushed.
            </div>
          ) : (
            <div className="mt-5 space-y-2">
              {postponements.slice(0, 5).map(item => (
                <div key={item.itemId} className="flex items-center gap-3 rounded-2xl border border-white/[0.07] bg-black/10 p-4">
                  <CalendarCheck className="h-5 w-5 shrink-0 text-[#f3924f]" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-white">{item.title}</span>
                    <span className="block text-xs text-[#8a8aa3]">Moved {item.count}× · pushed for {item.totalWeeks} week{item.totalWeeks === 1 ? '' : 's'}</span>
                  </span>
                  <Link href="/deadlines" className="text-xs font-semibold text-[#f3924f] hover:text-white">Choose next step</Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
