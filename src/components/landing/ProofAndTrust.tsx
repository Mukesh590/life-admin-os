'use client'

import { motion } from 'framer-motion'
import { Check } from 'lucide-react'

const CLAIMS = [
  'Free forever',
  'No bank connections',
  'No card numbers',
  'No SSNs',
  'Per-user database isolation',
  'CSV export',
  'Account deletion',
]

export function ProofAndTrust() {
  return (
    <section className="bg-[var(--canvas-alt)] px-6 py-20 md:py-28">
      <div className="mx-auto max-w-4xl text-center">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="text-[12px] font-semibold uppercase tracking-[0.1em] text-[var(--accent)] mb-6"
        >
          What&apos;s actually true
        </motion.p>
        <div className="flex flex-wrap justify-center gap-3">
          {CLAIMS.map((claim, i) => (
            <motion.span
              key={claim}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.4, delay: i * 0.04, ease: [0.16, 1, 0.3, 1] }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-[var(--line)] bg-[var(--canvas)] text-[13px] font-medium text-[var(--ink)]/80"
            >
              <Check className="w-3.5 h-3.5 text-[var(--accent)]" />
              {claim}
            </motion.span>
          ))}
        </div>
      </div>
    </section>
  )
}
