'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'

// Floating-window auth shell (redesign v2) — modeled on
// design-auth-floating-window.jpeg's geometry only (panel proportions,
// corner radius, shadow depth, floating icon tile), not its product,
// branding or copy. Shares the landing page's light token system
// (`.landing-root` — CONTEXT-MASTER Section 7) rather than redefining a
// third palette.
export function AuthShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const reduceMotion = useReducedMotion()

  return (
    <div className="landing-root relative min-h-[100dvh] flex items-center justify-center overflow-hidden px-4 py-10 sm:py-16">
      {/* Textured gray page background, independent of the cream window */}
      <div className="absolute inset-0 bg-[#d7d7d4]" aria-hidden="true" />
      <div
        className="absolute inset-0 opacity-[0.06] mix-blend-overlay"
        aria-hidden="true"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          backgroundRepeat: 'repeat',
          backgroundSize: '200px 200px',
        }}
      />

      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-[1040px]"
      >
        {/* Floating icon tile */}
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 14 }}
          animate={
            reduceMotion
              ? { opacity: 1, y: 0 }
              : { opacity: 1, y: [0, -5, 0] }
          }
          transition={
            reduceMotion
              ? { duration: 0.5, delay: 0.25 }
              : {
                  opacity: { duration: 0.5, delay: 0.35 },
                  y: { duration: 4.5, delay: 0.35, repeat: Infinity, ease: 'easeInOut' },
                }
          }
          className="relative z-20 mx-auto -mb-6 w-16 h-16 rounded-2xl bg-[#f8fbf8] border border-black/[0.06] shadow-[0_18px_40px_-14px_rgba(20,18,14,0.35)] flex items-center justify-center"
        >
          <span className="w-6 h-6 rounded-full bg-[var(--accent)]" />
          <span className="absolute inset-2 rounded-xl border border-[var(--accent)]/25" aria-hidden="true" />
        </motion.div>

        <div className="rounded-[32px] bg-[#f8fbf8] border border-black/[0.07] shadow-[0_50px_140px_-30px_rgba(20,18,14,0.45)] overflow-hidden">
          {/* Top bar */}
          <div className="flex items-end justify-between px-6 sm:px-8 pt-6 pb-2.5 border-b border-[var(--line)]">
            <span className="font-landing-display font-semibold text-sm tracking-tight text-[var(--ink)]">
              Life AdminOS
            </span>
            <span className="hidden sm:block text-[11px] uppercase tracking-[0.08em] text-[var(--ink)]/50">
              Private by design
            </span>
            <Link
              href="/"
              className="text-xs text-[var(--ink)]/60 hover:text-[var(--ink)] transition-colors"
            >
              Back home
            </Link>
          </div>

          <div className="grid md:grid-cols-[45%_55%]">
            {/* Visual side */}
            <div className="relative h-28 md:h-auto order-1 md:order-none overflow-hidden bg-[var(--canvas-alt)]">
              <video
                className="absolute inset-0 w-full h-full object-cover"
                src="/media/landing/system-core-loop.mp4"
                poster="/media/landing/system-core-poster.png"
                muted
                autoPlay
                loop
                playsInline
                preload="metadata"
                aria-hidden="true"
              />
              <div
                className="absolute inset-0"
                style={{ background: 'linear-gradient(180deg, rgba(251,247,239,0) 40%, rgba(20,18,14,0.28) 100%)' }}
                aria-hidden="true"
              />
            </div>

            {/* Form side */}
            <div id="main-content" className="px-6 py-8 sm:px-10 sm:py-12 flex items-center">
              <div className="w-full">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={pathname}
                    initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={reduceMotion ? { opacity: 1 } : { opacity: 0, y: -10 }}
                    transition={{ duration: 0.32, ease: [0.4, 0, 0.2, 1] }}
                  >
                    {children}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
