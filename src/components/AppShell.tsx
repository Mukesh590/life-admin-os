'use client'
import { useState } from 'react'
import { LenisProvider } from '@/components/animations/LenisProvider'
import { CustomCursor } from '@/components/animations/CustomCursor'
import { Preloader } from '@/components/animations/Preloader'

export function AppShell({ children }: { children: React.ReactNode }) {
  const [loaded, setLoaded] = useState(false)

  return (
    <LenisProvider>
      <CustomCursor />
      {!loaded && <Preloader onComplete={() => setLoaded(true)} />}
      <div style={{ opacity: loaded ? 1 : 0, transition: 'opacity 0.5s ease' }}>
        {children}
      </div>
    </LenisProvider>
  )
}
