'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency, formatDate, getDaysUntil, getUrgencyColor, getCategoryColor, cn } from '@/lib/utils'
import type { Bill } from '@/types'
import { Plus, Receipt, Trash2, Edit2, CheckCircle2, AlertCircle } from 'lucide-react'
import { isBefore } from 'date-fns'

const CATEGORIES = ['utilities', 'rent', 'insurance', 'financial', 'medical', 'personal', 'other'] as const

type Props = { initialData: Bill[]; userId: string }

export function BillsClient({ initialData, userId }: Props) {
  const [bills, setBills] = useState<Bill[]>(initialData)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Bill | null>(null)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '', amount: '', currency: 'USD', due_date: '', paid: false, recurring: false, category: 'utilities' as typeof CATEGORIES[number], notes: '',
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
    setLoading(false); setShowForm(false); resetForm()
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
          <h1 className="text-2xl font-bold text-white">Bills</h1>
          <p className="text-slate-400 text-sm mt-1">{unpaid.length} unpaid{overdue.length > 0 && `, ${overdue.length} overdue`}</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true) }} className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all hover:-translate-y-0.5">
          <Plus className="w-4 h-4" />Add bill
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[
          { label: 'Total unpaid', value: formatCurrency(totalUnpaid), color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/20', icon: Receipt },
          { label: 'Overdue bills', value: String(overdue.length), color: overdue.length > 0 ? 'text-red-400' : 'text-emerald-400', bg: overdue.length > 0 ? 'bg-red-500/10 border-red-500/20' : 'bg-emerald-500/10 border-emerald-500/20', icon: AlertCircle },
        ].map(s => (
          <div key={s.label} className={`rounded-xl border p-4 bg-[#111827] ${s.bg.split(' ')[1]}`}>
            <div className={`w-8 h-8 rounded-lg ${s.bg} border flex items-center justify-center mb-3`}>
              <s.icon className={`w-4 h-4 ${s.color}`} />
            </div>
            <div className={`text-2xl font-bold font-mono ${s.color}`}>{s.value}</div>
            <div className="text-xs text-slate-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="rounded-xl border border-indigo-500/20 bg-[#111827] p-6">
          <h2 className="text-sm font-semibold text-slate-200 mb-4">{editing ? 'Edit bill' : 'New bill'}</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Bill name *</label>
              <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required placeholder="Electricity, Rent..." className="w-full px-3 py-2 rounded-lg bg-[#161b2e] border border-white/[0.08] text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Amount *</label>
              <input type="number" step="0.01" min="0" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} required placeholder="0.00" className="w-full px-3 py-2 rounded-lg bg-[#161b2e] border border-white/[0.08] text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Due date *</label>
              <input type="date" value={form.due_date} onChange={e => setForm(p => ({ ...p, due_date: e.target.value }))} required className="w-full px-3 py-2 rounded-lg bg-[#161b2e] border border-white/[0.08] text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Category</label>
              <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value as typeof CATEGORIES[number] }))} className="w-full px-3 py-2 rounded-lg bg-[#161b2e] border border-white/[0.08] text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 text-sm">
                {CATEGORIES.map(c => <option key={c} value={c} className="bg-[#161b2e] capitalize">{c}</option>)}
              </select>
            </div>
            <div className="flex gap-4">
              {[['paid', 'Already paid'], ['recurring', 'Recurring']].map(([field, label]) => (
                <label key={field} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form[field as 'paid' | 'recurring']} onChange={e => setForm(p => ({ ...p, [field]: e.target.checked }))} className="w-4 h-4 rounded border-white/20 bg-[#161b2e] text-indigo-500" />
                  <span className="text-sm text-slate-300">{label}</span>
                </label>
              ))}
            </div>
            <div className="sm:col-span-2 flex gap-3 justify-end">
              <button type="button" onClick={() => { setShowForm(false); resetForm() }} className="px-4 py-2 text-sm text-slate-400 hover:text-slate-200">Cancel</button>
              <button type="submit" disabled={loading} className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-400 disabled:opacity-60 text-white px-5 py-2 rounded-lg text-sm font-medium">
                {loading && <span className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />}
                {editing ? 'Save changes' : 'Add bill'}
              </button>
            </div>
          </form>
        </div>
      )}

      {bills.length === 0 ? (
        <div className="text-center py-16 rounded-xl border border-white/[0.06] bg-[#111827]">
          <Receipt className="w-10 h-10 text-amber-400/30 mx-auto mb-3" />
          <p className="text-slate-400 text-sm mb-4">No bills tracked yet</p>
          <button onClick={() => { resetForm(); setShowForm(true) }} className="text-indigo-400 hover:text-indigo-300 text-sm">Add your first bill</button>
        </div>
      ) : (
        <div className="space-y-2">
          {bills.map(b => {
            const days = getDaysUntil(b.due_date)
            const isOverdueBill = !b.paid && isBefore(new Date(b.due_date), now)
            return (
              <div key={b.id} className={cn("flex items-center gap-4 p-4 rounded-xl border transition-colors group", b.paid ? 'border-white/[0.04] bg-[#0e1322] opacity-60' : isOverdueBill ? 'border-red-500/20 bg-red-500/5' : 'border-white/[0.06] bg-[#111827] hover:bg-[#141a2e]')}>
                <button onClick={() => togglePaid(b)} className={cn("w-5 h-5 rounded-full border-2 shrink-0 transition-colors", b.paid ? 'border-emerald-400 bg-emerald-400/20' : 'border-slate-600 hover:border-emerald-400')} aria-label={b.paid ? 'Mark unpaid' : 'Mark paid'}>
                  {b.paid && <CheckCircle2 className="w-full h-full text-emerald-400" />}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={cn("text-sm font-medium", b.paid ? 'line-through text-slate-500' : 'text-slate-200')}>{b.name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${getCategoryColor(b.category)}`}>{b.category}</span>
                    {b.recurring && <span className="text-xs px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400">recurring</span>}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">Due {formatDate(b.due_date)}</p>
                </div>
                <span className={cn("text-sm font-mono font-bold shrink-0", b.paid ? 'text-slate-500' : getUrgencyColor(days))}>
                  {formatCurrency(b.amount, b.currency)}
                </span>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(b)} className="p-1.5 rounded-lg hover:bg-white/[0.08] text-slate-500 hover:text-slate-200" aria-label="Edit"><Edit2 className="w-3.5 h-3.5" /></button>
                  <button onClick={() => handleDelete(b.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-slate-500 hover:text-red-400" aria-label="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
