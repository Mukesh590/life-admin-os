'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff, LogIn } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="mb-8">
        <h1 className="font-landing-display font-bold text-[clamp(24px,3vw,32px)] leading-[1.05] tracking-tight text-[var(--ink)] mb-2">
          Welcome back.
          <br />
          Your life is waiting.
        </h1>
        <p className="text-[var(--ink)]/60 text-sm">Sign in to your Life AdminOS.</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-[var(--ink)]/80 mb-1.5">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            autoComplete="email"
            placeholder="you@example.com"
            className="w-full px-4 py-2.5 rounded-lg bg-white border border-[var(--line)] text-[var(--ink)] placeholder-[var(--ink)]/35 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/40 focus:border-[var(--accent)]/60 transition-all text-sm"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-[var(--ink)]/80 mb-1.5">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              placeholder="Your password"
              className="w-full px-4 py-2.5 pr-10 rounded-lg bg-white border border-[var(--line)] text-[var(--ink)] placeholder-[var(--ink)]/35 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/40 focus:border-[var(--accent)]/60 transition-all text-sm"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--ink)]/45 hover:text-[var(--ink)] transition-colors"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <div className="text-right mt-1.5">
            <Link href="/reset-password" className="text-xs text-[var(--ink)]/60 hover:text-[var(--ink)] transition-colors">
              Forgot password?
            </Link>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm" role="alert">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-[var(--accent)] hover:bg-[var(--accent)]/90 disabled:opacity-60 disabled:cursor-not-allowed text-white py-2.5 rounded-full font-semibold transition-all text-sm"
        >
          {loading ? (
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <LogIn className="w-4 h-4" />
          )}
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>

      <p className="text-center mt-6 text-sm text-[var(--ink)]/60">
        No account?{' '}
        <Link href="/signup" className="text-[var(--ink)] font-medium hover:text-[var(--accent)] transition-colors">
          Create one free
        </Link>
      </p>
    </div>
  )
}
