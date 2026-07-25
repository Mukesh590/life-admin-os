'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Mail, CheckCircle2 } from 'lucide-react'

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleReset(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/update-password`,
    })

    if (error) {
      setError(error.message)
    } else {
      setSuccess(true)
    }
    setLoading(false)
  }

  if (success) {
    return (
      <div className="w-full max-w-sm mx-auto text-center">
        <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-7 h-7 text-emerald-600" />
        </div>
        <h2 className="font-landing-display font-bold text-xl text-[var(--ink)] mb-2">Check your email</h2>
        <p className="text-[var(--ink)]/60 text-sm mb-6">
          We sent a password reset link to <strong className="text-[var(--ink)]">{email}</strong>.
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
          Reset your password
        </h1>
        <p className="text-[var(--ink)]/60 text-sm">Enter your email and we&apos;ll send a reset link.</p>
      </div>

      <form onSubmit={handleReset} className="space-y-4">
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
            <Mail className="w-4 h-4" />
          )}
          {loading ? 'Sending...' : 'Send reset link'}
        </button>
      </form>

      <p className="text-center mt-6 text-sm text-[var(--ink)]/60">
        Remembered it?{' '}
        <Link href="/login" className="text-[var(--ink)] font-medium hover:text-[var(--accent)] transition-colors">
          Sign in
        </Link>
      </p>
    </div>
  )
}
