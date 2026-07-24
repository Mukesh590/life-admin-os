import Link from 'next/link'

export function ClosingCTA() {
  return (
    <section className="bg-[var(--canvas)] px-6 py-24 md:py-32">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="font-landing-display font-bold text-[clamp(2rem,5.5vw,3.5rem)] leading-tight tracking-tight text-[var(--ink)]">
          Stop carrying it all in your head.
        </h2>
        <p className="mt-6 text-[15px] md:text-lg leading-relaxed text-[var(--ink)]/70 max-w-xl mx-auto">
          Put the bills, deadlines, documents, appointments, subscriptions, and warranties somewhere built to remember them.
        </p>
        <Link
          href="/signup"
          className="inline-flex items-center justify-center mt-10 px-8 py-4 rounded-full bg-[var(--accent)] text-[var(--ink)] font-semibold text-[15px] hover:brightness-95 transition-[filter]"
        >
          Create your free workspace
        </Link>
      </div>
    </section>
  )
}
