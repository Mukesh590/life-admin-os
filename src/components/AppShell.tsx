'use client'
import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { Preloader } from '@/components/animations/Preloader'

const AUTH_ROUTES = ['/login', '/signup', '/reset-password']

// Native OS scrolling and the native cursor are used everywhere in this app —
// no custom cursor, no Lenis/scroll-smoothing anywhere, including the
// authenticated dashboard (redesign v2, global rule). The dark preloader
// belongs to the dashboard's warm-glass theme only — it must not flash in
// ahead of the light landing page or the light auth shell.
export function AppShell({ children }: { children: React.ReactNode }) {
  const [loaded, setLoaded] = useState(false)
  const pathname = usePathname()
  const isLandingPage = pathname === '/'
  const isAuthPage = AUTH_ROUTES.some(route => pathname?.startsWith(route))
  const skipPreloader = isLandingPage || isAuthPage

  return (
    <>
      {!skipPreloader && !loaded && <Preloader onComplete={() => setLoaded(true)} />}
      <div style={{ opacity: skipPreloader || loaded ? 1 : 0, transition: 'opacity 0.5s ease' }}>
        {children}
      </div>
    </>
  )
}
