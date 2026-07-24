import { createClient } from '@/lib/supabase/server'
import { BillsClient } from './BillsClient'

export default async function BillsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const [billResult, activityResult] = await Promise.all([
    supabase
      .from('bills')
      .select('*')
      .eq('user_id', user!.id)
      .order('due_date'),
    supabase
      .from('item_activity_events')
      .select('*')
      .eq('user_id', user!.id)
      .eq('item_type', 'bill')
      .eq('event_type', 'postponed')
      .order('created_at', { ascending: false }),
  ])

  return <BillsClient initialData={billResult.data || []} initialActivityEvents={activityResult.data || []} userId={user!.id} />
}
