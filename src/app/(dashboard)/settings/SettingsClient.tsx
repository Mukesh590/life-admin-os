'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import { User as UserIcon, Shield, Download, Trash2, CheckCircle2, AlertTriangle } from 'lucide-react'

type Props = {
  user: User
  profile: { full_name?: string; timezone?: string } | null
}

export function SettingsClient({ user, profile }: Props) {
  const router = useRouter()
  const [fullName, setFullName] = useState(profile?.full_name || '')
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [deleting, setDeleting] = useState(false)

  const supabase = createClient()

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    await supabase.from('users_profile').upsert({
      id: user.id,
      full_name: fullName,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    })
    setLoading(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  async function handleExport() {
    const tables = ['subscriptions', 'deadlines', 'documents', 'bills', 'appointments', 'warranties']
    const allData: Record<string, unknown[]> = {}
    for (const table of tables) {
      const { data } = await supabase.from(table).select('*').eq('user_id', user.id)
      allData[table] = data || []
    }
    const blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `life-admin-os-export-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function handleDeleteAccount() {
    if (deleteConfirm !== 'DELETE') return
    setDeleting(true)
    const tables = ['subscriptions', 'deadlines', 'documents', 'bills', 'appointments', 'warranties', 'users_profile']
    for (const table of tables) {
      if (table === 'users_profile') {
        await supabase.from(table).delete().eq('id', user.id)
      } else {
        await supabase.from(table as 'subscriptions').delete().eq('user_id', user.id)
      }
    }
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-slate-400 text-sm mt-1">Manage your account and preferences</p>
      </div>

      {/* Profile */}
      <div className="rounded-xl border border-white/[0.08] bg-[#111827] p-6">
        <div className="flex items-center gap-3 mb-5">
          <UserIcon className="w-5 h-5 text-indigo-400" />
          <h2 className="text-sm font-semibold text-slate-200">Profile</h2>
        </div>
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Full name</label>
            <input
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder="Your name"
              className="w-full px-3 py-2 rounded-lg bg-[#161b2e] border border-white/[0.08] text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Email</label>
            <input
              value={user.email || ''}
              disabled
              className="w-full px-3 py-2 rounded-lg bg-[#0e1322] border border-white/[0.05] text-slate-500 text-sm cursor-not-allowed"
            />
            <p className="text-xs text-slate-500 mt-1">Email cannot be changed here. Contact support if needed.</p>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-400 disabled:opacity-60 text-white px-5 py-2 rounded-lg text-sm font-medium transition-all"
          >
            {loading ? <span className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" /> : saved ? <CheckCircle2 className="w-4 h-4" /> : null}
            {saved ? 'Saved!' : loading ? 'Saving...' : 'Save profile'}
          </button>
        </form>
      </div>

      {/* Data export */}
      <div className="rounded-xl border border-white/[0.08] bg-[#111827] p-6">
        <div className="flex items-center gap-3 mb-5">
          <Download className="w-5 h-5 text-emerald-400" />
          <h2 className="text-sm font-semibold text-slate-200">Export your data</h2>
        </div>
        <p className="text-sm text-slate-400 mb-4">Download all your data as a JSON file. This includes subscriptions, deadlines, documents, bills, appointments, and warranties.</p>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/20 px-5 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Download className="w-4 h-4" />
          Export all data
        </button>
      </div>

      {/* Security */}
      <div className="rounded-xl border border-white/[0.08] bg-[#111827] p-6">
        <div className="flex items-center gap-3 mb-5">
          <Shield className="w-5 h-5 text-cyan-400" />
          <h2 className="text-sm font-semibold text-slate-200">Security</h2>
        </div>
        <div className="space-y-3 text-sm text-slate-400">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>Row-level security enabled. You only see your own data.</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>Data encrypted at rest via Supabase.</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>No bank account numbers or card numbers are stored.</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>Your data is never sold or shared with third parties.</span>
          </div>
        </div>
      </div>

      {/* Danger zone */}
      <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-6">
        <div className="flex items-center gap-3 mb-5">
          <AlertTriangle className="w-5 h-5 text-red-400" />
          <h2 className="text-sm font-semibold text-red-400">Danger zone</h2>
        </div>
        <p className="text-sm text-slate-400 mb-4">
          Permanently delete your account and all associated data. This cannot be undone. Type <strong className="text-slate-200">DELETE</strong> to confirm.
        </p>
        <div className="flex gap-3">
          <input
            value={deleteConfirm}
            onChange={e => setDeleteConfirm(e.target.value)}
            placeholder="Type DELETE to confirm"
            className="flex-1 px-3 py-2 rounded-lg bg-[#161b2e] border border-red-500/20 text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-red-500/40 text-sm"
          />
          <button
            onClick={handleDeleteAccount}
            disabled={deleteConfirm !== 'DELETE' || deleting}
            className="flex items-center gap-2 bg-red-500/15 hover:bg-red-500/25 disabled:opacity-40 disabled:cursor-not-allowed text-red-400 border border-red-500/20 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            {deleting ? <span className="w-3 h-3 border border-red-400/30 border-t-red-400 rounded-full animate-spin" /> : <Trash2 className="w-4 h-4" />}
            Delete account
          </button>
        </div>
      </div>
    </div>
  )
}
