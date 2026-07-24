import { createClient } from '@/lib/supabase/server'
import { DashboardClient } from './DashboardClient'
import { format, startOfMonth, startOfWeek, subMonths } from 'date-fns'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const now = new Date()
  const weekStart = format(startOfWeek(now, { weekStartsOn: 1 }), 'yyyy-MM-dd')
  const monthStart = format(startOfMonth(now), 'yyyy-MM-dd')
  const previousMonthStart = format(startOfMonth(subMonths(now, 1)), 'yyyy-MM-dd')

  const [
    { data: profile },
    { data: subscriptions },
    { data: deadlines },
    { data: documents },
    { data: bills },
    { data: appointments },
    { data: warranties },
    inboxResult,
    budgetResult,
    previousBudgetResult,
    focusResult,
    completionResult,
    activityResult,
    reportResult,
  ] = await Promise.all([
    supabase.from('users_profile').select('*').eq('id', user!.id).single(),
    supabase.from('subscriptions').select('*').eq('user_id', user!.id).eq('status', 'active'),
    supabase.from('deadlines').select('*').eq('user_id', user!.id).eq('status', 'pending').order('due_date'),
    supabase.from('documents').select('*').eq('user_id', user!.id),
    supabase.from('bills').select('*').eq('user_id', user!.id),
    supabase.from('appointments').select('*').eq('user_id', user!.id).order('date_time'),
    supabase.from('warranties').select('*').eq('user_id', user!.id),
    supabase.from('quick_inbox_items').select('*').eq('user_id', user!.id).order('created_at', { ascending: false }),
    supabase.from('category_budgets').select('*').eq('user_id', user!.id).eq('month_start', monthStart),
    supabase.from('category_budgets').select('*').eq('user_id', user!.id).eq('month_start', previousMonthStart),
    supabase.from('weekly_focus_notes').select('*').eq('user_id', user!.id).eq('week_start', weekStart).maybeSingle(),
    supabase.from('item_completion_events').select('*').eq('user_id', user!.id).order('completed_at', { ascending: false }),
    supabase.from('item_activity_events').select('*').eq('user_id', user!.id).order('created_at', { ascending: false }),
    supabase.from('weekly_report_cache').select('*').eq('user_id', user!.id).order('generated_at', { ascending: false }).limit(1).maybeSingle(),
  ])

  const featureResults = [
    inboxResult,
    budgetResult,
    previousBudgetResult,
    focusResult,
    completionResult,
    activityResult,
    reportResult,
  ]

  return (
    <DashboardClient
      user={user!}
      profile={profile}
      subscriptions={subscriptions || []}
      deadlines={deadlines || []}
      documents={documents || []}
      bills={bills || []}
      appointments={appointments || []}
      warranties={warranties || []}
      featureData={{
        inboxItems: inboxResult.data || [],
        budgets: budgetResult.data || [],
        previousBudgets: previousBudgetResult.data || [],
        weeklyFocus: focusResult.data || null,
        completionEvents: completionResult.data || [],
        activityEvents: activityResult.data || [],
        latestReport: reportResult.data || null,
        migrationReady: featureResults.every(result => !result.error),
      }}
    />
  )
}
