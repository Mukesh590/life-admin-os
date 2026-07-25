'use client'
import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { Preloader } from '@/components/animations/Preloader'

// Native OS scrolling and the native cursor are used everywhere in this app —
// no custom cursor, no Lenis/scroll-smoothing anywhere, including the
// authenticated dashboard (redesign v2, global rule). The dashboard keeps a
// brief preloader on first mount only; it does not block interaction once
// content is ready.
export function AppShell({ children }: { children: React.ReactNode }) {
  const [loaded, setLoaded] = useState(false)
  const pathname = usePathname()
  const isLandingPage = pathname === '/'

  return (
    <>
      {!isLandingPage && !loaded && <Preloader onComplete={() => setLoaded(true)} />}
      <div style={{ opacity: isLandingPage || loaded ? 1 : 0, transition: 'opacity 0.5s ease' }}>
        {children}
      </div>
    </>
  )
}
