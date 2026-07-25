'use client'

import { motion } from 'framer-motion'

const ITEMS = [
  'Track every subscription and kill the ones you forgot',
  'Never pay a late fee again',
  'Find any receipt in seconds, forever',
  'Know your true monthly cost without doing math',
  'See six months of costs before they happen',
  'Catch expiring warranties while they still matter',
  'Walk into every appointment on time',
  'Start each week knowing exactly what’s coming',
  'Watch one number tell you you’re on top of it all',
]

export function EverythingYouNeed() {
  return (
    <section className="bg-[var(--canvas-alt)] px-6 py-24 md:py-32">
      <div className="mx-auto max-w-3xl">
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="font-landing-display font-bold text-[clamp(1.9rem,4.5vw,3rem)] leading-tight tracking-tight text-[var(--ink)] mb-12"
        >
          Everything you need.
        </motion.h2>

        <ul className="space-y-0">
          {ITEMS.map((item, i) => (
            <motion.li
              key={item}
              initial={{ opacity: 0, x: -12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: 0.4, delay: i * 0.04, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-baseline gap-4 py-4 border-b border-[var(--line)] last:border-0"
            >
              <span className="font-mono text-[13px] text-[var(--accent)] tabular-nums">{String(i + 1).padStart(2, '0')}</span>
              <span className="text-[17px] md:text-xl font-medium text-[var(--ink)]">{item}</span>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  )
}
