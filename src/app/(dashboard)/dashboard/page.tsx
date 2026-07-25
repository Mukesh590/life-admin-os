import { createClient } from '@/lib/supabase/server'
import { format, startOfMonth, startOfWeek, subMonths } from 'date-fns'
import { DashboardClient } from './DashboardClient'
import { SubscriptionsClient } from '../subscriptions/SubscriptionsClient'
import { DeadlinesClient } from '../deadlines/DeadlinesClient'
import { DocumentsClient } from '../documents/DocumentsClient'
import { BillsClient } from '../bills/BillsClient'
import { AppointmentsClient } from '../appointments/AppointmentsClient'
import { WarrantiesClient } from '../warranties/WarrantiesClient'
import { SettingsClient } from '../settings/SettingsClient'

// Continuous single-page dashboard (redesign v2). Every section's data is
// fetched here, once, with the exact same queries each section's original
// standalone route used — so every *Client component receives identical
// props to before and its CRUD behavior is unchanged; only the page they're
// mounted on is now shared instead of per-route.
export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const now = new Date()
  const weekStart = format(startOfWeek(now, { weekStartsOn: 1 }), 'yyyy-MM-dd')
  const monthStart = format(startOfMonth(now), 'yyyy-MM-dd')
  const previousMonthStart = format(startOfMonth(subMonths(now, 1)), 'yyyy-MM-dd')

  const [
    { data: profile },
    { data: overviewSubscriptions },
    { data: overviewDeadlines },
    { data: overviewDocuments },
    { data: overviewBills },
    { data: overviewAppointments },
    { data: overviewWarranties },
    inboxResult,
    budgetResult,
    previousBudgetResult,
    focusResult,
    completionResult,
    activityResult,
    reportResult,
    allSubscriptionsResult,
    allDeadlinesResult,
    deadlineActivityResult,
    allDocumentsResult,
    allBillsResult,
    billActivityResult,
    allAppointmentsResult,
    allWarrantiesResult,
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
    supabase.from('subscriptions').select('*').eq('user_id', user!.id).order('next_renewal_date'),
    supabase.from('deadlines').select('*').eq('user_id', user!.id).order('due_date'),
    supabase.from('item_activity_events').select('*').eq('user_id', user!.id).eq('item_type', 'deadline').order('created_at', { ascending: false }),
    supabase.from('documents').select('*').eq('user_id', user!.id).order('created_at', { ascending: false }),
    supabase.from('bills').select('*').eq('user_id', user!.id).order('due_date'),
    supabase.from('item_activity_events').select('*').eq('user_id', user!.id).eq('item_type', 'bill').eq('event_type', 'postponed').order('created_at', { ascending: false }),
    supabase.from('appointments').select('*').eq('user_id', user!.id).order('date_time'),
    supabase.from('warranties').select('*').eq('user_id', user!.id).order('expiry_date'),
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
    <div className="space-y-16 lg:space-y-20 py-4">
      <section id="overview" className="scroll-mt-24 lg:scroll-mt-8">
        <DashboardClient
          user={user!}
          profile={profile}
          subscriptions={overviewSubscriptions || []}
          deadlines={overviewDeadlines || []}
          documents={overviewDocuments || []}
          bills={overviewBills || []}
          appointments={overviewAppointments || []}
          warranties={overviewWarranties || []}
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
      </section>

      <section id="subscriptions" className="scroll-mt-24 lg:scroll-mt-8">
        <SubscriptionsClient initialData={allSubscriptionsResult.data || []} userId={user!.id} />
      </section>

      <section id="deadlines" className="scroll-mt-24 lg:scroll-mt-8">
        <DeadlinesClient
          initialData={allDeadlinesResult.data || []}
          initialActivityEvents={deadlineActivityResult.data || []}
          featureStorageReady={!deadlineActivityResult.error}
          userId={user!.id}
        />
      </section>

      <section id="documents" className="scroll-mt-24 lg:scroll-mt-8">
        <DocumentsClient initialData={allDocumentsResult.data || []} userId={user!.id} />
      </section>

      <section id="bills" className="scroll-mt-24 lg:scroll-mt-8">
        <BillsClient
          initialData={allBillsResult.data || []}
          initialActivityEvents={billActivityResult.data || []}
          userId={user!.id}
        />
      </section>

      <section id="appointments" className="scroll-mt-24 lg:scroll-mt-8">
        <AppointmentsClient initialData={allAppointmentsResult.data || []} userId={user!.id} />
      </section>

      <section id="warranties" className="scroll-mt-24 lg:scroll-mt-8">
        <WarrantiesClient initialData={allWarrantiesResult.data || []} userId={user!.id} />
      </section>

      <section id="settings" className="scroll-mt-24 lg:scroll-mt-8">
        <SettingsClient user={user!} profile={profile} />
      </section>
    </div>
  )
}
