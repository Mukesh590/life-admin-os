'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import {
  LayoutDashboard, CreditCard, Calendar, FileText,
  Receipt, Clock, Package, Settings, LogOut, Menu, X, Diamond
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
    <div className="h-16 flex items-center px-5 border-b border-white/[0.06] shrink-0">
      <Link href="/dashboard" className="flex items-center gap-3 group" onClick={close}>
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:shadow-indigo-500/40 transition-shadow">
          <Diamond className="w-4 h-4 text-white" />
        </div>
        <span className="text-[15px] font-bold text-zinc-100 tracking-tight">AdminOS</span>
      </Link>
    </div>
  )

  const navEl = (
    <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
      {navItems.map((item, i) => {
        const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
        return (
          <motion.div
            key={item.href}
            initial={{ x: -16, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: i * 0.05, duration: 0.3, ease: 'easeOut' }}
          >
            <Link
              href={item.href}
              onClick={close}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 border-l-2',
                active
                  ? 'text-indigo-300 bg-indigo-500/10 border-indigo-500'
                  : 'text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.04] border-transparent'
              )}
            >
              <item.icon
                className={cn(
                  'w-4 h-4 shrink-0 transition-colors',
                  active ? 'text-indigo-400' : 'text-zinc-600 group-hover:text-zinc-400'
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
    <div className="px-3 py-4 border-t border-white/[0.06] shrink-0">
      <Link
        href="/settings"
        onClick={close}
        className={cn(
          'flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 border-l-2 mb-1',
          pathname === '/settings'
            ? 'text-indigo-300 bg-indigo-500/10 border-indigo-500'
            : 'text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.04] border-transparent'
        )}
      >
        <Settings className={cn('w-4 h-4 shrink-0', pathname === '/settings' ? 'text-indigo-400' : 'text-zinc-600')} />
        Settings
      </Link>
      <div className="mt-3 pt-3 border-t border-white/[0.04] flex items-center gap-3 px-2">
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shrink-0 text-xs font-bold text-white select-none">
          {userInitial}
        </div>
        <span className="text-xs text-zinc-500 flex-1 truncate font-medium">{userName}</span>
        <button
          onClick={handleLogout}
          className="text-zinc-600 hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-red-500/10"
          aria-label="Sign out"
        >
          <LogOut className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )

  const sidebarInner = (
    <div className="h-full flex flex-col">
      {logoEl}
      {navEl}
      {bottomEl}
    </div>
  )

  return (
    <>
      {/* Mobile header */}
      <div
        className="lg:hidden fixed top-0 left-0 right-0 z-50 h-14 flex items-center px-4 gap-3"
        style={{
          background: 'rgba(10,10,15,0.9)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.06] transition-all"
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
            <Diamond className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-sm font-bold text-zinc-100">AdminOS</span>
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
            className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
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
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="lg:hidden fixed top-0 left-0 h-full w-60 z-50 border-r border-white/[0.06]"
            style={{
              background: 'rgba(10,10,15,0.95)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
            }}
          >
            {sidebarInner}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <div
        className="hidden lg:flex w-60 shrink-0 h-full flex-col border-r border-white/[0.06]"
        style={{
          background: 'rgba(0,0,0,0.4)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
        }}
      >
        {sidebarInner}
      </div>
    </>
  )
}
