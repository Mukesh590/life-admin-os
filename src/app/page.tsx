'use client'

import { useRef, useState, useEffect } from 'react'
import Link from 'next/link'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import {
  Brain, Shield, Calendar, CreditCard, FileText,
  Clock, Package, CheckCircle2, ArrowRight, Sparkles,
  BarChart3, Lock, Globe
} from 'lucide-react'
import { HeroCanvas } from '@/components/animations/HeroCanvas'

gsap.registerPlugin(ScrollTrigger)

// Helper to split words into animated spans
function SplitWords({ text, className, charClass }: { text: string; className?: string; charClass: string }) {
  return (
    <span className={className}>
      {text.split(' ').map((word, i) => (
        <span
          key={i}
          className={charClass}
          style={{ display: 'inline-block', marginRight: '0.28em' }}
        >
          {word}
        </span>
      ))}
    </span>
  )
}

export default function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null)
  const navRef = useRef<HTMLElement>(null)
  const [navScrolled, setNavScrolled] = useState(false)

  // Nav scroll effect
  useEffect(() => {
    const onScroll = () => setNavScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useGSAP(() => {
    // Hero entrance
    const tl = gsap.timeline({ delay: 0.3 })
    tl.fromTo('.hero-word',
      { y: 60, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.05, duration: 0.7, ease: 'power3.out' }
    )
    .fromTo('.hero-sub-word',
      { opacity: 0, filter: 'blur(4px)' },
      { opacity: 1, filter: 'blur(0px)', stagger: 0.04, duration: 0.5, ease: 'power2.out' },
      '-=0.3'
    )
    .fromTo('.hero-cta',
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.1, duration: 0.5, ease: 'power2.out' },
      '-=0.2'
    )
    .fromTo('.hero-badge',
      { y: -10, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.4, ease: 'power2.out' },
      0
    )

    // Section label entrance for [01] etc
    gsap.utils.toArray<HTMLElement>('.section-label').forEach((el) => {
      gsap.fromTo(el,
        { opacity: 0, x: -20 },
        {
          opacity: 1,
          x: 0,
          duration: 0.5,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
          },
        }
      )
    })

    // Section headings
    gsap.utils.toArray<HTMLElement>('.section-heading').forEach((el) => {
      gsap.fromTo(el,
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
          },
        }
      )
    })

    // Feature cards stagger
    gsap.fromTo('.feature-card',
      { y: 40, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        stagger: 0.08,
        duration: 0.6,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: '.features-grid',
          start: 'top 80%',
        },
      }
    )

    // Stats count-up
    gsap.utils.toArray<HTMLElement>('.stat-number').forEach((el) => {
      const target = parseInt(el.getAttribute('data-value') || '0', 10)
      gsap.fromTo(
        el,
        { innerText: 0 },
        {
          innerText: target,
          duration: 2,
          ease: 'power2.out',
          snap: { innerText: 1 },
          scrollTrigger: {
            trigger: '.stats-section',
            start: 'top 75%',
          },
          onUpdate() {
            const current = Math.round(parseFloat(el.innerText))
            el.innerText = el.getAttribute('data-suffix')
              ? current + el.getAttribute('data-suffix')!
              : String(current)
          },
        }
      )
    })

    // AI section columns
    gsap.fromTo('.ai-col-left',
      { x: -40, opacity: 0 },
      {
        x: 0,
        opacity: 1,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: { trigger: '.ai-section', start: 'top 75%' },
      }
    )
    gsap.fromTo('.ai-col-right',
      { x: 40, opacity: 0 },
      {
        x: 0,
        opacity: 1,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: { trigger: '.ai-section', start: 'top 75%' },
      }
    )

    // Security section
    gsap.fromTo('.security-card',
      { y: 30, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.6,
        ease: 'power2.out',
        scrollTrigger: { trigger: '.security-section', start: 'top 80%' },
      }
    )

    // Pricing
    gsap.fromTo('.pricing-card',
      { y: 40, opacity: 0, scale: 0.97 },
      {
        y: 0,
        opacity: 1,
        scale: 1,
        duration: 0.7,
        ease: 'back.out(1.5)',
        scrollTrigger: { trigger: '.pricing-section', start: 'top 80%' },
      }
    )

  }, { scope: containerRef })

  const features = [
    {
      icon: CreditCard,
      title: 'Subscriptions',
      desc: 'Track every subscription, see what renews next, calculate monthly and annual costs. Never get surprised again.',
      color: 'text-indigo-400',
      glow: 'rgba(99,102,241,0.15)',
      border: 'rgba(99,102,241,0.2)',
    },
    {
      icon: Calendar,
      title: 'Deadlines',
      desc: 'Tax deadlines, license renewals, school applications. Priority-coded, calendar-integrated, always visible.',
      color: 'text-rose-400',
      glow: 'rgba(244,63,94,0.15)',
      border: 'rgba(244,63,94,0.2)',
    },
    {
      icon: FileText,
      title: 'Documents + AI',
      desc: 'Upload any receipt, bill, or insurance card. AI extracts dates, amounts, vendors automatically.',
      color: 'text-cyan-400',
      glow: 'rgba(6,182,212,0.15)',
      border: 'rgba(6,182,212,0.2)',
    },
    {
      icon: BarChart3,
      title: 'Bills',
      desc: 'Track recurring bills, mark as paid, spot overdue payments. Monthly spending at a glance.',
      color: 'text-emerald-400',
      glow: 'rgba(16,185,129,0.15)',
      border: 'rgba(16,185,129,0.2)',
    },
    {
      icon: Clock,
      title: 'Appointments',
      desc: 'Doctor, dentist, DMV, meetings. Chronological view with reminders so you never miss one.',
      color: 'text-amber-400',
      glow: 'rgba(245,158,11,0.15)',
      border: 'rgba(245,158,11,0.2)',
    },
    {
      icon: Package,
      title: 'Warranties',
      desc: 'Log every product warranty with expiry dates. Get alerted before coverage lapses.',
      color: 'text-violet-400',
      glow: 'rgba(167,139,250,0.15)',
      border: 'rgba(167,139,250,0.2)',
    },
  ]

  const stats = [
    { value: 20, suffix: '+', label: 'Apps replaced', prefix: '' },
    { value: 47, suffix: 'min', label: 'Saved per week', prefix: '' },
    { value: 100, suffix: '%', label: 'Data encrypted', prefix: '' },
    { value: 0, suffix: '', label: 'Cost forever', prefix: '$' },
  ]

  return (
    <div ref={containerRef} className="min-h-[100dvh] bg-[#09090b] text-[#fafafa] overflow-x-hidden">

      {/* Fixed Nav */}
      <nav
        ref={navRef}
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          background: navScrolled ? 'rgba(9,9,11,0.85)' : 'transparent',
          backdropFilter: navScrolled ? 'blur(20px)' : 'none',
          borderBottom: navScrolled ? '1px solid rgba(255,255,255,0.06)' : '1px solid transparent',
        }}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
              <Brain className="w-4 h-4 text-indigo-400" />
            </div>
            <span className="font-semibold text-[#fafafa] tracking-tight">
              Admin<span className="text-indigo-400">OS</span>
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            {[['[01]', '#features', 'Features'], ['[02]', '#intelligence', 'Intelligence'], ['[03]', '#pricing', 'Pricing']].map(([label, href, text]) => (
              <a
                key={href}
                href={href}
                className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-[#fafafa] transition-colors group"
              >
                <span className="text-xs font-mono text-zinc-600 group-hover:text-indigo-500 transition-colors">{label}</span>
                {text}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm text-zinc-300 hover:text-[#fafafa] transition-colors px-3 py-1.5"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="text-sm bg-indigo-500 hover:bg-indigo-400 text-white px-4 py-2 rounded-lg transition-all font-medium shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 hover:-translate-y-0.5"
            >
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-[100dvh] flex flex-col items-center justify-center overflow-hidden px-6">
        {/* Three.js background */}
        <HeroCanvas />

        {/* Gradient overlay for readability */}
        <div
          className="absolute inset-0 z-[1]"
          style={{
            background: 'radial-gradient(ellipse 80% 60% at 50% 100%, rgba(9,9,11,0.8) 0%, rgba(9,9,11,0.1) 60%, transparent 100%)',
          }}
        />

        {/* Content */}
        <div className="relative z-[2] max-w-5xl mx-auto text-center w-full">
          <div className="hero-badge inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-indigo-500/20 bg-indigo-500/5 text-indigo-300 text-xs font-medium mb-8 backdrop-blur-sm">
            <Sparkles className="w-3 h-3" />
            <span className="font-mono">[00]</span>
            Powered by Claude AI
          </div>

          <h1 className="text-6xl md:text-8xl font-black tracking-tight leading-[0.95] mb-8 overflow-hidden">
            <div>
              <SplitWords text="Your life." className="" charClass="hero-word" />
            </div>
            <div className="mt-2">
              <SplitWords
                text="Finally"
                className=""
                charClass="hero-word"
              />
              {' '}
              <span className="animated-gradient-text hero-word" style={{ display: 'inline-block' }}>
                organized.
              </span>
            </div>
          </h1>

          <p className="text-base md:text-lg text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            {['Replace', 'the', '20', 'fragmented', 'apps', 'you', 'use', 'to', 'manage', 'life', 'admin.', 'One', 'intelligent', 'system', 'that', 'remembers,', 'reminds,', 'and', 'acts.'].map((word, i) => (
              <span
                key={i}
                className="hero-sub-word"
                style={{ display: 'inline-block', marginRight: '0.28em' }}
              >
                {word}
              </span>
            ))}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup"
              className="hero-cta flex items-center gap-2 bg-indigo-500 hover:bg-indigo-400 text-white px-7 py-3.5 rounded-lg font-semibold transition-all hover:-translate-y-0.5 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 text-sm"
            >
              Start for free
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/login"
              className="hero-cta flex items-center gap-2 text-zinc-300 hover:text-white border border-white/[0.08] hover:border-white/20 px-7 py-3.5 rounded-lg font-medium transition-all text-sm backdrop-blur-sm"
            >
              Sign in
            </Link>
          </div>
          <p className="hero-cta mt-4 text-xs text-zinc-600">Free forever. No credit card required.</p>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[2] flex flex-col items-center gap-2 opacity-40">
          <span className="text-xs font-mono text-zinc-500">scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-zinc-500 to-transparent" />
        </div>
      </section>

      {/* Stats Strip */}
      <section className="stats-section py-16 border-y border-white/[0.04] bg-[#111115]">
        <div className="max-w-4xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl md:text-4xl font-black font-mono text-[#fafafa] mb-1">
                  {stat.prefix}
                  <span
                    className="stat-number"
                    data-value={stat.value}
                    data-suffix={stat.suffix}
                  >
                    {stat.value}{stat.suffix}
                  </span>
                </div>
                <div className="text-xs text-zinc-500 font-medium tracking-wider uppercase">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-28 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16">
            <span className="section-label block text-xs font-mono text-zinc-600 mb-3 tracking-widest">[01] Features</span>
            <h2 className="section-heading text-4xl md:text-5xl font-black tracking-tight text-[#fafafa] mb-4 max-w-lg">
              Everything in
              <span className="animated-gradient-text"> one place</span>
            </h2>
            <p className="text-zinc-400 text-base max-w-xl leading-relaxed">
              Stop hunting across apps. Life Admin OS connects all your important admin in one intelligent system.
            </p>
          </div>

          <div className="features-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="feature-card group relative rounded-2xl p-6 transition-all duration-300 cursor-default"
                style={{
                  background: '#111115',
                  border: `1px solid rgba(255,255,255,0.06)`,
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget
                  el.style.border = `1px solid ${feature.border}`
                  el.style.background = '#18181c'
                  el.style.boxShadow = `0 0 32px ${feature.glow}, inset 0 0 24px ${feature.glow}`
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget
                  el.style.border = '1px solid rgba(255,255,255,0.06)'
                  el.style.background = '#111115'
                  el.style.boxShadow = 'none'
                }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:rotate-12"
                  style={{
                    background: feature.glow,
                    border: `1px solid ${feature.border}`,
                  }}
                >
                  <feature.icon className={`w-5 h-5 ${feature.color}`} />
                </div>
                <h3 className="text-[#fafafa] font-bold text-lg mb-2">{feature.title}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Extraction Section */}
      <section id="intelligence" className="ai-section py-28 px-6 border-y border-white/[0.04]" style={{ background: '#0c0c0f' }}>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left col */}
            <div className="ai-col-left">
              <span className="section-label block text-xs font-mono text-zinc-600 mb-3 tracking-widest">[02] Intelligence</span>
              <h2 className="section-heading text-4xl md:text-5xl font-black tracking-tight text-[#fafafa] mb-6 leading-tight">
                Upload a doc.
                <br />
                <span className="animated-gradient-text">AI does the rest.</span>
              </h2>
              <p className="text-zinc-400 mb-8 leading-relaxed">
                Take a photo of any receipt, insurance card, warranty card, or bill. Claude AI automatically extracts the vendor, amount, dates, and categorizes it correctly. Review and save in seconds.
              </p>
              <div className="space-y-4">
                {[
                  'Extracts vendor name, amount, and key dates',
                  'Detects document type automatically',
                  'Routes to the right module',
                  'Confidence score so you know what to double-check',
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    </div>
                    <span className="text-zinc-300 text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right col - mock UI */}
            <div
              className="ai-col-right rounded-2xl p-6"
              style={{
                background: '#111115',
                border: '1px solid rgba(255,255,255,0.08)',
                boxShadow: '0 0 60px rgba(99,102,241,0.08)',
              }}
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
                  <Brain className="w-4 h-4 text-indigo-400" />
                </div>
                <span className="text-sm font-medium text-zinc-200">AI Document Extraction</span>
                <span className="ml-auto text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-mono">Processing</span>
              </div>
              <div className="rounded-xl border border-white/[0.06] p-4 mb-4" style={{ background: '#18181c' }}>
                <div className="text-xs text-zinc-600 mb-3 font-mono tracking-widest">UPLOADED DOCUMENT</div>
                <div className="h-20 rounded-lg flex items-center justify-center" style={{ background: '#0f0f12' }}>
                  <span className="text-sm text-zinc-600 font-mono">insurance_card.jpg</span>
                </div>
              </div>
              <div className="space-y-3">
                {[
                  { label: 'Document type', value: 'Insurance Card', color: 'text-cyan-400' },
                  { label: 'Provider', value: 'Blue Cross Blue Shield', color: 'text-zinc-200' },
                  { label: 'Expiry date', value: 'Dec 31, 2025', color: 'text-amber-400' },
                  { label: 'Coverage', value: 'Family PPO Plan', color: 'text-zinc-200' },
                  { label: 'Confidence', value: '97%', color: 'text-emerald-400' },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between py-1.5 border-b border-white/[0.04] last:border-0">
                    <span className="text-xs text-zinc-500">{row.label}</span>
                    <span className={`text-xs font-mono font-medium ${row.color}`}>{row.value}</span>
                  </div>
                ))}
              </div>
              <button className="w-full mt-5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 rounded-lg py-2.5 text-sm font-medium transition-colors">
                Save to Documents
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="security-section py-28 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="security-card rounded-2xl p-10 text-center" style={{ background: '#111115', border: '1px solid rgba(255,255,255,0.06)' }}>
            <span className="section-label block text-xs font-mono text-zinc-600 mb-3 tracking-widest">[03] Security</span>
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-6">
              <Shield className="w-7 h-7 text-emerald-400" />
            </div>
            <h2 className="section-heading text-3xl md:text-4xl font-black text-[#fafafa] mb-4 tracking-tight">Your data stays yours</h2>
            <p className="text-zinc-400 mb-10 max-w-xl mx-auto leading-relaxed">
              Row-level security on every database table. Encrypted at rest. No bank account numbers, card numbers, or SSNs collected. This is a personal tool, not a financial service.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                { icon: Lock, label: 'End-to-end encryption', desc: 'All data encrypted at rest via Supabase', color: 'text-emerald-400', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.2)' },
                { icon: Shield, label: 'Row-level security', desc: 'You only see your own data, always', color: 'text-indigo-400', bg: 'rgba(99,102,241,0.1)', border: 'rgba(99,102,241,0.2)' },
                { icon: Globe, label: 'No data selling', desc: 'Your data is never sold or shared', color: 'text-cyan-400', bg: 'rgba(6,182,212,0.1)', border: 'rgba(6,182,212,0.2)' },
              ].map((item) => (
                <div key={item.label} className="p-5 rounded-xl" style={{ background: item.bg, border: `1px solid ${item.border}` }}>
                  <item.icon className={`w-5 h-5 ${item.color} mx-auto mb-3`} />
                  <div className="text-sm font-semibold text-[#fafafa] mb-1">{item.label}</div>
                  <div className="text-xs text-zinc-500 leading-relaxed">{item.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="pricing-section py-28 px-6" style={{ background: '#0c0c0f', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <div className="max-w-lg mx-auto text-center">
          <span className="section-label block text-xs font-mono text-zinc-600 mb-3 tracking-widest">[04] Pricing</span>
          <h2 className="section-heading text-4xl md:text-5xl font-black text-[#fafafa] mb-4 tracking-tight">
            Simple pricing
          </h2>
          <p className="text-zinc-400 mb-12">No subscriptions. No tiers. No catch.</p>

          <div
            className="pricing-card rounded-2xl p-8 text-left"
            style={{
              background: 'linear-gradient(135deg, #111115 0%, #14141a 100%)',
              border: '1px solid rgba(99,102,241,0.25)',
              boxShadow: '0 0 60px rgba(99,102,241,0.08)',
            }}
          >
            <div className="flex items-end gap-2 mb-2">
              <span className="text-6xl font-black text-[#fafafa]">$0</span>
              <span className="text-zinc-400 mb-3">/ forever</span>
            </div>
            <div className="text-zinc-500 mb-8 text-sm">For real. No credit card. No catch.</div>

            <div className="space-y-3 mb-8">
              {[
                'All features included',
                'Unlimited entries',
                'AI document extraction',
                'Supabase secure storage',
                'Export your data anytime',
              ].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-3 h-3 text-indigo-400" />
                  </div>
                  <span className="text-sm text-zinc-300">{item}</span>
                </div>
              ))}
            </div>

            <Link
              href="/signup"
              className="flex items-center justify-center gap-2 w-full bg-indigo-500 hover:bg-indigo-400 text-white py-3.5 rounded-xl font-semibold transition-all hover:-translate-y-0.5 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40"
            >
              Get started free
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <p className="mt-6 text-xs text-zinc-600">
            This is a personal project. See{' '}
            <Link href="/privacy" className="underline hover:text-zinc-400 transition-colors">privacy policy</Link>{' '}
            for details.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] py-10 px-6 bg-[#09090b]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
              <Brain className="w-3.5 h-3.5 text-indigo-400" />
            </div>
            <span className="font-semibold text-zinc-300 text-sm">
              Admin<span className="text-indigo-400">OS</span>
            </span>
          </div>
          <div className="flex items-center gap-6 text-xs text-zinc-600">
            <Link href="/privacy" className="hover:text-zinc-300 transition-colors">Privacy</Link>
            <span className="font-mono">Built with Next.js + Supabase</span>
            <span>mukesen0204@gmail.com</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
