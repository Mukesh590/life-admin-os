'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={{ opacity: 0, clipPath: 'inset(0 100% 0 0)' }}
        animate={{ opacity: 1, clipPath: 'inset(0 0% 0 0)' }}
        exit={{ opacity: 0, clipPath: 'inset(0 0 0 100%)' }}
        transition={{ duration: 0.28, ease: [0.76, 0, 0.24, 1] }}
        style={{ willChange: 'clip-path, opacity' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
