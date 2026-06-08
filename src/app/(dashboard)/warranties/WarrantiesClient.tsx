'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatDate, getDaysUntil, getUrgencyColor, isExpiringSoon, cn } from '@/lib/utils'
import type { Warranty } from '@/types'
import { Plus, Package, Trash2, Edit2, AlertTriangle, X, ShieldCheck } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { staggerContainer, fadeUp, spring } from '@/lib/motion'

type Props = { initialData: Warranty[]; userId: string }

const glass = 'bg-[#111118] border border-white/[0.06]'
const inputCls = 'w-full px-3 py-2.5 rounded-lg bg-white/[0.03] border border-white/[0.08] text-zinc-100 placeholder-zinc-700 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/30 transition-all text-sm'
const labelCls = 'block text-xs font-medium text-zinc-500 mb-1.5 uppercase tracking-wide'

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

  function closeForm() { setShowForm(false); resetForm() }

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
    setLoading(false); closeForm()
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this warranty?')) return
    await supabase.from('warranties').delete().eq('id', id)
    setWarranties(prev => prev.filter(w => w.id !== id))
  }

  return (
    <div className="space-y-6">
      <motion.div className="flex items-center justify-between" variants={fadeUp} initial="hidden" animate="show">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">Warranties</h1>
          <p className="text-zinc-500 text-sm mt-1">{valid.length} active{expiringSoon.length > 0 && `, ${expiringSoon.length} expiring soon`}</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true) }}
          className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-violet-600 hover:opacity-90 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-opacity shadow-lg shadow-indigo-500/20"
        >
          <Plus className="w-4 h-4" />
          Add warranty
        </button>
      </motion.div>

      {expiringSoon.length > 0 && (
        <div className="flex items-center gap-3 p-4 rounded-xl border border-amber-500/20 bg-amber-500/[0.04]">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
          <p className="text-sm text-amber-300">{expiringSoon.length} warranty{expiringSoon.length > 1 ? 'ies' : ''} expiring within 30 days</p>
        </div>
      )}

      {/* List */}
      {warranties.length === 0 ? (
        <div className={`rounded-xl py-20 px-8 text-center ${glass}`}>
          <div className="w-16 h-16 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-center mx-auto mb-5">
            <Package className="w-8 h-8 text-zinc-800" />
          </div>
          <h3 className="text-base font-bold text-zinc-300 mb-2">Nothing here yet</h3>
          <p className="text-sm text-zinc-600 mb-6 max-w-xs mx-auto">Track product warranties so you know when to file claims or seek repairs.</p>
          <button
            onClick={() => { resetForm(); setShowForm(true) }}
            className="bg-gradient-to-r from-indigo-500 to-violet-600 hover:opacity-90 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-opacity"
          >
            Add your first warranty
          </button>
        </div>
      ) : (
        <motion.div className="space-y-2" variants={staggerContainer(0.04, 0.1)} initial="hidden" animate="show">
          {warranties.map(w => {
            const days = getDaysUntil(w.expiry_date)
            const expired = days < 0
            const expiring = days >= 0 && days <= 30
            return (
              <motion.div
                key={w.id}
                layout
                variants={fadeUp}
                className={cn(
                  'flex items-center gap-4 p-4 rounded-xl border transition-all group',
                  expired
                    ? 'border-white/[0.04] bg-[#0d0d12] opacity-60'
                    : expiring
                    ? 'border-amber-500/20 bg-amber-500/[0.04] hover:bg-amber-500/[0.06]'
                    : 'border-white/[0.06] bg-[#111118] hover:bg-white/[0.03] hover:border-white/[0.09]'
                )}
              >
                <div className={cn(
                  'w-10 h-10 rounded-lg border flex items-center justify-center shrink-0',
                  expired ? 'bg-zinc-500/10 border-zinc-500/20' : expiring ? 'bg-amber-500/10 border-amber-500/20' : 'bg-emerald-500/10 border-emerald-500/20'
                )}>
                  {expired
                    ? <Package className="w-4.5 h-4.5 text-zinc-600 w-[18px] h-[18px]" />
                    : expiring
                    ? <AlertTriangle className="w-4.5 h-4.5 text-amber-400 w-[18px] h-[18px]" />
                    : <ShieldCheck className="w-4.5 h-4.5 text-emerald-400 w-[18px] h-[18px]" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-200">{w.product_name}</p>
                  <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                    <span className="text-xs text-zinc-600">Purchased {formatDate(w.purchase_date)}</span>
                    <span className="text-xs text-zinc-600">Expires {formatDate(w.expiry_date)}</span>
                  </div>
                  {w.coverage_notes && <p className="text-xs text-zinc-600 mt-0.5">{w.coverage_notes}</p>}
                </div>
                <span className={cn('text-xs font-mono font-bold shrink-0', expired ? 'text-zinc-600' : getUrgencyColor(days))}>
                  {expired ? 'Expired' : days === 0 ? 'Today' : `${days}d left`}
                </span>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-1">
                  <button onClick={() => openEdit(w)} className="p-1.5 rounded-lg hover:bg-white/[0.08] text-zinc-600 hover:text-zinc-200 transition-colors" aria-label="Edit"><Edit2 className="w-3.5 h-3.5" /></button>
                  <button onClick={() => handleDelete(w.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-zinc-600 hover:text-red-400 transition-colors" aria-label="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
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
            <motion.div key="backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={closeForm} />
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
                <h2 className="text-sm font-semibold text-zinc-100">{editing ? 'Edit warranty' : 'New warranty'}</h2>
                <button onClick={closeForm} className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.06] transition-all"><X className="w-4 h-4" /></button>
              </div>
              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto flex flex-col">
                <div className="px-6 py-5 space-y-4 flex-1">
                  <div>
                    <label className={labelCls}>Product name *</label>
                    <input value={form.product_name} onChange={e => setForm(p => ({ ...p, product_name: e.target.value }))} required placeholder="MacBook Pro, Samsung TV..." className={inputCls} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}>Purchase date *</label>
                      <input type="date" value={form.purchase_date} onChange={e => setForm(p => ({ ...p, purchase_date: e.target.value }))} required className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Warranty expiry *</label>
                      <input type="date" value={form.expiry_date} onChange={e => setForm(p => ({ ...p, expiry_date: e.target.value }))} required className={inputCls} />
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>Coverage notes</label>
                    <textarea value={form.coverage_notes} onChange={e => setForm(p => ({ ...p, coverage_notes: e.target.value }))} rows={3} placeholder="Parts and labor, manufacturer defects only..." className={inputCls + ' resize-none'} />
                  </div>
                </div>
                <div className="px-6 py-4 border-t border-white/[0.06] flex gap-3 justify-end shrink-0">
                  <button type="button" onClick={closeForm} className="px-4 py-2 text-sm text-zinc-500 hover:text-zinc-200 transition-colors">Cancel</button>
                  <button type="submit" disabled={loading} className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-violet-600 hover:opacity-90 disabled:opacity-50 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-opacity">
                    {loading && <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                    {editing ? 'Save changes' : 'Add warranty'}
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
