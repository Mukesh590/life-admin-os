'use client'
import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

export function Preloader({ onComplete }: { onComplete: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    const progress = progressRef.current
    if (!container || !progress) return

    const chars = container.querySelectorAll('.preloader-char')

    const tl = gsap.timeline()

    gsap.set(chars, {
      y: () => gsap.utils.random(-80, 80),
      x: () => gsap.utils.random(-80, 80),
      opacity: 0,
      scale: 0.3,
    })

    tl.to(chars, {
      y: 0,
      x: 0,
      opacity: 1,
      scale: 1,
      duration: 0.7,
      stagger: 0.06,
      ease: 'back.out(2.5)',
    })
    .to(progress, {
      scaleX: 1,
      duration: 1.0,
      ease: 'power2.inOut',
    }, 0.2)
    .to({}, { duration: 0.3 })
    .to(container, {
      clipPath: 'inset(0 0 100% 0)',
      duration: 0.7,
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
        background: '#09090b',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        clipPath: 'inset(0 0 0% 0)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'baseline' }}>
        {word1.split('').map((c, i) => (
          <span
            key={i}
            className="preloader-char"
            style={{
              display: 'inline-block',
              fontSize: '80px',
              fontWeight: 900,
              color: '#fafafa',
              letterSpacing: '-0.03em',
              lineHeight: 1,
            }}
          >
            {c}
          </span>
        ))}
        {word2.split('').map((c, i) => (
          <span
            key={i + word1.length}
            className="preloader-char"
            style={{
              display: 'inline-block',
              fontSize: '80px',
              fontWeight: 900,
              color: '#6366f1',
              letterSpacing: '-0.03em',
              lineHeight: 1,
            }}
          >
            {c}
          </span>
        ))}
      </div>
      <div
        style={{
          marginTop: 32,
          width: 200,
          height: 2,
          background: 'rgba(255,255,255,0.08)',
          borderRadius: 2,
          overflow: 'hidden',
        }}
      >
        <div
          ref={progressRef}
          style={{
            width: '100%',
            height: '100%',
            background: 'linear-gradient(90deg, #6366f1, #a5b4fc)',
            borderRadius: 2,
            transformOrigin: 'left',
            transform: 'scaleX(0)',
          }}
        />
      </div>
    </div>
  )
}
