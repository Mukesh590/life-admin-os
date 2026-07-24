export function FounderSection() {
  return (
    <section className="bg-[var(--canvas)] px-6 py-24 md:py-32 overflow-hidden">
      <div className="mx-auto max-w-5xl grid grid-cols-1 md:grid-cols-[minmax(0,340px)_1fr] gap-10 md:gap-4 items-center">
        <div className="relative mx-auto md:mx-0 w-full max-w-[320px] md:max-w-none">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/founder-photo.jpg"
            alt="Mukesh, founder of Life AdminOS"
            className="w-full aspect-[4/5] object-cover rounded-[28px]"
            loading="lazy"
          />
        </div>

        <div className="relative md:-ml-16 lg:-ml-24 text-center md:text-left">
          <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[var(--accent)] mb-2">
            Built by
          </p>
          <h2 className="font-landing-display font-extrabold text-[clamp(3.5rem,11vw,9rem)] leading-[0.88] tracking-tight text-[var(--ink)]">
            Mukesh
          </h2>
          <p className="mt-6 text-[15px] md:text-lg leading-relaxed text-[var(--ink)]/70 max-w-md mx-auto md:mx-0">
            I built Life AdminOS because the smallest responsibilities were the easiest to forget — and the most annoying to recover. So I made one place to keep them visible, organized, and out of my head.
          </p>
        </div>
      </div>
    </section>
  )
}
