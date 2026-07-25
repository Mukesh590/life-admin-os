import Link from 'next/link'

export function FooterCurtain() {
  const year = new Date().getFullYear()

  return (
    <footer className="landing-footer-curtain flex flex-col justify-center">
      <div className="landing-hero-grid w-full py-10">
        <div className="[grid-column:1/13] md:[grid-column:2/12] text-center md:text-left mb-10 md:mb-14">
          <h2 className="font-landing-display font-bold text-[clamp(2rem,5.5vw,3.75rem)] leading-tight tracking-tight text-[var(--ink)] mb-4">
            Your life. Finally organized.
          </h2>
          <p className="text-[15px] md:text-lg text-[var(--ink)]/70 mb-8 max-w-lg mx-auto md:mx-0">
            Every renewal, every deadline, every document — quietly handled, starting today.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center justify-center px-8 py-4 rounded-full bg-[var(--ink)] text-[var(--canvas)] font-semibold text-[15px] hover:brightness-110 transition-[filter]"
          >
            Get started free
          </Link>
          <p className="mt-4 text-[13px] text-[var(--ink)]/50">Free forever · Nothing forgotten</p>
        </div>

        <div className="[grid-column:1/6] md:[grid-column:2/4]">
          <p className="font-landing-display font-semibold text-lg text-[var(--ink)]">Life AdminOS</p>
        </div>
        <nav className="[grid-column:1/13] md:[grid-column:5/9] flex flex-wrap gap-x-6 gap-y-2 mt-4 md:mt-0 text-sm text-[var(--ink)]/80">
          <Link href="/login" className="hover:text-[var(--ink)] transition-colors">
            Sign in
          </Link>
          <Link href="/privacy" className="hover:text-[var(--ink)] transition-colors">
            Privacy
          </Link>
        </nav>
        <p className="[grid-column:1/13] md:[grid-column:10/12] md:justify-self-end mt-4 md:mt-0 text-sm text-[var(--ink)]/60">
          © {year} Life AdminOS
        </p>
      </div>
    </footer>
  )
}
