import { createClient } from '@/lib/supabase/server'
import { SubscriptionsClient } from './SubscriptionsClient'

export default async function SubscriptionsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: subscriptions } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user!.id)
    .order('next_renewal_date')

  return <SubscriptionsClient initialData={subscriptions || []} userId={user!.id} />
}
