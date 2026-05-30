'use client'
import { useEffect, useRef } from 'react'

// Render at 1/12 scale — bilinear upscale gives smooth fluid look
const RW = 160
const RH = 90

function fract(x: number) { return x - Math.floor(x) }
function clamp(x: number, lo: number, hi: number) { return x < lo ? lo : x > hi ? hi : x }
function mix(a: number, b: number, t: number) { return a + (b - a) * t }

function hash(px: number, py: number): number {
  const x = fract(px * 234.34)
  const y = fract(py * 435.345)
  const d = x * (x + 34.23) + y * (y + 34.23)
  return fract((x + d) * (y + d))
}

function noise(px: number, py: number): number {
  const ix = Math.floor(px), iy = Math.floor(py)
  let fx = px - ix, fy = py - iy
  fx = fx * fx * (3 - 2 * fx)
  fy = fy * fy * (3 - 2 * fy)
  return mix(
    mix(hash(ix, iy),     hash(ix + 1, iy),     fx),
    mix(hash(ix, iy + 1), hash(ix + 1, iy + 1), fx),
    fy,
  )
}

function fbm(px: number, py: number): number {
  let v = 0, a = 0.5
  for (let i = 0; i < 5; i++) {
    v += a * noise(px, py)
    px = px * 2.1 + 100
    py = py * 2.1 + 100
    a *= 0.5
  }
  return v
}

export function HeroShaderScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const off = document.createElement('canvas')
    off.width = RW
    off.height = RH
    const offCtx = off.getContext('2d')!
    const img = offCtx.createImageData(RW, RH)
    const buf = img.data

    const resize = () => {
      canvas.width = canvas.clientWidth || window.innerWidth
      canvas.height = canvas.clientHeight || window.innerHeight
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    let mx = 0.5, my = 0.5, tmx = 0.5, tmy = 0.5
    const onMove = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect()
      tmx = (e.clientX - r.left) / r.width
      tmy = 1 - (e.clientY - r.top) / r.height
    }
    window.addEventListener('mousemove', onMove)

    const t0 = performance.now()
    let rafId: number

    const tick = () => {
      rafId = requestAnimationFrame(tick)

      // Mirror GLSL: t = uTime * 0.1
      const t = (performance.now() - t0) * 0.0001

      mx += (tmx - mx) * 0.04
      my += (tmy - my) * 0.04

      for (let j = 0; j < RH; j++) {
        const uvy = 1 - j / RH
        for (let i = 0; i < RW; i++) {
          const uvx = i / RW

          // Domain warp: q → r → f  (exact port of the GLSL)
          const qx = fbm(uvx + t * 0.1, uvy + t * 0.1)
          const qy = fbm(uvx + 1,       uvy + 1)

          const rx = fbm(uvx + 2 * qx + 1.7 + t * 0.12, uvy + 2 * qy + 9.2 + t * 0.12)
          const ry = fbm(uvx + 2 * qx + 8.3 + t * 0.08, uvy + 2 * qy + 2.8 + t * 0.08)

          let f = fbm(uvx + 2 * rx, uvy + 2 * ry)

          // Mouse reaction
          const dx = uvx - mx, dy = uvy - my
          const md = Math.sqrt(dx * dx + dy * dy)
          const ss = clamp((md - 0.35) / -0.35, 0, 1)
          f += ss * ss * (3 - 2 * ss) * 0.25

          // Color mixing — same palette as GLSL
          const ff = clamp(f * f * 3.5, 0, 1)
          let cr = mix(0.035, 0.12, ff)
          let cg = mix(0.035, 0.09, ff)
          let cb = mix(0.043, 0.22, ff)

          const ql = clamp(Math.sqrt(qx * qx + qy * qy) * 0.7, 0, 1)
          cr = mix(cr, 0.22, ql)
          cg = mix(cg, 0.19, ql)
          cb = mix(cb, 0.52, ql)

          const rr = clamp(rx * ry * 2, 0, 1)
          cr = mix(cr, 0.08, rr)
          cg = mix(cg, 0.06, rr)
          cb = mix(cb, 0.18, rr)

          // Vignette
          const vx = (uvx - 0.5) * 1.3
          const vy = (uvy - 0.5) * 1.3
          const vig = clamp(1 - (vx * vx + vy * vy), 0, 1)
          cr *= vig; cg *= vig; cb *= vig

          const idx = (j * RW + i) * 4
          buf[idx]     = (cr * 255 + 0.5) | 0
          buf[idx + 1] = (cg * 255 + 0.5) | 0
          buf[idx + 2] = (cb * 255 + 0.5) | 0
          buf[idx + 3] = 255
        }
      }

      offCtx.putImageData(img, 0, 0)
      ctx.drawImage(off, 0, 0, canvas.width, canvas.height)
    }

    tick()

    return () => {
      cancelAnimationFrame(rafId)
      ro.disconnect()
      window.removeEventListener('mousemove', onMove)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{ width: '100%', height: '100%', display: 'block' }}
    />
  )
}
