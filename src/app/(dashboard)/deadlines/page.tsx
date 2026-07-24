import { createClient } from '@/lib/supabase/server'
import { DeadlinesClient } from './DeadlinesClient'

export default async function DeadlinesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const [deadlineResult, activityResult] = await Promise.all([
    supabase
      .from('deadlines')
      .select('*')
      .eq('user_id', user!.id)
      .order('due_date'),
    supabase
      .from('item_activity_events')
      .select('*')
      .eq('user_id', user!.id)
      .eq('item_type', 'deadline')
      .order('created_at', { ascending: false }),
  ])

  return (
    <DeadlinesClient
      initialData={deadlineResult.data || []}
      initialActivityEvents={activityResult.data || []}
      featureStorageReady={!activityResult.error}
      userId={user!.id}
    />
  )
}
