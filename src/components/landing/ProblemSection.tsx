'use client'

import { motion } from 'framer-motion'
import { Marquee } from './Marquee'

const STATEMENTS = [
  'The subscription you forgot to cancel — charged again this morning.',
  'The bill that was due Tuesday. It’s Thursday.',
  'The warranty you definitely had... somewhere... when the headphones broke.',
  'The receipt you needed for a return, gone.',
  'The deadline you knew about for weeks that still snuck up on you.',
  'Twenty apps, three notebooks, a calendar you stopped checking, and a drawer full of paper.',
]

const revealVariants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0 },
}

export function ProblemSection() {
  return (
    <section className="bg-[var(--canvas)] px-6 py-24 md:py-32">
      <div className="mx-auto max-w-3xl">
        <motion.h2
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.5 }}
          variants={revealVariants}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="font-landing-display font-bold text-[clamp(2rem,5vw,3.25rem)] leading-[1.05] tracking-tight text-[var(--ink)] mb-4"
        >
          Why Life Admin Always Wins
        </motion.h2>

        <motion.p
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.5 }}
          variants={revealVariants}
          transition={{ duration: 0.5, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
          className="text-lg text-[var(--ink)]/70 mb-10"
        >
          You know the feeling.
        </motion.p>

        <ul className="space-y-5 mb-12">
          {STATEMENTS.map((line, i) => (
            <motion.li
              key={line}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.5 }}
              variants={revealVariants}
              transition={{ duration: 0.5, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
              className="text-[17px] md:text-xl leading-snug text-[var(--ink)] font-medium border-l-2 border-[var(--accent)]/40 pl-5"
            >
              {line}
            </motion.li>
          ))}
        </ul>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.4 }}
          variants={revealVariants}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-4"
        >
          <p className="text-[15px] md:text-lg leading-relaxed text-[var(--ink)]/70">
            The problem isn&apos;t you. It&apos;s that your life admin is scattered across places that don&apos;t talk to each other — and none of them remind you until it&apos;s too late.
          </p>
          <p className="text-[17px] md:text-xl leading-relaxed text-[var(--ink)] font-semibold">
            You don&apos;t need more discipline. You need a system that remembers for you.
          </p>
        </motion.div>
      </div>

      <div className="mt-16 md:mt-24 -mx-6">
        <Marquee />
      </div>
    </section>
  )
}
