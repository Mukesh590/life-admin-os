'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatDate, getDaysUntil, getUrgencyColor, getPriorityBadge, getCategoryColor, cn } from '@/lib/utils'
import type { Deadline } from '@/types'
import { Plus, Calendar, Trash2, Edit2, CheckCircle2, AlertTriangle, X } from 'lucide-react'
import { isBefore } from 'date-fns'
import { motion, AnimatePresence } from 'framer-motion'

const CATEGORIES = ['school', 'personal', 'work', 'financial', 'medical', 'government', 'other'] as const
const PRIORITIES = ['critical', 'high', 'medium', 'low'] as const

type Props = { initialData: Deadline[]; userId: string }

const glass = 'bg-[#111118] border border-white/[0.06]'
const inputCls = 'w-full px-3 py-2.5 rounded-lg bg-white/[0.03] border border-white/[0.08] text-zinc-100 placeholder-zinc-700 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/30 transition-all text-sm'
const labelCls = 'block text-xs font-medium text-zinc-500 mb-1.5 uppercase tracking-wide'

export function DeadlinesClient({ initialData, userId }: Props) {
  const [deadlines, setDeadlines] = useState<Deadline[]>(initialData)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Deadline | null>(null)
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed' | 'overdue'>('all')

  const [form, setForm] = useState({
    title: '', due_date: '', category: 'personal' as typeof CATEGORIES[number],
    priority: 'medium' as typeof PRIORITIES[number], notes: '', recurring: false,
  })

  const supabase = createClient()
  const now = new Date()
  const pending = deadlines.filter(d => d.status === 'pending' && !isBefore(new Date(d.due_date), now))
  const overdue = deadlines.filter(d => d.status === 'pending' && isBefore(new Date(d.due_date), now))
  const completed = deadlines.filter(d => d.status === 'completed')

  const filtered = filter === 'all' ? deadlines
    : filter === 'pending' ? pending
    : filter === 'overdue' ? overdue
    : completed

  function resetForm() {
    setForm({ title: '', due_date: '', category: 'personal', priority: 'medium', notes: '', recurring: false })
    setEditing(null)
  }

  function openEdit(d: Deadline) {
    setEditing(d)
    setForm({
      title: d.title, due_date: d.due_date.split('T')[0],
      category: d.category as typeof CATEGORIES[number],
      priority: d.priority as typeof PRIORITIES[number],
      notes: d.notes || '', recurring: d.recurring,
    })
    setShowForm(true)
  }

  function closeForm() { setShowForm(false); resetForm() }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const payload = {
      user_id: userId, title: form.title, due_date: form.due_date,
      category: form.category, priority: form.priority, status: 'pending' as const,
      recurring: form.recurring, notes: form.notes || null,
    }
    if (editing) {
      const { data } = await supabase.from('deadlines').update(payload).eq('id', editing.id).select().single()
      if (data) setDeadlines(prev => prev.map(d => d.id === editing.id ? data : d))
    } else {
      const { data } = await supabase.from('deadlines').insert(payload).select().single()
      if (data) setDeadlines(prev => [data, ...prev])
    }
    setLoading(false)
    closeForm()
  }

  async function toggleComplete(deadline: Deadline) {
    const newStatus = deadline.status === 'completed' ? 'pending' : 'completed'
    const { data } = await supabase.from('deadlines').update({ status: newStatus }).eq('id', deadline.id).select().single()
    if (data) setDeadlines(prev => prev.map(d => d.id === deadline.id ? data : d))
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this deadline?')) return
    await supabase.from('deadlines').delete().eq('id', id)
    setDeadlines(prev => prev.filter(d => d.id !== id))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">Deadlines</h1>
          <p className="text-zinc-500 text-sm mt-1">
            {pending.length} pending{overdue.length > 0 && `, ${overdue.length} overdue`}
          </p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true) }}
          className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-violet-600 hover:opacity-90 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-opacity shadow-lg shadow-indigo-500/20"
        >
          <Plus className="w-4 h-4" />
          Add deadline
        </button>
      </div>

      {overdue.length > 0 && (
        <div className="flex items-center gap-3 p-4 rounded-xl border border-red-500/20 bg-red-500/[0.05]">
          <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
          <p className="text-sm text-red-300">{overdue.length} deadline{overdue.length > 1 ? 's are' : ' is'} overdue and need your attention</p>
        </div>
      )}

      {/* Filter pills */}
      <div className="flex gap-2 flex-wrap">
        {(['all', 'pending', 'overdue', 'completed'] as const).map(f => (
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
            {f === 'overdue' && overdue.length > 0 && (
              <span className="ml-1.5 bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded-full text-[10px]">{overdue.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className={`rounded-xl py-20 px-8 text-center ${glass}`}>
          <div className="w-16 h-16 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-center mx-auto mb-5">
            <Calendar className="w-8 h-8 text-zinc-800" />
          </div>
          <h3 className="text-base font-bold text-zinc-300 mb-2">Nothing here yet</h3>
          <p className="text-sm text-zinc-600 mb-6 max-w-xs mx-auto">Add deadlines to stay on top of important dates and tasks.</p>
          <button
            onClick={() => { resetForm(); setShowForm(true) }}
            className="bg-gradient-to-r from-indigo-500 to-violet-600 hover:opacity-90 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-opacity"
          >
            Add your first deadline
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(d => {
            const days = getDaysUntil(d.due_date)
            const isOverdue = d.status === 'pending' && isBefore(new Date(d.due_date), now)
            return (
              <motion.div
                key={d.id}
                layout
                className={cn(
                  'flex items-center gap-4 p-4 rounded-xl border transition-all group',
                  d.status === 'completed'
                    ? 'border-white/[0.04] bg-[#0d0d12] opacity-60'
                    : isOverdue
                    ? 'border-red-500/20 bg-red-500/[0.04] hover:bg-red-500/[0.06]'
                    : 'border-white/[0.06] bg-[#111118] hover:bg-white/[0.03] hover:border-white/[0.09]'
                )}
              >
                <button
                  onClick={() => toggleComplete(d)}
                  className={cn(
                    'w-5 h-5 rounded-full border-2 shrink-0 transition-all flex items-center justify-center',
                    d.status === 'completed'
                      ? 'border-emerald-400 bg-emerald-400/20'
                      : 'border-zinc-700 hover:border-emerald-400'
                  )}
                  aria-label={d.status === 'completed' ? 'Mark pending' : 'Mark complete'}
                >
                  {d.status === 'completed' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={cn('text-sm font-medium', d.status === 'completed' ? 'line-through text-zinc-500' : 'text-zinc-200')}>{d.title}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${getPriorityBadge(d.priority)}`}>{d.priority}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${getCategoryColor(d.category)}`}>{d.category}</span>
                    {d.recurring && <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20">recurring</span>}
                  </div>
                  <p className="text-xs text-zinc-600 mt-0.5">{formatDate(d.due_date)}</p>
                </div>
                <span className={cn('text-xs font-mono font-bold shrink-0', d.status === 'completed' ? 'text-zinc-600' : getUrgencyColor(days))}>
                  {d.status === 'completed' ? 'Done' : isOverdue ? `${Math.abs(days)}d ago` : days === 0 ? 'Today' : `${days}d`}
                </span>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(d)} className="p-1.5 rounded-lg hover:bg-white/[0.08] text-zinc-600 hover:text-zinc-200 transition-colors" aria-label="Edit"><Edit2 className="w-3.5 h-3.5" /></button>
                  <button onClick={() => handleDelete(d.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-zinc-600 hover:text-red-400 transition-colors" aria-label="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
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
                <h2 className="text-sm font-semibold text-zinc-100">{editing ? 'Edit deadline' : 'New deadline'}</h2>
                <button onClick={closeForm} className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.06] transition-all"><X className="w-4 h-4" /></button>
              </div>
              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto flex flex-col">
                <div className="px-6 py-5 space-y-4 flex-1">
                  <div>
                    <label className={labelCls}>Title *</label>
                    <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required placeholder="Tax return filing, License renewal..." className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Due date *</label>
                    <input type="date" value={form.due_date} onChange={e => setForm(p => ({ ...p, due_date: e.target.value }))} required className={inputCls} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}>Priority</label>
                      <select value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value as typeof PRIORITIES[number] }))} className={inputCls}>
                        {PRIORITIES.map(p => <option key={p} value={p} className="bg-[#111118] capitalize">{p}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>Category</label>
                      <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value as typeof CATEGORIES[number] }))} className={inputCls}>
                        {CATEGORIES.map(c => <option key={c} value={c} className="bg-[#111118] capitalize">{c}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>Notes</label>
                    <textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} rows={3} placeholder="Optional notes..." className={inputCls + ' resize-none'} />
                  </div>
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input type="checkbox" checked={form.recurring} onChange={e => setForm(p => ({ ...p, recurring: e.target.checked }))} className="w-4 h-4 rounded border-white/20 bg-white/[0.03] accent-indigo-500" />
                    <span className="text-sm text-zinc-400">Recurring deadline</span>
                  </label>
                </div>
                <div className="px-6 py-4 border-t border-white/[0.06] flex gap-3 justify-end shrink-0">
                  <button type="button" onClick={closeForm} className="px-4 py-2 text-sm text-zinc-500 hover:text-zinc-200 transition-colors">Cancel</button>
                  <button type="submit" disabled={loading} className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-violet-600 hover:opacity-90 disabled:opacity-50 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-opacity">
                    {loading && <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                    {editing ? 'Save changes' : 'Add deadline'}
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
