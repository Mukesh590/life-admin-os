import { createClient } from '@/lib/supabase/server'
import { DeadlinesClient } from './DeadlinesClient'

export default async function DeadlinesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: deadlines } = await supabase
    .from('deadlines')
    .select('*')
    .eq('user_id', user!.id)
    .order('due_date')

  return <DeadlinesClient initialData={deadlines || []} userId={user!.id} />
}
