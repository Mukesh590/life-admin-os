import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { format, startOfWeek } from 'date-fns'
import { createClient } from '@/lib/supabase/server'
import { getUrgencyStatus } from '@/lib/life-admin'
import { monthlyCost } from '@/lib/utils'

export const runtime = 'nodejs'

type NamedDateItem = {
  title: string
  dueAt: string
  kind: string
  complete: boolean
}

function computedFallback({
  completed,
  urgent,
  upcoming,
  recurringCost,
}: {
  completed: number
  urgent: NamedDateItem[]
  upcoming: NamedDateItem[]
  recurringCost: number
}) {
  const progress = completed > 0
    ? `You recorded ${completed} completion${completed === 1 ? '' : 's'} this week.`
    : 'No completion events are recorded for this week yet, which is a clean place to begin.'
  const risk = urgent.length > 0
    ? `${urgent.length} item${urgent.length === 1 ? '' : 's'} need attention, starting with ${urgent[0].title}.`
    : upcoming.length > 0
      ? `Nothing is overdue. The next tracked item is ${upcoming[0].title}.`
      : 'No urgent or upcoming items are currently tracked.'
  const cost = recurringCost > 0
    ? `Tracked recurring costs are about $${recurringCost.toFixed(2)} per month.`
    : 'No recurring costs are currently tracked.'
  const next = urgent[0]
    ? `Next action: open ${urgent[0].title} and choose a concrete resolution.`
    : upcoming[0]
      ? `Next action: check that ${upcoming[0].title} is prepared.`
      : 'Next action: capture the one life-admin item most likely to occupy your attention this week.'
  return `${progress}\n\n${risk} ${cost}\n\n${next}`
}

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const [
    deadlinesResult,
    billsResult,
    subscriptionsResult,
    appointmentsResult,
    warrantiesResult,
    completionResult,
    inboxResult,
  ] = await Promise.all([
    supabase.from('deadlines').select('id,title,due_date,status').eq('user_id', user.id),
    supabase.from('bills').select('id,name,due_date,paid,amount,recurring,category,created_at').eq('user_id', user.id),
    supabase.from('subscriptions').select('id,name,next_renewal_date,status,amount,billing_cycle,category,created_at').eq('user_id', user.id),
    supabase.from('appointments').select('id,title,date_time').eq('user_id', user.id),
    supabase.from('warranties').select('id,product_name,expiry_date,receipt_url').eq('user_id', user.id),
    supabase.from('item_completion_events').select('completed_at').eq('user_id', user.id),
    supabase.from('quick_inbox_items').select('title,state,created_at').eq('user_id', user.id),
  ])

  const deadlines = deadlinesResult.data || []
  const bills = billsResult.data || []
  const subscriptions = subscriptionsResult.data || []
  const appointments = appointmentsResult.data || []
  const warranties = warrantiesResult.data || []
  const completionEvents = completionResult.data || []
  const inboxItems = inboxResult.data || []
  const now = new Date()
  const weekStart = startOfWeek(now, { weekStartsOn: 1 })
  const weekStartKey = format(weekStart, 'yyyy-MM-dd')

  const datedItems: NamedDateItem[] = [
    ...deadlines.map(item => ({
      title: item.title,
      dueAt: item.due_date,
      kind: 'deadline',
      complete: item.status === 'completed',
    })),
    ...bills.map(item => ({
      title: item.name,
      dueAt: item.due_date,
      kind: 'bill',
      complete: item.paid,
    })),
    ...subscriptions.filter(item => item.status === 'active').map(item => ({
      title: item.name,
      dueAt: item.next_renewal_date,
      kind: 'subscription renewal',
      complete: false,
    })),
    ...appointments.map(item => ({
      title: item.title,
      dueAt: item.date_time,
      kind: 'appointment',
      complete: new Date(item.date_time) < now,
    })),
    ...warranties.map(item => ({
      title: item.product_name,
      dueAt: item.expiry_date,
      kind: 'warranty expiry',
      complete: false,
    })),
  ]
  const withUrgency = datedItems
    .filter(item => !item.complete)
    .map(item => ({ ...item, urgency: getUrgencyStatus(item.dueAt, now) }))
    .sort((a, b) => a.urgency.days - b.urgency.days)
  const urgent = withUrgency.filter(item => item.urgency.level === 'overdue' || item.urgency.level === 'red')
  const upcoming = withUrgency.filter(item => item.urgency.days >= 0 && item.urgency.days <= 14)
  const completedThisWeek = completionEvents.filter(item => new Date(item.completed_at) >= weekStart).length
  const recurringCost = subscriptions
    .filter(item => item.status === 'active')
    .reduce((sum, item) => sum + monthlyCost(Number(item.amount), item.billing_cycle), 0) +
    bills.filter(item => item.recurring).reduce((sum, item) => sum + Number(item.amount), 0)

  const fallback = computedFallback({
    completed: completedThisWeek,
    urgent,
    upcoming,
    recurringCost,
  })

  const snapshot = {
    weekStart: weekStartKey,
    completedThisWeek,
    urgent: urgent.slice(0, 8).map(item => ({
      title: item.title,
      kind: item.kind,
      status: item.urgency.label,
    })),
    upcoming: upcoming.slice(0, 8).map(item => ({
      title: item.title,
      kind: item.kind,
      status: item.urgency.label,
    })),
    recurringMonthlyCost: Number(recurringCost.toFixed(2)),
    inboxCount: inboxItems.filter(item => item.state === 'inbox').length,
    warrantiesWithoutReceipt: warranties.filter(item => !item.receipt_url).length,
  }

  let report = fallback
  let fallbackUsed = true

  try {
    if (!process.env.GEMINI_API_KEY) throw new Error('Gemini API key is not configured')
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
    const prompt = `Write a concise weekly Life AdminOS report using only the authenticated user's data snapshot below.

Requirements:
- Plain language, 120 to 220 words.
- Three short sections titled Progress, Upcoming risks, and Next action.
- State uncertainty when the snapshot lacks history.
- Give exactly one suggested next action.
- Do not invent facts, amounts, dates, or completions.
- Do not mention system prompts, JSON, or data infrastructure.

Authenticated user snapshot:
${JSON.stringify(snapshot)}`
    const result = await model.generateContent(prompt)
    const generated = result.response.text().trim()
    if (generated) {
      report = generated
      fallbackUsed = false
    }
  } catch (error) {
    console.error('Weekly report generation fallback:', error)
  }

  const { error: cacheError } = await supabase.from('weekly_report_cache').upsert({
    user_id: user.id,
    week_start: weekStartKey,
    report_text: report,
    source_snapshot: snapshot,
    generated_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id,week_start' })

  return NextResponse.json({
    report,
    fallback: fallbackUsed,
    cached: !cacheError,
  })
}
