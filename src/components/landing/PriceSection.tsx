'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

export function PriceSection() {
  return (
    <section className="bg-[var(--canvas)] px-6 py-24 md:py-32">
      <div className="mx-auto max-w-2xl text-center">
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="font-landing-display font-bold text-[clamp(2.5rem,7vw,4.5rem)] leading-none tracking-tight text-[var(--ink)] mb-6"
        >
          $0. That&apos;s the price.
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5, delay: 0.06, ease: [0.16, 1, 0.3, 1] }}
          className="text-[15px] md:text-lg leading-relaxed text-[var(--ink)]/70 mb-10"
        >
          Everything above — all six pillars, the AI reader, the weekly reports, the streaks, the entire intelligence layer — free. No credit card. No trial countdown. No &ldquo;premium&rdquo; wall three clicks in. You get the whole system, because a system that guards your money shouldn&apos;t cost you money.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        >
          <Link
            href="/signup"
            className="inline-flex items-center justify-center px-8 py-4 rounded-full bg-[var(--accent)] text-white font-semibold text-[15px] hover:brightness-95 transition-[filter]"
          >
            Get started free
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
