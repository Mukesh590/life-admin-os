'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency, formatDate, getDaysUntil, getUrgencyColor, getCategoryColor, cn } from '@/lib/utils'
import type { Bill } from '@/types'
import { Plus, Receipt, Trash2, Edit2, CheckCircle2, AlertCircle, X } from 'lucide-react'
import { isBefore } from 'date-fns'
import { motion, AnimatePresence } from 'framer-motion'

const CATEGORIES = ['utilities', 'rent', 'insurance', 'financial', 'medical', 'personal', 'other'] as const

type Props = { initialData: Bill[]; userId: string }

const glass = 'bg-[#111118] border border-white/[0.06]'
const inputCls = 'w-full px-3 py-2.5 rounded-lg bg-white/[0.03] border border-white/[0.08] text-zinc-100 placeholder-zinc-700 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/30 transition-all text-sm'
const labelCls = 'block text-xs font-medium text-zinc-500 mb-1.5 uppercase tracking-wide'

export function BillsClient({ initialData, userId }: Props) {
  const [bills, setBills] = useState<Bill[]>(initialData)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Bill | null>(null)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '', amount: '', currency: 'USD', due_date: '', paid: false, recurring: false,
    category: 'utilities' as typeof CATEGORIES[number], notes: '',
  })

  const supabase = createClient()
  const now = new Date()
  const unpaid = bills.filter(b => !b.paid)
  const overdue = unpaid.filter(b => isBefore(new Date(b.due_date), now))
  const totalUnpaid = unpaid.reduce((sum, b) => sum + b.amount, 0)

  function resetForm() {
    setForm({ name: '', amount: '', currency: 'USD', due_date: '', paid: false, recurring: false, category: 'utilities', notes: '' })
    setEditing(null)
  }

  function openEdit(b: Bill) {
    setEditing(b)
    setForm({ name: b.name, amount: String(b.amount), currency: b.currency, due_date: b.due_date.split('T')[0], paid: b.paid, recurring: b.recurring, category: b.category as typeof CATEGORIES[number], notes: b.notes || '' })
    setShowForm(true)
  }

  function closeForm() { setShowForm(false); resetForm() }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const payload = { user_id: userId, name: form.name, amount: parseFloat(form.amount), currency: form.currency, due_date: form.due_date, paid: form.paid, recurring: form.recurring, category: form.category, notes: form.notes || null }
    if (editing) {
      const { data } = await supabase.from('bills').update(payload).eq('id', editing.id).select().single()
      if (data) setBills(prev => prev.map(b => b.id === editing.id ? data : b))
    } else {
      const { data } = await supabase.from('bills').insert(payload).select().single()
      if (data) setBills(prev => [data, ...prev])
    }
    setLoading(false); closeForm()
  }

  async function togglePaid(bill: Bill) {
    const { data } = await supabase.from('bills').update({ paid: !bill.paid }).eq('id', bill.id).select().single()
    if (data) setBills(prev => prev.map(b => b.id === bill.id ? data : b))
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this bill?')) return
    await supabase.from('bills').delete().eq('id', id)
    setBills(prev => prev.filter(b => b.id !== id))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">Bills</h1>
          <p className="text-zinc-500 text-sm mt-1">{unpaid.length} unpaid{overdue.length > 0 && `, ${overdue.length} overdue`}</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true) }}
          className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-violet-600 hover:opacity-90 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-opacity shadow-lg shadow-indigo-500/20"
        >
          <Plus className="w-4 h-4" />
          Add bill
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[
          { label: 'Total unpaid', value: formatCurrency(totalUnpaid), icon: Receipt, valueColor: 'text-rose-300', iconBg: 'bg-rose-500/15 border-rose-500/20', iconColor: 'text-rose-400' },
          { label: 'Overdue bills', value: String(overdue.length), icon: AlertCircle, valueColor: overdue.length > 0 ? 'text-red-300' : 'text-emerald-300', iconBg: overdue.length > 0 ? 'bg-red-500/15 border-red-500/20' : 'bg-emerald-500/15 border-emerald-500/20', iconColor: overdue.length > 0 ? 'text-red-400' : 'text-emerald-400' },
        ].map(s => (
          <div key={s.label} className={`rounded-xl p-4 ${glass}`}>
            <div className={`w-8 h-8 rounded-lg border flex items-center justify-center mb-3 ${s.iconBg}`}>
              <s.icon className={`w-4 h-4 ${s.iconColor}`} />
            </div>
            <div className={`text-2xl font-bold font-mono tabular-nums ${s.valueColor}`}>{s.value}</div>
            <div className="text-xs text-zinc-600 mt-1.5 font-medium">{s.label}</div>
          </div>
        ))}
      </div>

      {/* List */}
      {bills.length === 0 ? (
        <div className={`rounded-xl py-20 px-8 text-center ${glass}`}>
          <div className="w-16 h-16 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-center mx-auto mb-5">
            <Receipt className="w-8 h-8 text-zinc-800" />
          </div>
          <h3 className="text-base font-bold text-zinc-300 mb-2">Nothing here yet</h3>
          <p className="text-sm text-zinc-600 mb-6 max-w-xs mx-auto">Track bills to never miss a payment or face a late fee again.</p>
          <button
            onClick={() => { resetForm(); setShowForm(true) }}
            className="bg-gradient-to-r from-indigo-500 to-violet-600 hover:opacity-90 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-opacity"
          >
            Add your first bill
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {bills.map(b => {
            const days = getDaysUntil(b.due_date)
            const isOverdueBill = !b.paid && isBefore(new Date(b.due_date), now)
            return (
              <motion.div
                key={b.id}
                layout
                className={cn(
                  'flex items-center gap-4 p-4 rounded-xl border transition-all group',
                  b.paid
                    ? 'border-white/[0.04] bg-[#0d0d12] opacity-60'
                    : isOverdueBill
                    ? 'border-red-500/20 bg-red-500/[0.04] hover:bg-red-500/[0.06]'
                    : 'border-white/[0.06] bg-[#111118] hover:bg-white/[0.03] hover:border-white/[0.09]'
                )}
              >
                <button
                  onClick={() => togglePaid(b)}
                  className={cn('w-5 h-5 rounded-full border-2 shrink-0 transition-all flex items-center justify-center', b.paid ? 'border-emerald-400 bg-emerald-400/20' : 'border-zinc-700 hover:border-emerald-400')}
                  aria-label={b.paid ? 'Mark unpaid' : 'Mark paid'}
                >
                  {b.paid && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={cn('text-sm font-medium', b.paid ? 'line-through text-zinc-500' : 'text-zinc-200')}>{b.name}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${getCategoryColor(b.category)}`}>{b.category}</span>
                    {b.recurring && <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20">recurring</span>}
                  </div>
                  <p className="text-xs text-zinc-600 mt-0.5">Due {formatDate(b.due_date)}</p>
                </div>
                <span className={cn('text-sm font-mono font-bold shrink-0', b.paid ? 'text-zinc-600' : getUrgencyColor(days))}>
                  {formatCurrency(b.amount, b.currency)}
                </span>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-1">
                  <button onClick={() => openEdit(b)} className="p-1.5 rounded-lg hover:bg-white/[0.08] text-zinc-600 hover:text-zinc-200 transition-colors" aria-label="Edit"><Edit2 className="w-3.5 h-3.5" /></button>
                  <button onClick={() => handleDelete(b.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-zinc-600 hover:text-red-400 transition-colors" aria-label="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Slide-in form panel */}
      <AnimatePresence>
        {showForm && (
          <>
            <motion.div key="backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={closeForm} />
            <motion.div
              key="panel"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="fixed right-0 top-0 h-full w-full max-w-[440px] z-50 flex flex-col shadow-2xl"
              style={{ background: '#111118', borderLeft: '1px solid rgba(255,255,255,0.06)' }}
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06] shrink-0">
                <h2 className="text-sm font-semibold text-zinc-100">{editing ? 'Edit bill' : 'New bill'}</h2>
                <button onClick={closeForm} className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.06] transition-all"><X className="w-4 h-4" /></button>
              </div>
              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto flex flex-col">
                <div className="px-6 py-5 space-y-4 flex-1">
                  <div>
                    <label className={labelCls}>Bill name *</label>
                    <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required placeholder="Electricity, Rent..." className={inputCls} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}>Amount *</label>
                      <input type="number" step="0.01" min="0" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} required placeholder="0.00" className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Due date *</label>
                      <input type="date" value={form.due_date} onChange={e => setForm(p => ({ ...p, due_date: e.target.value }))} required className={inputCls} />
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>Category</label>
                    <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value as typeof CATEGORIES[number] }))} className={inputCls}>
                      {CATEGORIES.map(c => <option key={c} value={c} className="bg-[#111118] capitalize">{c}</option>)}
                    </select>
                  </div>
                  <div className="flex gap-6">
                    {([['paid', 'Already paid'], ['recurring', 'Recurring']] as const).map(([field, label]) => (
                      <label key={field} className="flex items-center gap-2.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={form[field as 'paid' | 'recurring']}
                          onChange={e => setForm(p => ({ ...p, [field]: e.target.checked }))}
                          className="w-4 h-4 rounded border-white/20 bg-white/[0.03] accent-indigo-500"
                        />
                        <span className="text-sm text-zinc-400">{label}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="px-6 py-4 border-t border-white/[0.06] flex gap-3 justify-end shrink-0">
                  <button type="button" onClick={closeForm} className="px-4 py-2 text-sm text-zinc-500 hover:text-zinc-200 transition-colors">Cancel</button>
                  <button type="submit" disabled={loading} className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-violet-600 hover:opacity-90 disabled:opacity-50 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-opacity">
                    {loading && <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                    {editing ? 'Save changes' : 'Add bill'}
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
