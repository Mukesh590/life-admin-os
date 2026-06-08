'use client'
import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

export function Preloader({ onComplete }: { onComplete: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)
  const fillRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    const progress = progressRef.current
    const fill = fillRef.current
    if (!container || !progress || !fill) return

    const chars = container.querySelectorAll<HTMLElement>('.pl-char')
    const label = container.querySelector<HTMLElement>('.pl-label')

    const tl = gsap.timeline()

    gsap.set(chars, {
      y: () => gsap.utils.random(-60, 60),
      x: () => gsap.utils.random(-60, 60),
      opacity: 0,
      scale: 0.4,
      rotationZ: () => gsap.utils.random(-20, 20),
    })
    gsap.set(label, { opacity: 0, y: 10 })

    tl
      .to(chars, {
        y: 0,
        x: 0,
        opacity: 1,
        scale: 1,
        rotationZ: 0,
        duration: 0.75,
        stagger: 0.055,
        ease: 'back.out(2.2)',
      })
      .to(fill, {
        scaleX: 1,
        duration: 1.1,
        ease: 'power3.inOut',
      }, 0.15)
      .to(label, {
        opacity: 1,
        y: 0,
        duration: 0.3,
        ease: 'power2.out',
      }, 0.9)
      .to({}, { duration: 0.35 })
      .to(container, {
        clipPath: 'inset(0 0 100% 0)',
        duration: 0.65,
        ease: 'power4.inOut',
        onComplete,
      })

    return () => { tl.kill() }
  }, [onComplete])

  const word1 = 'Admin'
  const word2 = 'OS'

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99998,
        background: '#04040a',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        clipPath: 'inset(0 0 0% 0)',
        overflow: 'hidden',
      }}
    >
      {/* Ambient glow behind text */}
      <div style={{
        position: 'absolute',
        width: 400,
        height: 200,
        borderRadius: '50%',
        background: 'radial-gradient(ellipse at center, rgba(91,94,244,0.18) 0%, transparent 70%)',
        filter: 'blur(30px)',
        pointerEvents: 'none',
      }} />

      {/* Main wordmark */}
      <div style={{ display: 'flex', alignItems: 'baseline', position: 'relative' }}>
        {word1.split('').map((c, i) => (
          <span
            key={i}
            className="pl-char"
            style={{
              display: 'inline-block',
              fontFamily: 'var(--font-display, Syne, sans-serif)',
              fontSize: 'clamp(56px, 10vw, 88px)',
              fontWeight: 800,
              color: '#e8e8f0',
              letterSpacing: '-0.04em',
              lineHeight: 1,
            }}
          >
            {c}
          </span>
        ))}
        {word2.split('').map((c, i) => (
          <span
            key={i + word1.length}
            className="pl-char"
            style={{
              display: 'inline-block',
              fontFamily: 'var(--font-display, Syne, sans-serif)',
              fontSize: 'clamp(56px, 10vw, 88px)',
              fontWeight: 800,
              background: 'linear-gradient(135deg, #818cf8, #6366f1)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              letterSpacing: '-0.04em',
              lineHeight: 1,
            }}
          >
            {c}
          </span>
        ))}
      </div>

      {/* Tagline */}
      <p
        className="pl-label"
        style={{
          marginTop: 12,
          fontFamily: 'var(--font-mono, JetBrains Mono, monospace)',
          fontSize: 11,
          color: 'rgba(255,255,255,0.25)',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
        }}
      >
        Your life. Organized.
      </p>

      {/* Progress bar */}
      <div
        ref={progressRef}
        style={{
          marginTop: 40,
          width: 180,
          height: 1.5,
          background: 'rgba(255,255,255,0.06)',
          borderRadius: 2,
          overflow: 'hidden',
        }}
      >
        <div
          ref={fillRef}
          style={{
            width: '100%',
            height: '100%',
            background: 'linear-gradient(90deg, #5b5ef4, #818cf8, #c084fc)',
            borderRadius: 2,
            transformOrigin: 'left',
            transform: 'scaleX(0)',
          }}
        />
      </div>
    </div>
  )
}
