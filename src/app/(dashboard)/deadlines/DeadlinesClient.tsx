'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatDate, getDaysUntil, getUrgencyColor, getPriorityBadge, getCategoryColor, cn } from '@/lib/utils'
import type { Deadline } from '@/types'
import { Plus, Calendar, Trash2, Edit2, CheckCircle2, AlertTriangle } from 'lucide-react'
import { isBefore } from 'date-fns'

const CATEGORIES = ['school', 'personal', 'work', 'financial', 'medical', 'government', 'other'] as const
const PRIORITIES = ['critical', 'high', 'medium', 'low'] as const

type Props = { initialData: Deadline[]; userId: string }

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const payload = {
      user_id: userId,
      title: form.title,
      due_date: form.due_date,
      category: form.category,
      priority: form.priority,
      status: 'pending' as const,
      recurring: form.recurring,
      notes: form.notes || null,
    }

    if (editing) {
      const { data } = await supabase.from('deadlines').update(payload).eq('id', editing.id).select().single()
      if (data) setDeadlines(prev => prev.map(d => d.id === editing.id ? data : d))
    } else {
      const { data } = await supabase.from('deadlines').insert(payload).select().single()
      if (data) setDeadlines(prev => [data, ...prev])
    }
    setLoading(false)
    setShowForm(false)
    resetForm()
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
          <h1 className="text-2xl font-bold text-white">Deadlines</h1>
          <p className="text-slate-400 text-sm mt-1">
            {pending.length} pending{overdue.length > 0 && `, ${overdue.length} overdue`}
          </p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true) }}
          className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all hover:-translate-y-0.5"
        >
          <Plus className="w-4 h-4" />
          Add deadline
        </button>
      </div>

      {overdue.length > 0 && (
        <div className="flex items-center gap-3 p-4 rounded-xl border border-red-500/20 bg-red-500/5">
          <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
          <p className="text-sm text-red-300">{overdue.length} deadline{overdue.length > 1 ? 's are' : ' is'} overdue and need your attention</p>
        </div>
      )}

      <div className="flex gap-2 flex-wrap">
        {(['all', 'pending', 'overdue', 'completed'] as const).map(f => (
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
            {f === 'overdue' && overdue.length > 0 && (
              <span className="ml-1.5 bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded-full text-[10px]">{overdue.length}</span>
            )}
          </button>
        ))}
      </div>

      {showForm && (
        <div className="rounded-xl border border-indigo-500/20 bg-[#111827] p-6">
          <h2 className="text-sm font-semibold text-slate-200 mb-4">{editing ? 'Edit deadline' : 'New deadline'}</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Title *</label>
              <input
                value={form.title}
                onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                required
                placeholder="Tax return filing, License renewal..."
                className="w-full px-3 py-2 rounded-lg bg-[#161b2e] border border-white/[0.08] text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Due date *</label>
              <input
                type="date"
                value={form.due_date}
                onChange={e => setForm(p => ({ ...p, due_date: e.target.value }))}
                required
                className="w-full px-3 py-2 rounded-lg bg-[#161b2e] border border-white/[0.08] text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Priority</label>
              <select
                value={form.priority}
                onChange={e => setForm(p => ({ ...p, priority: e.target.value as typeof PRIORITIES[number] }))}
                className="w-full px-3 py-2 rounded-lg bg-[#161b2e] border border-white/[0.08] text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 text-sm"
              >
                {PRIORITIES.map(p => <option key={p} value={p} className="bg-[#161b2e] capitalize">{p}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Category</label>
              <select
                value={form.category}
                onChange={e => setForm(p => ({ ...p, category: e.target.value as typeof CATEGORIES[number] }))}
                className="w-full px-3 py-2 rounded-lg bg-[#161b2e] border border-white/[0.08] text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 text-sm"
              >
                {CATEGORIES.map(c => <option key={c} value={c} className="bg-[#161b2e] capitalize">{c}</option>)}
              </select>
            </div>
            <div>
              <label className="flex items-center gap-2 cursor-pointer mt-6">
                <input
                  type="checkbox"
                  checked={form.recurring}
                  onChange={e => setForm(p => ({ ...p, recurring: e.target.checked }))}
                  className="w-4 h-4 rounded border-white/20 bg-[#161b2e] text-indigo-500"
                />
                <span className="text-sm text-slate-300">Recurring deadline</span>
              </label>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Notes</label>
              <textarea
                value={form.notes}
                onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                rows={2}
                placeholder="Optional notes..."
                className="w-full px-3 py-2 rounded-lg bg-[#161b2e] border border-white/[0.08] text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 text-sm resize-none"
              />
            </div>
            <div className="sm:col-span-2 flex gap-3 justify-end">
              <button type="button" onClick={() => { setShowForm(false); resetForm() }} className="px-4 py-2 text-sm text-slate-400 hover:text-slate-200 transition-colors">Cancel</button>
              <button type="submit" disabled={loading} className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-400 disabled:opacity-60 text-white px-5 py-2 rounded-lg text-sm font-medium transition-all">
                {loading && <span className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />}
                {editing ? 'Save changes' : 'Add deadline'}
              </button>
            </div>
          </form>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="text-center py-16 rounded-xl border border-white/[0.06] bg-[#111827]">
          <Calendar className="w-10 h-10 text-indigo-400/30 mx-auto mb-3" />
          <p className="text-slate-400 text-sm mb-4">No deadlines here</p>
          <button onClick={() => { resetForm(); setShowForm(true) }} className="text-indigo-400 hover:text-indigo-300 text-sm">Add your first deadline</button>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((d) => {
            const days = getDaysUntil(d.due_date)
            const isOverdue = d.status === 'pending' && isBefore(new Date(d.due_date), now)
            return (
              <div key={d.id} className={cn("flex items-center gap-4 p-4 rounded-xl border transition-colors group", d.status === 'completed' ? 'border-white/[0.04] bg-[#0e1322] opacity-60' : isOverdue ? 'border-red-500/20 bg-red-500/5' : 'border-white/[0.06] bg-[#111827] hover:bg-[#141a2e]')}>
                <button
                  onClick={() => toggleComplete(d)}
                  className={cn("w-5 h-5 rounded-full border-2 shrink-0 transition-colors", d.status === 'completed' ? 'border-emerald-400 bg-emerald-400/20' : 'border-slate-600 hover:border-emerald-400')}
                  aria-label={d.status === 'completed' ? 'Mark pending' : 'Mark complete'}
                >
                  {d.status === 'completed' && <CheckCircle2 className="w-full h-full text-emerald-400" />}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={cn("text-sm font-medium", d.status === 'completed' ? 'line-through text-slate-500' : 'text-slate-200')}>{d.title}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${getPriorityBadge(d.priority)} border`}>{d.priority}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${getCategoryColor(d.category)}`}>{d.category}</span>
                    {d.recurring && <span className="text-xs px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400">recurring</span>}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{formatDate(d.due_date)}</p>
                </div>
                <span className={cn("text-xs font-mono font-bold shrink-0", d.status === 'completed' ? 'text-slate-500' : getUrgencyColor(days))}>
                  {d.status === 'completed' ? 'Done' : isOverdue ? `${Math.abs(days)}d ago` : days === 0 ? 'Today' : `${days}d`}
                </span>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(d)} className="p-1.5 rounded-lg hover:bg-white/[0.08] text-slate-500 hover:text-slate-200 transition-colors" aria-label="Edit"><Edit2 className="w-3.5 h-3.5" /></button>
                  <button onClick={() => handleDelete(d.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition-colors" aria-label="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
