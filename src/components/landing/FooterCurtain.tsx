import Link from 'next/link'

export function FooterCurtain() {
  const year = new Date().getFullYear()

  return (
    <footer className="landing-footer-curtain flex items-center">
      <div className="landing-hero-grid w-full items-center py-10">
        <div className="[grid-column:1/6] md:[grid-column:1/4]">
          <p className="font-landing-display font-semibold text-lg text-[var(--ink)]">Life AdminOS</p>
        </div>
        <nav className="[grid-column:1/13] md:[grid-column:5/10] flex flex-wrap gap-x-6 gap-y-2 mt-4 md:mt-0 text-sm text-[var(--ink)]/80">
          <Link href="/login" className="hover:text-[var(--ink)] transition-colors">
            Sign in
          </Link>
          <Link href="/privacy" className="hover:text-[var(--ink)] transition-colors">
            Privacy
          </Link>
        </nav>
        <p className="[grid-column:1/13] md:[grid-column:10/13] md:justify-self-end mt-4 md:mt-0 text-sm text-[var(--ink)]/60">
          © {year} Life AdminOS
        </p>
      </div>
    </footer>
  )
}
