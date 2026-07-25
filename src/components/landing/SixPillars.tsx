'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'

const PILLARS = [
  {
    name: 'Subscriptions',
    image: '/media/landing/pillars/object-subscriptions.png',
    copy: 'Every recurring charge in one list — amount, billing cycle, next renewal date. Your true monthly cost, calculated automatically. Renewal warnings before you’re charged, not after. Cancel reminders for the ones you keep meaning to kill.',
  },
  {
    name: 'Bills',
    image: '/media/landing/pillars/object-bills.png',
    copy: 'Due dates, amounts, paid/unpaid at a glance. Overdue detection that flags what slipped. A monthly total you never have to add up yourself.',
  },
  {
    name: 'Deadlines',
    image: '/media/landing/pillars/object-deadlines.png',
    copy: 'School, work, financial, medical, government — categorized and color-coded by urgency. Green means breathe. Yellow means soon. Red means now. Recurring deadlines that reschedule themselves.',
  },
  {
    name: 'Documents',
    image: '/media/landing/pillars/object-documents.png',
    copy: 'Upload any receipt, bill, warranty card, or insurance paper. AI reads it, extracts the vendor, amount, and key dates, and files it — searchable forever. The receipt you’ll need in three months is already saved.',
  },
  {
    name: 'Appointments',
    image: '/media/landing/pillars/object-appointments.png',
    copy: 'Doctor, dentist, meetings — date, time, location, sorted chronologically so the next one is always visible.',
  },
  {
    name: 'Warranties',
    image: '/media/landing/pillars/object-warranties.png',
    copy: 'Purchase date, expiry date, proof of purchase attached. When something breaks, you’ll know in ten seconds whether it’s covered — and have the receipt to prove it.',
  },
]

export function SixPillars() {
  return (
    <section className="bg-[var(--canvas)] px-6 py-24 md:py-32">
      <div className="mx-auto max-w-6xl">
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="font-landing-display font-bold text-[clamp(1.9rem,4.5vw,3rem)] leading-tight tracking-tight text-[var(--ink)] mb-16 max-w-xl"
        >
          Six pillars. One system.
        </motion.h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {PILLARS.map((pillar, i) => (
            <motion.article
              key={pillar.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: (i % 3) * 0.08, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -4 }}
              className="rounded-[24px] border border-[var(--line)] bg-[var(--canvas-alt)] overflow-hidden flex flex-col"
            >
              <div className="relative aspect-[4/3] bg-[var(--canvas)]">
                <Image
                  src={pillar.image}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-contain p-8"
                />
              </div>
              <div className="p-6">
                <h3 className="font-landing-display font-bold text-lg text-[var(--ink)] mb-2">{pillar.name}</h3>
                <p className="text-[13.5px] leading-relaxed text-[var(--ink)]/65">{pillar.copy}</p>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}
