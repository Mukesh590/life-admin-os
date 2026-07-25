'use client'

import { motion } from 'framer-motion'
import { Check, X } from 'lucide-react'

const FOR = [
  'You’ve ever been charged for a subscription you forgot existed',
  'You manage your life across sticky notes, screenshots, and memory',
  'You want one place that just handles it',
  'You like the feeling of being genuinely on top of things',
]

const NOT_FOR = [
  'You want an app to do your work for you — this organizes your life, you still live it',
  'You’re looking for a budgeting app that connects to your bank — Life AdminOS deliberately never touches bank accounts, card numbers or SSNs',
  'You enjoy late fees',
]

export function WhoItsFor() {
  return (
    <section className="bg-[var(--canvas)] px-6 py-24 md:py-32">
      <div className="mx-auto max-w-4xl grid md:grid-cols-2 gap-10 md:gap-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <h2 className="font-landing-display font-bold text-2xl md:text-3xl text-[var(--ink)] mb-6">This is for you if:</h2>
          <ul className="space-y-4">
            {FOR.map(item => (
              <li key={item} className="flex items-start gap-3">
                <Check className="w-4 h-4 mt-1 shrink-0 text-[var(--accent)]" />
                <span className="text-[15px] leading-relaxed text-[var(--ink)]/80">{item}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.5, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
        >
          <h2 className="font-landing-display font-bold text-2xl md:text-3xl text-[var(--ink)]/60 mb-6">This is not for you if:</h2>
          <ul className="space-y-4">
            {NOT_FOR.map(item => (
              <li key={item} className="flex items-start gap-3">
                <X className="w-4 h-4 mt-1 shrink-0 text-[var(--ink)]/35" />
                <span className="text-[15px] leading-relaxed text-[var(--ink)]/55">{item}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </section>
  )
}
