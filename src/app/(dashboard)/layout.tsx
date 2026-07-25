import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/layout/Sidebar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="relative min-h-screen">
      {/* Warm interior environment — full-viewport, fixed so it never
          re-paints on scroll (no `background-attachment: fixed`, which is
          unreliable on mobile Safari). */}
      <div className="fixed inset-0 -z-10" aria-hidden="true">
        <Image
          src="/media/dashboard/dashboard-environment.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0" style={{ background: 'rgba(24,21,18,0.55)' }} />
      </div>

      <Sidebar />

      <main id="main-content" className="pt-14 pb-20 lg:pt-6 lg:pb-6 lg:pl-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          {children}
        </div>
      </main>
    </div>
  )
}
