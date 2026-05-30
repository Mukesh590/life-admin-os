import { createClient } from '@/lib/supabase/server'
import { WarrantiesClient } from './WarrantiesClient'

export default async function WarrantiesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: warranties } = await supabase
    .from('warranties')
    .select('*')
    .eq('user_id', user!.id)
    .order('expiry_date')

  return <WarrantiesClient initialData={warranties || []} userId={user!.id} />
}
