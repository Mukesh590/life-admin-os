'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import {
  LayoutDashboard, CreditCard, Calendar, FileText,
  Receipt, Clock, Package, Settings, LogOut,
} from 'lucide-react'
import { useState, useEffect, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'

const navItems = [
  { id: 'overview', icon: LayoutDashboard, label: 'Dashboard' },
  { id: 'subscriptions', icon: CreditCard, label: 'Subscriptions' },
  { id: 'deadlines', icon: Calendar, label: 'Deadlines' },
  { id: 'documents', icon: FileText, label: 'Documents' },
  { id: 'bills', icon: Receipt, label: 'Bills' },
  { id: 'appointments', icon: Clock, label: 'Appointments' },
  { id: 'warranties', icon: Package, label: 'Warranties' },
]

const SECTION_IDS = [...navItems.map(i => i.id), 'settings']

// Continuous single-page dashboard (redesign v2) — the rail scrolls the page
// to each section instead of routing between pages. Active state comes from
// an IntersectionObserver watching every section, not from `pathname`.
export function Sidebar() {
  const router = useRouter()
  const [active, setActive] = useState('overview')
  const [userInitial, setUserInitial] = useState('U')
  const [userName, setUserName] = useState('')
  const clickScrollRef = useRef(false)
  const clickTimeoutRef = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single()
        .then(({ data }) => {
          const name = data?.full_name || user.email?.split('@')[0] || 'U'
          setUserName(name.split(' ')[0])
          setUserInitial(name.charAt(0).toUpperCase())
        })
    })
  }, [])

  useEffect(() => {
    const sections = SECTION_IDS
      .map(id => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null)
    if (sections.length === 0) return

    const observer = new IntersectionObserver(
      entries => {
        if (clickScrollRef.current) return
        const visible = entries
          .filter(e => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)
        if (visible[0]) setActive(visible[0].target.id)
      },
      { rootMargin: '-15% 0px -60% 0px', threshold: [0, 0.25, 0.5, 0.75, 1] }
    )
    sections.forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  const scrollToSection = useCallback((id: string) => (e: React.MouseEvent) => {
    e.preventDefault()
    const el = document.getElementById(id)
    if (!el) return
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    clickScrollRef.current = true
    setActive(id)
    el.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' })
    history.replaceState(null, '', `#${id}`)
    clearTimeout(clickTimeoutRef.current)
    clickTimeoutRef.current = setTimeout(() => { clickScrollRef.current = false }, 900)
  }, [])

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const allItems = [...navItems, { id: 'settings', icon: Settings, label: 'Settings' }]

  return (
    <>
      {/* Mobile top bar — wordmark only, no hamburger; navigation lives in the
          bottom bar below so nothing captures page scroll. */}
      <div
        className="lg:hidden fixed top-0 left-0 right-0 z-40 h-14 flex items-center px-4"
        style={{
          background: 'rgba(24,21,18,0.65)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid var(--dashboard-line, rgba(255,255,255,0.12))',
        }}
      >
        <Link href="/dashboard#overview" className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(135deg, #f3924f, #d9622c)' }}>
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
              <circle cx="7" cy="7" r="3" fill="white" opacity="0.9" />
              <circle cx="7" cy="7" r="6" stroke="white" strokeWidth="1.2" opacity="0.4" />
            </svg>
          </div>
          <span className="text-sm font-bold text-white tracking-tight" style={{ fontFamily: 'var(--font-display, Syne, sans-serif)' }}>
            Admin<span style={{ color: '#f3924f' }}>OS</span>
          </span>
        </Link>
      </div>

      {/* Mobile bottom nav — horizontal, scrollable if it overflows; the page
          itself never captures scroll, only this bar's own x-axis does. */}
      <nav
        aria-label="Dashboard sections"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 flex items-center gap-1 px-2 py-2 overflow-x-auto"
        style={{
          background: 'rgba(24,21,18,0.75)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderTop: '1px solid var(--dashboard-line, rgba(255,255,255,0.12))',
          paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))',
        }}
      >
        {allItems.map(item => {
          const isActive = active === item.id
          return (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={scrollToSection(item.id)}
              aria-current={isActive ? 'true' : undefined}
              className={cn(
                'relative flex flex-col items-center justify-center gap-0.5 min-w-[56px] h-12 rounded-xl shrink-0 transition-colors',
                isActive ? 'text-white' : 'text-white/50'
              )}
              style={isActive ? { background: 'rgba(226,121,61,0.22)' } : undefined}
            >
              <item.icon className="w-4 h-4" />
              <span className="text-[9px] font-medium leading-none">{item.label}</span>
            </a>
          )
        })}
        <button
          onClick={handleLogout}
          aria-label="Sign out"
          className="flex flex-col items-center justify-center gap-0.5 min-w-[56px] h-12 rounded-xl shrink-0 text-white/50 hover:text-red-300 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span className="text-[9px] font-medium leading-none">Sign out</span>
        </button>
      </nav>

      {/* Desktop sidebar — floating icon-only capsule, fixed to the viewport
          so it stays in place while the page scrolls natively. */}
      <div
        className="hidden lg:flex flex-col items-center justify-between w-[72px] fixed left-4 top-4 bottom-4 z-40 rounded-full py-6"
        style={{
          background: 'var(--dashboard-shell, rgba(24,21,18,0.55))',
          backdropFilter: 'blur(28px) saturate(1.4)',
          WebkitBackdropFilter: 'blur(28px) saturate(1.4)',
          border: '1px solid var(--dashboard-line, rgba(255,255,255,0.14))',
        }}
      >
        <a
          href="#overview"
          onClick={scrollToSection('overview')}
          aria-label="Dashboard home"
          className="relative w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-lg"
          style={{ background: 'linear-gradient(135deg, #f3924f, #d9622c)' }}
        >
          <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
            <circle cx="7" cy="7" r="3" fill="white" opacity="0.9" />
            <circle cx="7" cy="7" r="6" stroke="white" strokeWidth="1.2" opacity="0.4" />
          </svg>
        </a>

        <nav aria-label="Dashboard sections" className="flex flex-col items-center gap-3">
          {navItems.map(item => {
            const isActive = active === item.id
            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={scrollToSection(item.id)}
                aria-current={isActive ? 'true' : undefined}
                aria-label={item.label}
                title={item.label}
                className={cn(
                  'relative w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-150',
                  isActive ? 'text-white' : 'text-white/55 hover:text-white/85 hover:bg-white/[0.06]'
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="capsule-active-badge"
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: 'linear-gradient(135deg, #f3924f, #d9622c)',
                      boxShadow: '0 0 14px rgba(226,121,61,0.45)',
                    }}
                    transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                  />
                )}
                <item.icon className="w-4 h-4 relative z-10" />
              </a>
            )
          })}
        </nav>

        <div className="flex flex-col items-center gap-2">
          <a
            href="#settings"
            onClick={scrollToSection('settings')}
            aria-label="Settings"
            aria-current={active === 'settings' ? 'true' : undefined}
            title="Settings"
            className={cn(
              'relative w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-150',
              active === 'settings' ? 'text-white' : 'text-white/55 hover:text-white/85 hover:bg-white/[0.06]'
            )}
          >
            {active === 'settings' && (
              <motion.div
                layoutId="capsule-active-badge"
                className="absolute inset-0 rounded-full"
                style={{
                  background: 'linear-gradient(135deg, #f3924f, #d9622c)',
                  boxShadow: '0 0 14px rgba(226,121,61,0.45)',
                }}
                transition={{ type: 'spring', stiffness: 380, damping: 28 }}
              />
            )}
            <Settings className="w-4 h-4 relative z-10" />
          </a>
          <button
            onClick={handleLogout}
            aria-label="Sign out"
            title="Sign out"
            className="w-10 h-10 rounded-full flex items-center justify-center text-white/55 hover:text-red-300 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
          {userName && (
            <span className="sr-only">Signed in as {userName}</span>
          )}
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white/80 select-none"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.14)' }}
            aria-hidden="true"
          >
            {userInitial}
          </div>
        </div>
      </div>
    </>
  )
}
