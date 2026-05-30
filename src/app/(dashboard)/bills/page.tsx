import { createClient } from '@/lib/supabase/server'
import { BillsClient } from './BillsClient'

export default async function BillsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: bills } = await supabase
    .from('bills')
    .select('*')
    .eq('user_id', user!.id)
    .order('due_date')

  return <BillsClient initialData={bills || []} userId={user!.id} />
}
