'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff, UserPlus, CheckCircle2 } from 'lucide-react'

export default function SignupPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      setLoading(false)
      return
    }

    const supabase = createClient()
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    if (data.user) {
      // Create profile
      await supabase.from('users_profile').upsert({
        id: data.user.id,
        full_name: fullName,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      })

      if (data.session) {
        router.push('/dashboard')
        router.refresh()
      } else {
        setSuccess(true)
        setLoading(false)
      }
    }
  }

  if (success) {
    return (
      <div className="w-full max-w-sm mx-auto text-center">
        <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-7 h-7 text-emerald-600" />
        </div>
        <h2 className="font-landing-display font-bold text-xl text-[var(--ink)] mb-2">Check your email</h2>
        <p className="text-[var(--ink)]/60 text-sm mb-6">
          We sent a confirmation link to <strong className="text-[var(--ink)]">{email}</strong>. Click it to activate your account.
        </p>
        <Link href="/login" className="text-[var(--ink)] hover:text-[var(--accent)] text-sm font-medium transition-colors">
          Back to sign in
        </Link>
      </div>
    )
  }

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="mb-8">
        <h1 className="font-landing-display font-bold text-[clamp(24px,3vw,32px)] leading-[1.05] tracking-tight text-[var(--ink)] mb-2">
          Start forgetting less.
        </h1>
        <p className="text-[var(--ink)]/60 text-sm">Free forever. No credit card needed.</p>
      </div>

      <form onSubmit={handleSignup} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-[var(--ink)]/80 mb-1.5">
            Full name
          </label>
          <input
            id="name"
            type="text"
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            required
            autoComplete="name"
            placeholder="Alex Chen"
            className="w-full px-4 py-2.5 rounded-lg bg-white border border-[var(--line)] text-[var(--ink)] placeholder-[var(--ink)]/35 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/40 focus:border-[var(--accent)]/60 transition-all text-sm"
          />
        </div>

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
              autoComplete="new-password"
              placeholder="Min. 8 characters"
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
            <UserPlus className="w-4 h-4" />
          )}
          {loading ? 'Creating account...' : 'Create account'}
        </button>
      </form>

      <p className="text-center mt-6 text-sm text-[var(--ink)]/60">
        Already have an account?{' '}
        <Link href="/login" className="text-[var(--ink)] font-medium hover:text-[var(--accent)] transition-colors">
          Sign in
        </Link>
      </p>
    </div>
  )
}
