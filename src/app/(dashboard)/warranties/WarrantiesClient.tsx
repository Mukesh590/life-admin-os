'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatDate, getDaysUntil, getUrgencyColor, getUrgencyBg, isExpiringSoon, cn } from '@/lib/utils'
import type { Warranty } from '@/types'
import { Plus, Package, Trash2, Edit2, CheckCircle2, AlertTriangle } from 'lucide-react'

type Props = { initialData: Warranty[]; userId: string }

export function WarrantiesClient({ initialData, userId }: Props) {
  const [warranties, setWarranties] = useState<Warranty[]>(initialData)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Warranty | null>(null)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ product_name: '', purchase_date: '', expiry_date: '', coverage_notes: '' })

  const supabase = createClient()
  const expiringSoon = warranties.filter(w => isExpiringSoon(w.expiry_date, 30))
  const valid = warranties.filter(w => getDaysUntil(w.expiry_date) >= 0)

  function resetForm() { setForm({ product_name: '', purchase_date: '', expiry_date: '', coverage_notes: '' }); setEditing(null) }

  function openEdit(w: Warranty) {
    setEditing(w)
    setForm({ product_name: w.product_name, purchase_date: w.purchase_date.split('T')[0], expiry_date: w.expiry_date.split('T')[0], coverage_notes: w.coverage_notes || '' })
    setShowForm(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const payload = { user_id: userId, product_name: form.product_name, purchase_date: form.purchase_date, expiry_date: form.expiry_date, coverage_notes: form.coverage_notes || null }
    if (editing) {
      const { data } = await supabase.from('warranties').update(payload).eq('id', editing.id).select().single()
      if (data) setWarranties(prev => prev.map(w => w.id === editing.id ? data : w))
    } else {
      const { data } = await supabase.from('warranties').insert(payload).select().single()
      if (data) setWarranties(prev => [...prev, data])
    }
    setLoading(false); setShowForm(false); resetForm()
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this warranty?')) return
    await supabase.from('warranties').delete().eq('id', id)
    setWarranties(prev => prev.filter(w => w.id !== id))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Warranties</h1>
          <p className="text-slate-400 text-sm mt-1">{valid.length} active{expiringSoon.length > 0 && `, ${expiringSoon.length} expiring soon`}</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true) }} className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all hover:-translate-y-0.5">
          <Plus className="w-4 h-4" />Add warranty
        </button>
      </div>

      {expiringSoon.length > 0 && (
        <div className="flex items-center gap-3 p-4 rounded-xl border border-amber-500/20 bg-amber-500/5">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
          <p className="text-sm text-amber-300">{expiringSoon.length} warranty{expiringSoon.length > 1 ? 'ies' : ''} expiring within 30 days</p>
        </div>
      )}

      {showForm && (
        <div className="rounded-xl border border-indigo-500/20 bg-[#111827] p-6">
          <h2 className="text-sm font-semibold text-slate-200 mb-4">{editing ? 'Edit warranty' : 'New warranty'}</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Product name *</label>
              <input value={form.product_name} onChange={e => setForm(p => ({ ...p, product_name: e.target.value }))} required placeholder="MacBook Pro, Samsung TV..." className="w-full px-3 py-2 rounded-lg bg-[#161b2e] border border-white/[0.08] text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Purchase date *</label>
              <input type="date" value={form.purchase_date} onChange={e => setForm(p => ({ ...p, purchase_date: e.target.value }))} required className="w-full px-3 py-2 rounded-lg bg-[#161b2e] border border-white/[0.08] text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Warranty expiry *</label>
              <input type="date" value={form.expiry_date} onChange={e => setForm(p => ({ ...p, expiry_date: e.target.value }))} required className="w-full px-3 py-2 rounded-lg bg-[#161b2e] border border-white/[0.08] text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 text-sm" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Coverage notes</label>
              <textarea value={form.coverage_notes} onChange={e => setForm(p => ({ ...p, coverage_notes: e.target.value }))} rows={2} placeholder="Parts and labor, manufacturer defects only..." className="w-full px-3 py-2 rounded-lg bg-[#161b2e] border border-white/[0.08] text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 text-sm resize-none" />
            </div>
            <div className="sm:col-span-2 flex gap-3 justify-end">
              <button type="button" onClick={() => { setShowForm(false); resetForm() }} className="px-4 py-2 text-sm text-slate-400 hover:text-slate-200">Cancel</button>
              <button type="submit" disabled={loading} className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-400 disabled:opacity-60 text-white px-5 py-2 rounded-lg text-sm font-medium">
                {loading && <span className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />}
                {editing ? 'Save changes' : 'Add warranty'}
              </button>
            </div>
          </form>
        </div>
      )}

      {warranties.length === 0 ? (
        <div className="text-center py-16 rounded-xl border border-white/[0.06] bg-[#111827]">
          <Package className="w-10 h-10 text-emerald-400/30 mx-auto mb-3" />
          <p className="text-slate-400 text-sm mb-4">No warranties tracked yet</p>
          <button onClick={() => { resetForm(); setShowForm(true) }} className="text-indigo-400 hover:text-indigo-300 text-sm">Add your first warranty</button>
        </div>
      ) : (
        <div className="space-y-2">
          {warranties.map(w => {
            const days = getDaysUntil(w.expiry_date)
            return (
              <div key={w.id} className={cn("flex items-center gap-4 p-4 rounded-xl border transition-colors group", days < 0 ? 'border-white/[0.04] bg-[#0e1322] opacity-70' : getUrgencyBg(days) + ' bg-[#111827]')}>
                <div className={cn("w-10 h-10 rounded-lg border flex items-center justify-center shrink-0", days < 0 ? 'bg-slate-500/10 border-slate-500/20' : days <= 30 ? 'bg-amber-500/10 border-amber-500/20' : 'bg-emerald-500/10 border-emerald-500/20')}>
                  {days < 0 ? <Package className="w-5 h-5 text-slate-500" /> : days <= 30 ? <AlertTriangle className="w-5 h-5 text-amber-400" /> : <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-200">{w.product_name}</p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-xs text-slate-500">Purchased {formatDate(w.purchase_date)}</span>
                    <span className="text-xs text-slate-500">Expires {formatDate(w.expiry_date)}</span>
                  </div>
                  {w.coverage_notes && <p className="text-xs text-slate-500 mt-0.5">{w.coverage_notes}</p>}
                </div>
                <span className={cn("text-xs font-mono font-bold shrink-0", days < 0 ? 'text-slate-500' : getUrgencyColor(days))}>
                  {days < 0 ? 'Expired' : days === 0 ? 'Expires today' : `${days}d left`}
                </span>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(w)} className="p-1.5 rounded-lg hover:bg-white/[0.08] text-slate-500 hover:text-slate-200" aria-label="Edit"><Edit2 className="w-3.5 h-3.5" /></button>
                  <button onClick={() => handleDelete(w.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-slate-500 hover:text-red-400" aria-label="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
