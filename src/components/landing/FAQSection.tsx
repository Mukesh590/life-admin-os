'use client'

import { motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

const FAQS = [
  { q: 'Is it really free?', a: 'Yes. The whole thing. No card required, no paid tier hiding the good features.' },
  { q: 'Is my data safe?', a: 'Your data is isolated per-user at the database level, and Life AdminOS never collects bank accounts, card numbers or SSNs. By design, those fields do not exist.' },
  { q: 'Do I have to enter everything manually?', a: 'No. Upload a receipt or bill and the AI extracts the details for you. Or type a quick note into the inbox and sort it later.' },
  { q: 'Does it connect to my bank?', a: 'No, deliberately. You track names, amounts and dates — never account credentials. You stay in control of what the system knows.' },
  { q: 'What if I stop using it for a while?', a: 'Everything is still there when you return. The dashboard will honestly show what accumulated and help you work through it.' },
  { q: 'Can I get my data out?', a: 'Yes. Export your data to CSV. It is your life and your information.' },
  { q: 'What do I need to start?', a: 'An email address and a few minutes.' },
]

export function FAQSection() {
  return (
    <section className="bg-[var(--canvas-alt)] px-6 py-24 md:py-32">
      <div className="mx-auto max-w-2xl">
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="font-landing-display font-bold text-[clamp(1.9rem,4.5vw,3rem)] leading-tight tracking-tight text-[var(--ink)] mb-12"
        >
          Questions, answered.
        </motion.h2>

        <div className="divide-y divide-[var(--line)] border-t border-b border-[var(--line)]">
          {FAQS.map(faq => (
            <details key={faq.q} className="group py-5">
              <summary className="flex items-center justify-between gap-4 cursor-pointer list-none text-[16px] md:text-[17px] font-semibold text-[var(--ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--ink)] focus-visible:outline-offset-4 rounded">
                {faq.q}
                <ChevronDown className="w-4 h-4 shrink-0 text-[var(--ink)]/50 transition-transform duration-200 group-open:rotate-180" />
              </summary>
              <p className="mt-3 text-[14.5px] leading-relaxed text-[var(--ink)]/65">{faq.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
