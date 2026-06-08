'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import {
  LayoutDashboard, CreditCard, Calendar, FileText,
  Receipt, Clock, Package, Settings, LogOut, Menu, X,
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/subscriptions', icon: CreditCard, label: 'Subscriptions' },
  { href: '/deadlines', icon: Calendar, label: 'Deadlines' },
  { href: '/documents', icon: FileText, label: 'Documents' },
  { href: '/bills', icon: Receipt, label: 'Bills' },
  { href: '/appointments', icon: Clock, label: 'Appointments' },
  { href: '/warranties', icon: Package, label: 'Warranties' },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userInitial, setUserInitial] = useState('U')
  const [userName, setUserName] = useState('')

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

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const close = () => setMobileOpen(false)

  const logoEl = (
    <div className="h-16 flex items-center px-5 shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      <Link href="/dashboard" className="flex items-center gap-3 group" onClick={close}>
        {/* Logo orb */}
        <div className="relative w-8 h-8 shrink-0">
          <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-700 shadow-lg shadow-indigo-500/30 group-hover:shadow-indigo-500/50 transition-shadow" />
          <div className="absolute inset-0 rounded-xl flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="7" cy="7" r="3" fill="white" opacity="0.9" />
              <circle cx="7" cy="7" r="6" stroke="white" strokeWidth="1.2" opacity="0.4" />
            </svg>
          </div>
        </div>
        <span
          className="text-[15px] font-bold tracking-tight text-[#e8e8f0]"
          style={{ fontFamily: 'var(--font-display, Syne, sans-serif)' }}
        >
          Admin<span className="text-indigo-400">OS</span>
        </span>
      </Link>
    </div>
  )

  const navEl = (
    <nav className="flex-1 py-4 px-2.5 space-y-0.5 overflow-y-auto">
      {navItems.map((item, i) => {
        const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
        return (
          <motion.div
            key={item.href}
            initial={{ x: -14, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: i * 0.04, duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          >
            <Link
              href={item.href}
              onClick={close}
              className={cn(
                'relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-colors duration-150 group overflow-hidden',
                active
                  ? 'text-indigo-300 bg-indigo-500/10'
                  : 'text-[#5a5a72] hover:text-[#c4c4d8] hover:bg-white/[0.03]'
              )}
            >
              {/* Morphing active indicator (expanding-menu technique) */}
              {active && (
                <motion.div
                  layoutId="active-indicator"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] rounded-r-full"
                  style={{
                    height: '60%',
                    background: 'linear-gradient(to bottom, #818cf8, #5b5ef4)',
                    boxShadow: '0 0 8px rgba(91,94,244,0.6)',
                  }}
                  transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                />
              )}

              {/* Active glow shimmer */}
              {active && (
                <div
                  className="absolute inset-0 rounded-xl pointer-events-none"
                  style={{
                    background: 'linear-gradient(90deg, rgba(91,94,244,0.08) 0%, transparent 100%)',
                  }}
                />
              )}

              <item.icon
                className={cn(
                  'w-4 h-4 shrink-0 transition-colors',
                  active ? 'text-indigo-400' : 'text-[#3a3a55] group-hover:text-[#8080a0]'
                )}
              />
              {item.label}
            </Link>
          </motion.div>
        )
      })}
    </nav>
  )

  const bottomEl = (
    <div className="px-2.5 py-4 shrink-0" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
      <Link
        href="/settings"
        onClick={close}
        className={cn(
          'relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-colors duration-150 mb-1 overflow-hidden',
          pathname === '/settings'
            ? 'text-indigo-300 bg-indigo-500/10'
            : 'text-[#5a5a72] hover:text-[#c4c4d8] hover:bg-white/[0.03]'
        )}
      >
        {pathname === '/settings' && (
          <motion.div
            layoutId="active-indicator"
            className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] rounded-r-full"
            style={{
              height: '60%',
              background: 'linear-gradient(to bottom, #818cf8, #5b5ef4)',
              boxShadow: '0 0 8px rgba(91,94,244,0.6)',
            }}
            transition={{ type: 'spring', stiffness: 380, damping: 28 }}
          />
        )}
        <Settings className={cn('w-4 h-4 shrink-0', pathname === '/settings' ? 'text-indigo-400' : 'text-[#3a3a55]')} />
        Settings
      </Link>

      {/* User row */}
      <div className="mt-2 pt-3 flex items-center gap-2.5 px-2" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        {/* Avatar with gradient ring */}
        <div className="relative shrink-0">
          <div className="absolute -inset-[1.5px] rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 opacity-70" />
          <div className="relative w-7 h-7 rounded-full bg-gradient-to-br from-[#1a1a2e] to-[#12121d] flex items-center justify-center text-xs font-bold text-indigo-300 select-none"
            style={{ fontFamily: 'var(--font-display, Syne, sans-serif)' }}
          >
            {userInitial}
          </div>
        </div>
        <span className="text-xs text-[#4a4a62] flex-1 truncate font-medium">{userName}</span>
        <button
          onClick={handleLogout}
          className="text-[#3a3a55] hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-red-500/8"
          aria-label="Sign out"
        >
          <LogOut className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )

  const sidebarInner = (
    <div className="h-full flex flex-col relative">
      {/* Subtle dot texture */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />
      {/* Corner glow */}
      <div
        className="absolute bottom-0 left-0 w-48 h-48 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at bottom left, rgba(91,94,244,0.06) 0%, transparent 70%)',
        }}
      />
      <div className="relative z-10 flex flex-col h-full">
        {logoEl}
        {navEl}
        {bottomEl}
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile header */}
      <div
        className="lg:hidden fixed top-0 left-0 right-0 z-50 h-14 flex items-center px-4 gap-3"
        style={{
          background: 'rgba(4,4,10,0.92)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
        }}
      >
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg text-[#5a5a72] hover:text-[#c4c4d8] hover:bg-white/[0.05] transition-all"
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-700 flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
              <circle cx="7" cy="7" r="3" fill="white" opacity="0.9" />
              <circle cx="7" cy="7" r="6" stroke="white" strokeWidth="1.2" opacity="0.4" />
            </svg>
          </div>
          <span
            className="text-sm font-bold text-[#e8e8f0] tracking-tight"
            style={{ fontFamily: 'var(--font-display, Syne, sans-serif)' }}
          >
            Admin<span className="text-indigo-400">OS</span>
          </span>
        </Link>
      </div>

      {/* Mobile backdrop */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
            onClick={close}
          />
        )}
      </AnimatePresence>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="mobile-sidebar"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 320 }}
            className="lg:hidden fixed top-0 left-0 h-full w-60 z-50"
            style={{
              background: 'rgba(4,4,10,0.97)',
              backdropFilter: 'blur(28px)',
              WebkitBackdropFilter: 'blur(28px)',
              borderRight: '1px solid rgba(255,255,255,0.05)',
            }}
          >
            {sidebarInner}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <div
        className="hidden lg:flex w-60 shrink-0 h-full flex-col"
        style={{
          background: 'rgba(4,4,10,0.8)',
          backdropFilter: 'blur(28px)',
          WebkitBackdropFilter: 'blur(28px)',
          borderRight: '1px solid rgba(255,255,255,0.05)',
        }}
      >
        {sidebarInner}
      </div>
    </>
  )
}
