import {
  addDays,
  addMonths,
  differenceInCalendarDays,
  differenceInCalendarWeeks,
  endOfMonth,
  isAfter,
  isBefore,
  isSameDay,
  startOfMonth,
  subMonths,
} from 'date-fns'
import type {
  Bill,
  CategoryBudget,
  CompletionEvent,
  Document,
  ItemActivityEvent,
  QuickInboxItem,
  Subscription,
  Warranty,
} from '@/types'

export type UrgencyLevel = 'green' | 'yellow' | 'red' | 'overdue'

export type UrgencyStatus = {
  level: UrgencyLevel
  label: string
  days: number
}

function asLocalDate(value: string | Date) {
  if (value instanceof Date) return value
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T12:00:00`) : new Date(value)
}

export function getUrgencyStatus(value: string | Date, now = new Date()): UrgencyStatus {
  const due = asLocalDate(value)
  const days = differenceInCalendarDays(due, now)
  if (days < 0) return { level: 'overdue', label: `Overdue by ${Math.abs(days)}d`, days }
  if (days <= 3) return { level: 'red', label: days === 0 ? 'Due today' : `Due in ${days}d`, days }
  if (days <= 14) return { level: 'yellow', label: `Due in ${days}d`, days }
  return { level: 'green', label: `${days}d away`, days }
}

export const urgencyClasses: Record<UrgencyLevel, string> = {
  green: 'text-emerald-300 bg-emerald-500/10 border-emerald-500/20',
  yellow: 'text-amber-300 bg-amber-500/10 border-amber-500/20',
  red: 'text-rose-300 bg-rose-500/10 border-rose-500/20',
  overdue: 'text-red-300 bg-red-500/10 border-red-500/25',
}

type DatedCompletion = Pick<CompletionEvent, 'occurrence_date'>

export function computeStreak(
  events: DatedCompletion[],
  cadence: 'daily' | 'weekly' | 'monthly' = 'weekly',
  today = new Date(),
) {
  const dates = Array.from(new Set(events.map(event => event.occurrence_date.slice(0, 10))))
    .map(value => new Date(`${value}T12:00:00`))
    .sort((a, b) => a.getTime() - b.getTime())

  if (dates.length === 0) return { current: 0, best: 0 }

  const expectedGap = cadence === 'daily' ? 1 : cadence === 'weekly' ? 7 : null
  const isConsecutive = (previous: Date, current: Date) => {
    if (expectedGap) return differenceInCalendarDays(current, previous) <= expectedGap + 1
    const nextMonth = addMonths(previous, 1)
    return Math.abs(differenceInCalendarDays(current, nextMonth)) <= 3
  }

  let best = 1
  let run = 1
  for (let index = 1; index < dates.length; index += 1) {
    run = isConsecutive(dates[index - 1], dates[index]) ? run + 1 : 1
    best = Math.max(best, run)
  }

  const last = dates[dates.length - 1]
  const stillCurrent = cadence === 'daily'
    ? differenceInCalendarDays(today, last) <= 1
    : cadence === 'weekly'
      ? differenceInCalendarDays(today, last) <= 8
      : differenceInCalendarDays(today, last) <= 34

  if (!stillCurrent) return { current: 0, best }

  let current = 1
  for (let index = dates.length - 1; index > 0; index -= 1) {
    if (!isConsecutive(dates[index - 1], dates[index])) break
    current += 1
  }
  return { current, best }
}

export function computeBestStreak(events: CompletionEvent[], today = new Date()) {
  const groups = new Map<string, CompletionEvent[]>()
  events.forEach(event => {
    const key = `${event.item_type}:${event.item_id}`
    groups.set(key, [...(groups.get(key) ?? []), event])
  })

  return Array.from(groups.values()).reduce(
    (result, group) => {
      const streak = computeStreak(group, 'weekly', today)
      return {
        current: Math.max(result.current, streak.current),
        best: Math.max(result.best, streak.best),
      }
    },
    { current: 0, best: 0 },
  )
}

type TrendDueItem = {
  dueAt: string
  complete: boolean
}

type TrendCostItem = {
  createdAt: string
  monthlyAmount: number
}

export function compareMonthlyTrends({
  completions,
  dueItems,
  recurringCosts,
  now = new Date(),
}: {
  completions: DatedCompletion[]
  dueItems: TrendDueItem[]
  recurringCosts: TrendCostItem[]
  now?: Date
}) {
  const currentStart = startOfMonth(now)
  const currentEnd = endOfMonth(now)
  const previousStart = startOfMonth(subMonths(now, 1))
  const previousEnd = endOfMonth(subMonths(now, 1))
  const inRange = (value: string, start: Date, end: Date) => {
    const date = asLocalDate(value)
    return !isBefore(date, start) && !isAfter(date, end)
  }

  const period = (start: Date, end: Date) => {
    const periodDue = dueItems.filter(item => inRange(item.dueAt, start, end))
    return {
      completed: completions.filter(item => inRange(item.occurrence_date, start, end)).length,
      upcomingLoad: periodDue.length,
      urgent: periodDue.filter(item => !item.complete && isBefore(asLocalDate(item.dueAt), now)).length,
      recurringCost: recurringCosts
        .filter(item => !isAfter(asLocalDate(item.createdAt), end))
        .reduce((sum, item) => sum + item.monthlyAmount, 0),
    }
  }

  const current = period(currentStart, currentEnd)
  const previous = period(previousStart, previousEnd)
  return {
    current,
    previous,
    delta: {
      completed: current.completed - previous.completed,
      upcomingLoad: current.upcomingLoad - previous.upcomingLoad,
      urgent: current.urgent - previous.urgent,
      recurringCost: current.recurringCost - previous.recurringCost,
    },
  }
}

export type MissingDocumentationFlag = {
  itemType: 'warranty' | 'bill'
  itemId: string
  title: string
  reason: string
  actionHref: '/documents'
}

function normalized(value: string) {
  return value.trim().toLocaleLowerCase().replace(/[^a-z0-9]/g, '')
}

export function findMissingDocumentation(
  warranties: Warranty[],
  bills: Bill[],
  documents: Document[],
): MissingDocumentationFlag[] {
  const documentKeys = new Set(
    documents.flatMap(document => [document.vendor_name, document.file_name]
      .filter((value): value is string => Boolean(value))
      .map(normalized)),
  )

  const warrantyFlags = warranties
    .filter(warranty => !warranty.receipt_url)
    .map(warranty => ({
      itemType: 'warranty' as const,
      itemId: warranty.id,
      title: warranty.product_name,
      reason: 'Warranty has no receipt or proof of purchase.',
      actionHref: '/documents' as const,
    }))

  const billFlags = bills
    .filter(bill => bill.amount > 0 && !Array.from(documentKeys).some(key => {
      const billKey = normalized(bill.name)
      return key.includes(billKey) || billKey.includes(key)
    }))
    .map(bill => ({
      itemType: 'bill' as const,
      itemId: bill.id,
      title: bill.name,
      reason: 'Bill has no matching document.',
      actionHref: '/documents' as const,
    }))

  return [...warrantyFlags, ...billFlags]
}

export type ScoreFactor = {
  key: 'overdue' | 'prepared' | 'recurring' | 'documentation' | 'inbox'
  label: string
  weight: number
  earned: number
  explanation: string
}

export function computeCompletionScore({
  totalOpen,
  overdue,
  upcoming,
  upcomingPrepared,
  recurringDue,
  recurringCompleted,
  missingDocumentation,
  documentationCandidates,
  inboxItems,
  now = new Date(),
}: {
  totalOpen: number
  overdue: number
  upcoming: number
  upcomingPrepared: number
  recurringDue: number
  recurringCompleted: number
  missingDocumentation: number
  documentationCandidates: number
  inboxItems: Pick<QuickInboxItem, 'created_at' | 'state'>[]
  now?: Date
}) {
  const ratio = (good: number, total: number) => total === 0 ? 1 : Math.max(0, Math.min(1, good / total))
  const oldInbox = inboxItems.filter(item =>
    item.state === 'inbox' && differenceInCalendarDays(now, new Date(item.created_at)) > 7
  ).length
  const activeInbox = inboxItems.filter(item => item.state === 'inbox').length

  const factors: ScoreFactor[] = [
    {
      key: 'overdue',
      label: 'Items on time',
      weight: 30,
      earned: 30 * ratio(totalOpen - overdue, totalOpen),
      explanation: totalOpen === 0 ? 'No open items are overdue.' : `${overdue} of ${totalOpen} open items overdue.`,
    },
    {
      key: 'prepared',
      label: 'Upcoming items prepared',
      weight: 25,
      earned: 25 * ratio(upcomingPrepared, upcoming),
      explanation: upcoming === 0 ? 'No upcoming preparation needed.' : `${upcomingPrepared} of ${upcoming} upcoming items prepared.`,
    },
    {
      key: 'recurring',
      label: 'Recurring consistency',
      weight: 25,
      earned: 25 * ratio(recurringCompleted, recurringDue),
      explanation: recurringDue === 0 ? 'No recurring occurrences due yet.' : `${recurringCompleted} of ${recurringDue} occurrences completed.`,
    },
    {
      key: 'documentation',
      label: 'Documentation attached',
      weight: 10,
      earned: 10 * ratio(documentationCandidates - missingDocumentation, documentationCandidates),
      explanation: documentationCandidates === 0 ? 'No documentation checks needed.' : `${missingDocumentation} record${missingDocumentation === 1 ? '' : 's'} missing support.`,
    },
    {
      key: 'inbox',
      label: 'Inbox freshness',
      weight: 10,
      earned: 10 * ratio(activeInbox - oldInbox, activeInbox),
      explanation: activeInbox === 0 ? 'Inbox is clear.' : `${oldInbox} inbox item${oldInbox === 1 ? '' : 's'} older than 7 days.`,
    },
  ]

  return {
    score: Math.round(factors.reduce((sum, factor) => sum + factor.earned, 0)),
    factors: factors.map(factor => ({ ...factor, earned: Math.round(factor.earned) })),
  }
}

export function calculateBudget({
  budget,
  bills,
  subscriptions,
  previousRemaining = 0,
  now = new Date(),
}: {
  budget: Pick<CategoryBudget, 'category' | 'monthly_cap' | 'rollover_enabled'>
  bills: Bill[]
  subscriptions: Subscription[]
  previousRemaining?: number
  now?: Date
}) {
  const category = normalized(budget.category)
  const monthStart = startOfMonth(now)
  const monthEnd = endOfMonth(now)
  const billTotal = bills
    .filter(bill => normalized(bill.category) === category)
    .filter(bill => {
      const due = asLocalDate(bill.due_date)
      return !isBefore(due, monthStart) && !isAfter(due, monthEnd)
    })
    .reduce((sum, bill) => sum + Number(bill.amount), 0)
  const subscriptionTotal = subscriptions
    .filter(subscription => subscription.status === 'active' && normalized(subscription.category) === category)
    .reduce((sum, subscription) => {
      const amount = Number(subscription.amount)
      if (subscription.billing_cycle === 'weekly') return sum + amount * 52 / 12
      if (subscription.billing_cycle === 'quarterly') return sum + amount / 3
      if (subscription.billing_cycle === 'annual') return sum + amount / 12
      return sum + amount
    }, 0)
  const cap = Number(budget.monthly_cap)
  const rollover = budget.rollover_enabled ? Math.max(0, previousRemaining) : 0
  const effectiveCap = cap + rollover
  const actual = billTotal + subscriptionTotal
  return {
    actual,
    baseCap: cap,
    rollover,
    effectiveCap,
    remaining: effectiveCap - actual,
    progress: effectiveCap === 0 ? (actual > 0 ? 100 : 0) : Math.round((actual / effectiveCap) * 100),
    warning: actual >= effectiveCap,
  }
}

export function summarizePostponements(events: ItemActivityEvent[]) {
  const postponed = events.filter(event => event.event_type === 'postponed')
  const totalDays = postponed.reduce((sum, event) => {
    if (!event.from_due_at || !event.to_due_at) return sum
    return sum + Math.max(0, differenceInCalendarDays(asLocalDate(event.to_due_at), asLocalDate(event.from_due_at)))
  }, 0)
  return {
    count: postponed.length,
    totalDays,
    totalWeeks: Math.max(0, differenceInCalendarWeeks(addDays(new Date(0), totalDays), new Date(0))),
  }
}

export function buildEntropyNudges({
  activityEvents,
  overdueNow,
  overduePrevious,
  missingDocumentation,
  inboxItems,
  recurringCostDelta,
}: {
  activityEvents: ItemActivityEvent[]
  overdueNow: number
  overduePrevious: number
  missingDocumentation: number
  inboxItems: QuickInboxItem[]
  recurringCostDelta: number
}) {
  const nudges: { message: string; action: string; href: string }[] = []
  const postponements = summarizePostponements(activityEvents)
  if (postponements.count >= 2) {
    nudges.push({
      message: `${postponements.count} schedule moves are recorded.`,
      action: 'Choose one moved deadline to finish or reschedule once.',
      href: '/deadlines',
    })
  }
  if (overdueNow > overduePrevious) {
    nudges.push({
      message: `Overdue items increased by ${overdueNow - overduePrevious}.`,
      action: 'Open the attention queue and resolve the oldest item.',
      href: '/dashboard#attention',
    })
  }
  if (missingDocumentation > 0) {
    nudges.push({
      message: `${missingDocumentation} record${missingDocumentation === 1 ? '' : 's'} need supporting documents.`,
      action: 'Upload one receipt or bill document.',
      href: '/documents',
    })
  }
  const oldInbox = inboxItems.filter(item =>
    item.state === 'inbox' && differenceInCalendarDays(new Date(), new Date(item.created_at)) > 7
  ).length
  if (oldInbox > 0) {
    nudges.push({
      message: `${oldInbox} inbox item${oldInbox === 1 ? ' has' : 's have'} waited more than a week.`,
      action: 'Process the oldest inbox item.',
      href: '/dashboard#inbox',
    })
  }
  if (recurringCostDelta > 0.01) {
    nudges.push({
      message: `Tracked recurring cost is up $${recurringCostDelta.toFixed(2)} from last month.`,
      action: 'Review the newest recurring cost.',
      href: '/subscriptions',
    })
  }
  return nudges
}

export function isOccurrenceComplete(
  events: CompletionEvent[],
  itemType: CompletionEvent['item_type'],
  itemId: string,
  occurrenceDate: string,
) {
  return events.some(event =>
    event.item_type === itemType &&
    event.item_id === itemId &&
    isSameDay(asLocalDate(event.occurrence_date), asLocalDate(occurrenceDate))
  )
}
