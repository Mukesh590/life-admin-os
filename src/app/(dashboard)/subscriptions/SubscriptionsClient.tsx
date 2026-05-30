'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency, formatDate, getDaysUntil, getCategoryColor, monthlyCost, annualCost, cn } from '@/lib/utils'
import type { Subscription } from '@/types'
import { Plus, CreditCard, Trash2, Edit2, TrendingUp, AlertCircle } from 'lucide-react'

const CATEGORIES = ['Entertainment', 'Software', 'Utilities', 'Health', 'Education', 'Financial', 'Other']
const BILLING_CYCLES = ['monthly', 'annual', 'weekly', 'quarterly'] as const

type Props = { initialData: Subscription[]; userId: string }

export function SubscriptionsClient({ initialData, userId }: Props) {
  const [subs, setSubs] = useState<Subscription[]>(initialData)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState<string>('all')

  const [form, setForm] = useState({
    name: '', amount: '', currency: 'USD', billing_cycle: 'monthly' as typeof BILLING_CYCLES[number],
    next_renewal_date: '', category: 'Other', status: 'active', cancel_reminder: false, notes: '',
  })

  const supabase = createClient()

  const totalMonthly = subs.filter(s => s.status === 'active').reduce((sum, s) => sum + monthlyCost(s.amount, s.billing_cycle), 0)
  const totalAnnual = subs.filter(s => s.status === 'active').reduce((sum, s) => sum + annualCost(s.amount, s.billing_cycle), 0)
  const expiringCount = subs.filter(s => getDaysUntil(s.next_renewal_date) <= 7 && getDaysUntil(s.next_renewal_date) >= 0).length

  const filtered = filter === 'all' ? subs : subs.filter(s => s.category.toLowerCase() === filter.toLowerCase() || s.status === filter)

  function resetForm() {
    setForm({ name: '', amount: '', currency: 'USD', billing_cycle: 'monthly', next_renewal_date: '', category: 'Other', status: 'active', cancel_reminder: false, notes: '' })
    setEditing(null)
  }

  function openEdit(sub: Subscription) {
    setEditing(sub)
    setForm({
      name: sub.name, amount: String(sub.amount), currency: sub.currency,
      billing_cycle: sub.billing_cycle as typeof BILLING_CYCLES[number],
      next_renewal_date: sub.next_renewal_date.split('T')[0], category: sub.category,
      status: sub.status, cancel_reminder: sub.cancel_reminder, notes: sub.notes || '',
    })
    setShowForm(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const payload = {
      user_id: userId,
      name: form.name,
      amount: parseFloat(form.amount),
      currency: form.currency,
      billing_cycle: form.billing_cycle,
      next_renewal_date: form.next_renewal_date,
      category: form.category,
      status: form.status,
      cancel_reminder: form.cancel_reminder,
      notes: form.notes || null,
    }

    if (editing) {
      const { data } = await supabase.from('subscriptions').update(payload).eq('id', editing.id).select().single()
      if (data) setSubs(prev => prev.map(s => s.id === editing.id ? data : s))
    } else {
      const { data } = await supabase.from('subscriptions').insert(payload).select().single()
      if (data) setSubs(prev => [data, ...prev])
    }
    setLoading(false)
    setShowForm(false)
    resetForm()
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this subscription?')) return
    await supabase.from('subscriptions').delete().eq('id', id)
    setSubs(prev => prev.filter(s => s.id !== id))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Subscriptions</h1>
          <p className="text-slate-400 text-sm mt-1">{subs.filter(s => s.status === 'active').length} active subscriptions</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true) }}
          className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all hover:-translate-y-0.5"
        >
          <Plus className="w-4 h-4" />
          Add subscription
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { label: 'Monthly cost', value: formatCurrency(totalMonthly), icon: CreditCard, color: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/20' },
          { label: 'Annual cost', value: formatCurrency(totalAnnual), icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
          { label: 'Renewing this week', value: String(expiringCount), icon: AlertCircle, color: expiringCount > 0 ? 'text-amber-400' : 'text-slate-400', bg: expiringCount > 0 ? 'bg-amber-500/10 border-amber-500/20' : 'bg-slate-500/10 border-slate-500/20' },
        ].map(stat => (
          <div key={stat.label} className={`rounded-xl border p-4 bg-[#111827] ${stat.bg.split(' ')[1]}`}>
            <div className={`w-8 h-8 rounded-lg ${stat.bg} border flex items-center justify-center mb-3`}>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </div>
            <div className={`text-2xl font-bold font-mono ${stat.color}`}>{stat.value}</div>
            <div className="text-xs text-slate-500 mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Filter pills */}
      <div className="flex gap-2 flex-wrap">
        {['all', 'active', 'cancelled', ...CATEGORIES.map(c => c.toLowerCase())].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'px-3 py-1.5 rounded-full text-xs font-medium transition-colors capitalize',
              filter === f
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                : 'bg-[#161b2e] text-slate-400 border border-white/[0.06] hover:text-slate-200'
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="rounded-xl border border-indigo-500/20 bg-[#111827] p-6">
          <h2 className="text-sm font-semibold text-slate-200 mb-4">{editing ? 'Edit subscription' : 'New subscription'}</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Service name *</label>
              <input
                value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                required
                placeholder="Netflix, Spotify, AWS..."
                className="w-full px-3 py-2 rounded-lg bg-[#161b2e] border border-white/[0.08] text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Amount *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.amount}
                onChange={e => setForm(p => ({ ...p, amount: e.target.value }))}
                required
                placeholder="9.99"
                className="w-full px-3 py-2 rounded-lg bg-[#161b2e] border border-white/[0.08] text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Billing cycle *</label>
              <select
                value={form.billing_cycle}
                onChange={e => setForm(p => ({ ...p, billing_cycle: e.target.value as typeof BILLING_CYCLES[number] }))}
                className="w-full px-3 py-2 rounded-lg bg-[#161b2e] border border-white/[0.08] text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 text-sm"
              >
                {BILLING_CYCLES.map(c => <option key={c} value={c} className="bg-[#161b2e]">{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Next renewal date *</label>
              <input
                type="date"
                value={form.next_renewal_date}
                onChange={e => setForm(p => ({ ...p, next_renewal_date: e.target.value }))}
                required
                className="w-full px-3 py-2 rounded-lg bg-[#161b2e] border border-white/[0.08] text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Category</label>
              <select
                value={form.category}
                onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg bg-[#161b2e] border border-white/[0.08] text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 text-sm"
              >
                {CATEGORIES.map(c => <option key={c} value={c} className="bg-[#161b2e]">{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Status</label>
              <select
                value={form.status}
                onChange={e => setForm(p => ({ ...p, status: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg bg-[#161b2e] border border-white/[0.08] text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 text-sm"
              >
                <option value="active" className="bg-[#161b2e]">Active</option>
                <option value="cancelled" className="bg-[#161b2e]">Cancelled</option>
                <option value="paused" className="bg-[#161b2e]">Paused</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Notes</label>
              <input
                value={form.notes}
                onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                placeholder="Optional notes..."
                className="w-full px-3 py-2 rounded-lg bg-[#161b2e] border border-white/[0.08] text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 text-sm"
              />
            </div>
            <div className="sm:col-span-2 flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.cancel_reminder}
                  onChange={e => setForm(p => ({ ...p, cancel_reminder: e.target.checked }))}
                  className="w-4 h-4 rounded border-white/20 bg-[#161b2e] text-indigo-500"
                />
                <span className="text-sm text-slate-300">Remind me to cancel before renewal</span>
              </label>
            </div>
            <div className="sm:col-span-2 flex gap-3 justify-end">
              <button type="button" onClick={() => { setShowForm(false); resetForm() }} className="px-4 py-2 text-sm text-slate-400 hover:text-slate-200 transition-colors">
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-400 disabled:opacity-60 text-white px-5 py-2 rounded-lg text-sm font-medium transition-all"
              >
                {loading && <span className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />}
                {editing ? 'Save changes' : 'Add subscription'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 rounded-xl border border-white/[0.06] bg-[#111827]">
          <CreditCard className="w-10 h-10 text-indigo-400/30 mx-auto mb-3" />
          <p className="text-slate-400 text-sm mb-4">No subscriptions yet</p>
          <button onClick={() => { resetForm(); setShowForm(true) }} className="text-indigo-400 hover:text-indigo-300 text-sm">
            Add your first subscription
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((sub) => {
            const days = getDaysUntil(sub.next_renewal_date)
            return (
              <div key={sub.id} className="flex items-center gap-4 p-4 rounded-xl border border-white/[0.06] bg-[#111827] hover:bg-[#141a2e] transition-colors group">
                <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                  <CreditCard className="w-5 h-5 text-indigo-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-slate-200">{sub.name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${getCategoryColor(sub.category)}`}>{sub.category}</span>
                    {sub.status !== 'active' && (
                      <span className={cn('text-xs px-2 py-0.5 rounded-full', sub.status === 'cancelled' ? 'bg-red-500/10 text-red-400' : 'bg-amber-500/10 text-amber-400')}>
                        {sub.status}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Renews {formatDate(sub.next_renewal_date)}
                    {days >= 0 && days <= 7 && <span className="ml-2 text-amber-400">in {days} days</span>}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-sm font-mono font-semibold text-slate-200">
                    {formatCurrency(sub.amount, sub.currency)}
                    <span className="text-xs text-slate-500">/{sub.billing_cycle === 'annual' ? 'yr' : sub.billing_cycle === 'monthly' ? 'mo' : sub.billing_cycle}</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5 font-mono">{formatCurrency(monthlyCost(sub.amount, sub.billing_cycle))}/mo</div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(sub)} className="p-1.5 rounded-lg hover:bg-white/[0.08] text-slate-500 hover:text-slate-200 transition-colors" aria-label="Edit">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleDelete(sub.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition-colors" aria-label="Delete">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
