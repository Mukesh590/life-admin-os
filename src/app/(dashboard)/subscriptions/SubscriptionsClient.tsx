'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency, formatDate, getDaysUntil, getCategoryColor, monthlyCost, annualCost, cn } from '@/lib/utils'
import type { Subscription } from '@/types'
import { Plus, CreditCard, Trash2, Edit2, TrendingUp, AlertCircle, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { staggerContainer, fadeUp, spring } from '@/lib/motion'

const CATEGORIES = ['Entertainment', 'Software', 'Utilities', 'Health', 'Education', 'Financial', 'Other']
const BILLING_CYCLES = ['monthly', 'annual', 'weekly', 'quarterly'] as const

type Props = { initialData: Subscription[]; userId: string }

const glass = 'bg-[#111118] border border-white/[0.06]'
const inputCls = 'w-full px-3 py-2.5 rounded-lg bg-white/[0.03] border border-white/[0.08] text-zinc-100 placeholder-zinc-700 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/30 transition-all text-sm'
const labelCls = 'block text-xs font-medium text-zinc-500 mb-1.5 uppercase tracking-wide'

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

  function closeForm() { setShowForm(false); resetForm() }

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
    closeForm()
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this subscription?')) return
    await supabase.from('subscriptions').delete().eq('id', id)
    setSubs(prev => prev.filter(s => s.id !== id))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div className="flex items-center justify-between" variants={fadeUp} initial="hidden" animate="show">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">Subscriptions</h1>
          <p className="text-zinc-500 text-sm mt-1">{subs.filter(s => s.status === 'active').length} active subscriptions</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true) }}
          className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-violet-600 hover:opacity-90 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-opacity shadow-lg shadow-indigo-500/20"
        >
          <Plus className="w-4 h-4" />
          Add subscription
        </button>
      </motion.div>

      {/* Stats */}
      <motion.div className="grid grid-cols-1 sm:grid-cols-3 gap-3" variants={fadeUp} initial="hidden" animate="show">
        {[
          { label: 'Monthly cost', value: formatCurrency(totalMonthly), icon: CreditCard, valueColor: 'text-indigo-300', iconBg: 'bg-indigo-500/15 border-indigo-500/20', iconColor: 'text-indigo-400' },
          { label: 'Annual cost', value: formatCurrency(totalAnnual), icon: TrendingUp, valueColor: 'text-emerald-300', iconBg: 'bg-emerald-500/15 border-emerald-500/20', iconColor: 'text-emerald-400' },
          { label: 'Renewing this week', value: String(expiringCount), icon: AlertCircle, valueColor: expiringCount > 0 ? 'text-amber-300' : 'text-zinc-400', iconBg: expiringCount > 0 ? 'bg-amber-500/15 border-amber-500/20' : 'bg-zinc-500/15 border-zinc-500/20', iconColor: expiringCount > 0 ? 'text-amber-400' : 'text-zinc-500' },
        ].map(stat => (
          <div key={stat.label} className={`rounded-xl p-4 ${glass}`}>
            <div className={`w-8 h-8 rounded-lg border flex items-center justify-center mb-3 ${stat.iconBg}`}>
              <stat.icon className={`w-4 h-4 ${stat.iconColor}`} />
            </div>
            <div className={`text-2xl font-bold font-mono tabular-nums ${stat.valueColor}`}>{stat.value}</div>
            <div className="text-xs text-zinc-600 mt-1.5 font-medium">{stat.label}</div>
          </div>
        ))}
      </motion.div>

      {/* Filter pills */}
      <div className="flex gap-2 flex-wrap">
        {['all', 'active', 'cancelled', ...CATEGORIES.map(c => c.toLowerCase())].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'px-3 py-1.5 rounded-full text-xs font-medium transition-all capitalize',
              filter === f
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                : 'bg-white/[0.03] text-zinc-500 border border-white/[0.06] hover:text-zinc-300 hover:border-white/[0.1]'
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className={`rounded-xl py-20 px-8 text-center ${glass}`}>
          <div className="w-16 h-16 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-center mx-auto mb-5">
            <CreditCard className="w-8 h-8 text-zinc-800" />
          </div>
          <h3 className="text-base font-bold text-zinc-300 mb-2">Nothing here yet</h3>
          <p className="text-sm text-zinc-600 mb-6 max-w-xs mx-auto">Track your subscriptions to stay on top of renewals and costs.</p>
          <button
            onClick={() => { resetForm(); setShowForm(true) }}
            className="bg-gradient-to-r from-indigo-500 to-violet-600 hover:opacity-90 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-opacity"
          >
            Add your first subscription
          </button>
        </div>
      ) : (
        <motion.div className="space-y-2" variants={staggerContainer(0.04, 0.1)} initial="hidden" animate="show">
          {filtered.map(sub => {
            const days = getDaysUntil(sub.next_renewal_date)
            return (
              <motion.div
                key={sub.id}
                layout
                variants={fadeUp}
                className={`flex items-center gap-4 p-4 rounded-xl border border-white/[0.06] bg-[#111118] hover:bg-white/[0.03] hover:border-white/[0.09] transition-all group`}
              >
                <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                  <CreditCard className="w-4.5 h-4.5 text-indigo-400 w-[18px] h-[18px]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-zinc-200">{sub.name}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${getCategoryColor(sub.category)}`}>{sub.category}</span>
                    {sub.status !== 'active' && (
                      <span className={cn('text-[10px] px-2 py-0.5 rounded-full border font-medium', sub.status === 'cancelled' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20')}>
                        {sub.status}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-600 mt-0.5">
                    Renews {formatDate(sub.next_renewal_date)}
                    {days >= 0 && days <= 7 && <span className="ml-2 text-amber-400 font-medium">in {days} days</span>}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-sm font-mono font-semibold text-zinc-200">
                    {formatCurrency(sub.amount, sub.currency)}
                    <span className="text-xs text-zinc-600">/{sub.billing_cycle === 'annual' ? 'yr' : sub.billing_cycle === 'monthly' ? 'mo' : sub.billing_cycle}</span>
                  </div>
                  <div className="text-xs text-zinc-600 mt-0.5 font-mono">{formatCurrency(monthlyCost(sub.amount, sub.billing_cycle))}/mo</div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-1">
                  <button onClick={() => openEdit(sub)} className="p-1.5 rounded-lg hover:bg-white/[0.08] text-zinc-600 hover:text-zinc-200 transition-colors" aria-label="Edit">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleDelete(sub.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-zinc-600 hover:text-red-400 transition-colors" aria-label="Delete">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      )}

      {/* Slide-in form panel */}
      <AnimatePresence>
        {showForm && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              onClick={closeForm}
            />
            <motion.div
              key="panel"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={spring.soft}
              className="fixed right-0 top-0 h-full w-full max-w-[440px] z-50 flex flex-col shadow-2xl"
              style={{ background: '#111118', borderLeft: '1px solid rgba(255,255,255,0.06)' }}
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06] shrink-0">
                <h2 className="text-sm font-semibold text-zinc-100">{editing ? 'Edit subscription' : 'New subscription'}</h2>
                <button onClick={closeForm} className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.06] transition-all">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto flex flex-col">
                <div className="px-6 py-5 space-y-4 flex-1">
                  <div>
                    <label className={labelCls}>Service name *</label>
                    <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required placeholder="Netflix, Spotify, AWS..." className={inputCls} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}>Amount *</label>
                      <input type="number" step="0.01" min="0" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} required placeholder="9.99" className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Billing cycle</label>
                      <select value={form.billing_cycle} onChange={e => setForm(p => ({ ...p, billing_cycle: e.target.value as typeof BILLING_CYCLES[number] }))} className={inputCls}>
                        {BILLING_CYCLES.map(c => <option key={c} value={c} className="bg-[#111118]">{c}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>Next renewal date *</label>
                    <input type="date" value={form.next_renewal_date} onChange={e => setForm(p => ({ ...p, next_renewal_date: e.target.value }))} required className={inputCls} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}>Category</label>
                      <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} className={inputCls}>
                        {CATEGORIES.map(c => <option key={c} value={c} className="bg-[#111118]">{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>Status</label>
                      <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))} className={inputCls}>
                        <option value="active" className="bg-[#111118]">Active</option>
                        <option value="cancelled" className="bg-[#111118]">Cancelled</option>
                        <option value="paused" className="bg-[#111118]">Paused</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>Notes</label>
                    <input value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} placeholder="Optional notes..." className={inputCls} />
                  </div>
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input type="checkbox" checked={form.cancel_reminder} onChange={e => setForm(p => ({ ...p, cancel_reminder: e.target.checked }))} className="w-4 h-4 rounded border-white/20 bg-white/[0.03] accent-indigo-500" />
                    <span className="text-sm text-zinc-400">Remind me to cancel before renewal</span>
                  </label>
                </div>
                <div className="px-6 py-4 border-t border-white/[0.06] flex gap-3 justify-end shrink-0">
                  <button type="button" onClick={closeForm} className="px-4 py-2 text-sm text-zinc-500 hover:text-zinc-200 transition-colors">Cancel</button>
                  <button type="submit" disabled={loading} className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-violet-600 hover:opacity-90 disabled:opacity-50 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-opacity">
                    {loading && <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                    {editing ? 'Save changes' : 'Add subscription'}
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
