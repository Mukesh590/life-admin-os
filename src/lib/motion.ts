// Shared motion language — one rhythm across the whole app.
// Consumed by Framer Motion (variants/transitions) and mirrored by CSS tokens in globals.css.
import type { Variants, Transition } from 'framer-motion'

type Bezier = [number, number, number, number]

/** Easing curves (cubic-bezier control points). `out` matches the existing dashboard reveal. */
export const ease = {
  out: [0.16, 1, 0.3, 1] as Bezier,
  inOut: [0.65, 0, 0.35, 1] as Bezier,
  in: [0.7, 0, 0.84, 0] as Bezier,
  soft: [0.25, 0.46, 0.45, 0.94] as Bezier,
}

export const duration = {
  fast: 0.2,
  base: 0.4,
  slow: 0.6,
  slower: 0.9,
}

export const spring = {
  /** Slide-in panels (matches the existing damping 28 / stiffness 280). */
  soft: { type: 'spring', stiffness: 280, damping: 28 } as Transition,
  snappy: { type: 'spring', stiffness: 400, damping: 30 } as Transition,
  gentle: { type: 'spring', stiffness: 120, damping: 20 } as Transition,
  /** Low-mass spring for magnetic cursor-follow. */
  magnetic: { type: 'spring', stiffness: 150, damping: 15, mass: 0.1 } as Transition,
}

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: duration.base, ease: ease.out } },
}

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: duration.base, ease: ease.out } },
}

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  show: { opacity: 1, scale: 1, transition: { duration: duration.base, ease: ease.out } },
}

/** Container that staggers its children. Pair with `fadeUp`/`scaleIn` items. */
export const staggerContainer = (stagger = 0.06, delayChildren = 0): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren: stagger, delayChildren } },
})

/** Index-delayed reveal — drop-in replacement for ad-hoc `stagger(i)` helpers. */
export const staggerItem = (i: number, step = 0.06): Variants => ({
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { delay: i * step, duration: duration.base, ease: ease.out },
  },
})

/** Right-hand slide-in form panel (matches the existing inner-page panels). */
export const slideInPanel: Variants = {
  hidden: { x: '100%' },
  show: { x: 0, transition: spring.soft },
  exit: { x: '100%', transition: { duration: duration.fast, ease: ease.in } },
}

/** Backdrop fade for modals/panels. */
export const backdrop: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: duration.fast } },
  exit: { opacity: 0, transition: { duration: duration.fast } },
}

/** whileInView viewport preset — reveal once, when 30% visible. */
export const inViewport = { once: true, amount: 0.3 } as const
