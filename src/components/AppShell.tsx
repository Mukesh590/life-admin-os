'use client'
import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { LenisProvider } from '@/components/animations/LenisProvider'
import { CustomCursor } from '@/components/animations/CustomCursor'
import { Preloader } from '@/components/animations/Preloader'

// The landing page ('/') is a light-themed rebuild with its own entrance
// sequence and default system cursor — the dark preloader and custom cursor
// belong to the dashboard's Obsidian Glass theme and would show a dark flash
// / hidden cursor on the light page if mounted there. Lenis is likewise
// dashboard-only (CONTEXT-MASTER Section 12 / landing motion spec — native
// scroll is the locked default for the landing page, and GSAP ScrollTrigger
// alone drives the hero scroll-dive).
export function AppShell({ children }: { children: React.ReactNode }) {
  const [loaded, setLoaded] = useState(false)
  const pathname = usePathname()
  const isLandingPage = pathname === '/'

  const content = (
    <>
      {!isLandingPage && <CustomCursor />}
      {!isLandingPage && !loaded && <Preloader onComplete={() => setLoaded(true)} />}
      <div style={{ opacity: isLandingPage || loaded ? 1 : 0, transition: 'opacity 0.5s ease' }}>
        {children}
      </div>
    </>
  )

  if (isLandingPage) return content

  return <LenisProvider>{content}</LenisProvider>
}
