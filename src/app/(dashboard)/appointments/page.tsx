import { createClient } from '@/lib/supabase/server'
import { AppointmentsClient } from './AppointmentsClient'

export default async function AppointmentsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: appointments } = await supabase
    .from('appointments')
    .select('*')
    .eq('user_id', user!.id)
    .order('date_time')

  return <AppointmentsClient initialData={appointments || []} userId={user!.id} />
}
