'use client'
import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

export function CustomCursor() {
  const outerRef = useRef<HTMLDivElement>(null)
  const dotRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.matchMedia('(pointer: coarse)').matches) return

    document.documentElement.style.cursor = 'none'

    const outer = outerRef.current
    const dot = dotRef.current
    if (!outer || !dot) return

    let mx = window.innerWidth / 2
    let my = window.innerHeight / 2
    let cx = mx
    let cy = my
    let rafId: number

    const onMove = (e: MouseEvent) => {
      mx = e.clientX
      my = e.clientY
      gsap.set(dot, { x: mx - 3, y: my - 3 })
    }

    const loop = () => {
      cx += (mx - cx) * 0.08
      cy += (my - cy) * 0.08
      gsap.set(outer, { x: cx - 20, y: cy - 20 })
      rafId = requestAnimationFrame(loop)
    }
    rafId = requestAnimationFrame(loop)

    const onEnter = () => {
      gsap.to(outer, {
        width: 64,
        height: 64,
        x: cx - 32,
        y: cy - 32,
        backgroundColor: '#ffffff',
        mixBlendMode: 'exclusion',
        borderWidth: 0,
        duration: 0.3,
        ease: 'power2.out',
      })
    }

    const onLeave = () => {
      gsap.to(outer, {
        width: 40,
        height: 40,
        backgroundColor: 'transparent',
        mixBlendMode: 'normal',
        borderWidth: 1.5,
        duration: 0.3,
        ease: 'power2.out',
      })
    }

    const onClick = () => {
      gsap.to(outer, { scale: 0.75, duration: 0.1, yoyo: true, repeat: 1, ease: 'power2.inOut' })
    }

    const interactiveEls = document.querySelectorAll('a, button')
    window.addEventListener('mousemove', onMove)
    window.addEventListener('click', onClick)
    interactiveEls.forEach(el => {
      el.addEventListener('mouseenter', onEnter)
      el.addEventListener('mouseleave', onLeave)
    })

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('click', onClick)
      interactiveEls.forEach(el => {
        el.removeEventListener('mouseenter', onEnter)
        el.removeEventListener('mouseleave', onLeave)
      })
      document.documentElement.style.cursor = ''
    }
  }, [])

  return (
    <>
      <div
        ref={outerRef}
        className="custom-cursor"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: 40,
          height: 40,
          border: '1.5px solid rgba(99,102,241,0.7)',
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: 99999,
          willChange: 'transform',
        }}
      />
      <div
        ref={dotRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: '#6366f1',
          pointerEvents: 'none',
          zIndex: 99999,
          willChange: 'transform',
        }}
      />
    </>
  )
}
