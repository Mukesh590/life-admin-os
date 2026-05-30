import { createClient } from '@/lib/supabase/server'
import { DashboardClient } from './DashboardClient'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [
    { data: profile },
    { data: subscriptions },
    { data: deadlines },
    { data: documents },
    { data: bills },
    { data: appointments },
    { data: warranties },
  ] = await Promise.all([
    supabase.from('users_profile').select('*').eq('id', user!.id).single(),
    supabase.from('subscriptions').select('*').eq('user_id', user!.id).eq('status', 'active'),
    supabase.from('deadlines').select('*').eq('user_id', user!.id).eq('status', 'pending').order('due_date'),
    supabase.from('documents').select('*').eq('user_id', user!.id),
    supabase.from('bills').select('*').eq('user_id', user!.id).eq('paid', false),
    supabase.from('appointments').select('*').eq('user_id', user!.id).order('date_time'),
    supabase.from('warranties').select('*').eq('user_id', user!.id),
  ])

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
    />
  )
}
