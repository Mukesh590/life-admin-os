'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import {
  Brain, LayoutDashboard, CreditCard, Calendar, FileText,
  Receipt, Clock, Package, Settings, LogOut, Menu, X
} from 'lucide-react'
import { useState } from 'react'

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

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <>
      {/* Mobile header */}
      <div
        className="lg:hidden fixed top-0 left-0 right-0 z-50 h-14 flex items-center px-4 gap-3"
        style={{
          background: 'rgba(9,9,11,0.9)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg text-zinc-400 hover:text-zinc-200 transition-colors"
          style={{ background: 'rgba(255,255,255,0)', }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0)')}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
            <Brain className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <span className="font-bold text-[#fafafa] text-sm tracking-tight">
            Admin<span className="text-indigo-400">OS</span>
          </span>
        </div>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed top-0 left-0 h-full z-40 w-60 flex flex-col",
        "border-r border-white/[0.05]",
        "transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
        "lg:translate-x-0 lg:static",
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      )} style={{ background: 'rgba(9,9,11,0.6)', backdropFilter: 'blur(24px)' }}>

        {/* Logo */}
        <div className="h-16 flex items-center px-5 border-b border-white/[0.05]">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 group"
            onClick={() => setMobileOpen(false)}
          >
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center group-hover:bg-indigo-500/30 transition-colors">
              <Brain className="w-4.5 h-4.5 text-indigo-400 w-[18px] h-[18px]" />
            </div>
            <div>
              <div className="font-bold text-[#fafafa] text-sm tracking-tight leading-tight">
                Admin<span className="text-indigo-400">OS</span>
              </div>
              <div className="text-[10px] text-zinc-600 font-mono">Life Admin System</div>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-5 px-3 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group relative",
                  active
                    ? "text-indigo-300 border-l-2 border-indigo-500"
                    : "text-zinc-500 hover:text-zinc-200 border-l-2 border-transparent"
                )}
                style={active ? {
                  background: 'linear-gradient(90deg, rgba(99,102,241,0.15) 0%, rgba(139,92,246,0.05) 100%)',
                } : undefined}
                onMouseEnter={e => {
                  if (!active) {
                    (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'
                  }
                }}
                onMouseLeave={e => {
                  if (!active) {
                    (e.currentTarget as HTMLElement).style.background = ''
                  }
                }}
              >
                <item.icon
                  className={cn(
                    "w-4 h-4 shrink-0 transition-colors",
                    active ? "text-indigo-400" : "text-zinc-600 group-hover:text-indigo-400"
                  )}
                />
                {item.label}
                {active && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-500" />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Bottom */}
        <div className="px-3 py-4 border-t border-white/[0.05] space-y-0.5">
          <Link
            href="/settings"
            onClick={() => setMobileOpen(false)}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group border-l-2",
              pathname === '/settings'
                ? "text-indigo-300 border-indigo-500"
                : "text-zinc-500 hover:text-zinc-200 border-transparent"
            )}
            style={pathname === '/settings' ? {
              background: 'linear-gradient(90deg, rgba(99,102,241,0.15) 0%, rgba(139,92,246,0.05) 100%)',
            } : undefined}
            onMouseEnter={e => {
              if (pathname !== '/settings') {
                (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'
              }
            }}
            onMouseLeave={e => {
              if (pathname !== '/settings') {
                (e.currentTarget as HTMLElement).style.background = ''
              }
            }}
          >
            <Settings className="w-4 h-4 shrink-0 text-zinc-600 group-hover:text-indigo-400 transition-colors" />
            Settings
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-zinc-500 hover:text-red-400 transition-all group border-l-2 border-transparent"
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.05)')}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = '')}
          >
            <LogOut className="w-4 h-4 shrink-0 text-zinc-600 group-hover:text-red-400 transition-colors" />
            Sign out
          </button>
        </div>
      </aside>
    </>
  )
}
