'use client'
import dynamic from 'next/dynamic'

const HeroShaderScene = dynamic(
  () => import('./HeroShaderScene').then(m => m.HeroShaderScene),
  { ssr: false, loading: () => null }
)

export function HeroCanvas() {
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
      <HeroShaderScene />
    </div>
  )
}
