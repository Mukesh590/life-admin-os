'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { formatDate, getDaysUntil, getPriorityBadge, getCategoryColor, cn } from '@/lib/utils'
import type { Deadline, ItemActivityEvent } from '@/types'
import { Plus, Calendar, Trash2, Edit2, CheckCircle2, AlertTriangle, X, Columns3, List, ArrowLeft, ArrowRight } from 'lucide-react'
import { isBefore } from 'date-fns'
import { motion, AnimatePresence } from 'framer-motion'
import { staggerContainer, fadeUp, spring } from '@/lib/motion'
import { UrgencyBadge } from '@/components/dashboard/UrgencyBadge'

const CATEGORIES = ['school', 'personal', 'work', 'financial', 'medical', 'government', 'other'] as const
const PRIORITIES = ['critical', 'high', 'medium', 'low'] as const

type Props = {
  initialData: Deadline[]
  initialActivityEvents: ItemActivityEvent[]
  featureStorageReady: boolean
  userId: string
}

const glass = 'bg-[#111118] border border-white/[0.06]'
const inputCls = 'w-full px-3 py-2.5 rounded-lg bg-white/[0.03] border border-white/[0.08] text-zinc-100 placeholder-zinc-700 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/30 transition-all text-sm'
const labelCls = 'block text-xs font-medium text-zinc-500 mb-1.5 uppercase tracking-wide'

export function DeadlinesClient({ initialData, initialActivityEvents, featureStorageReady, userId }: Props) {
  const searchParams = useSearchParams()
  const [deadlines, setDeadlines] = useState<Deadline[]>(initialData)
  const [activityEvents, setActivityEvents] = useState<ItemActivityEvent[]>(initialActivityEvents)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Deadline | null>(null)
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed' | 'overdue'>('all')
  const [view, setView] = useState<'list' | 'kanban'>('list')
  const [featureMessage, setFeatureMessage] = useState<string | null>(null)

  const [form, setForm] = useState({
    title: '', due_date: '', category: 'personal' as typeof CATEGORIES[number],
    priority: 'medium' as typeof PRIORITIES[number], notes: '', recurring: false,
  })

  useEffect(() => {
    const title = searchParams.get('captureTitle')
    if (!title || searchParams.get('captureTarget') !== 'deadline') return
    setForm(current => ({
      ...current,
      title,
      notes: searchParams.get('captureNote') || '',
      due_date: searchParams.get('captureDue') || '',
    }))
    setShowForm(true)
  }, [searchParams])

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
      category: form.category, priority: form.priority, status: editing?.status ?? 'pending' as const,
      recurring: form.recurring, notes: form.notes || null,
    }
    if (editing) {
      const { data } = await supabase.from('deadlines').update(payload).eq('id', editing.id).select().single()
      if (data) setDeadlines(prev => prev.map(d => d.id === editing.id ? data : d))
      if (data && new Date(form.due_date) > new Date(editing.due_date)) {
        const { data: eventData, error } = await supabase.from('item_activity_events').insert({
          user_id: userId,
          item_type: 'deadline',
          item_id: editing.id,
          event_type: 'postponed',
          from_due_at: editing.due_date,
          to_due_at: form.due_date,
        }).select().single()
        if (eventData) setActivityEvents(events => [eventData as ItemActivityEvent, ...events])
        if (error) setFeatureMessage('Deadline saved. Schedule history will begin after the productivity migration is applied.')
      }
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
    if (newStatus === 'completed') {
      const { error } = await supabase.from('item_completion_events').upsert({
        user_id: userId,
        item_type: 'deadline',
        item_id: deadline.id,
        occurrence_date: deadline.due_date.split('T')[0],
        due_at: deadline.due_date,
      }, { onConflict: 'user_id,item_type,item_id,occurrence_date' })
      if (error) setFeatureMessage('Deadline completed. Streak history will begin after the productivity migration is applied.')
    } else {
      await supabase.from('item_completion_events').delete()
        .eq('user_id', userId)
        .eq('item_type', 'deadline')
        .eq('item_id', deadline.id)
        .eq('occurrence_date', deadline.due_date.split('T')[0])
    }
  }

  type WorkflowStatus = 'todo' | 'in_progress' | 'done'

  function workflowStatus(deadline: Deadline): WorkflowStatus {
    if (deadline.status === 'completed') return 'done'
    const latest = activityEvents.find(event =>
      event.item_id === deadline.id && event.event_type === 'workflow_status_changed'
    )
    const value = latest?.metadata?.to_status
    return value === 'in_progress' ? 'in_progress' : 'todo'
  }

  async function moveDeadline(deadline: Deadline, toStatus: WorkflowStatus) {
    if (toStatus === 'done' || deadline.status === 'completed') {
      const databaseStatus = toStatus === 'done' ? 'completed' : 'pending'
      const { data } = await supabase.from('deadlines').update({ status: databaseStatus }).eq('id', deadline.id).select().single()
      if (data) setDeadlines(items => items.map(item => item.id === deadline.id ? data : item))
    }
    const fromStatus = workflowStatus(deadline)
    const { data, error } = await supabase.from('item_activity_events').insert({
      user_id: userId,
      item_type: 'deadline',
      item_id: deadline.id,
      event_type: 'workflow_status_changed',
      metadata: { from_status: fromStatus, to_status: toStatus },
    }).select().single()
    if (data) setActivityEvents(events => [data as ItemActivityEvent, ...events])
    if (error && toStatus === 'in_progress') {
      setFeatureMessage('In Progress persistence requires the reviewed productivity migration.')
    }
    if (toStatus === 'done') {
      await supabase.from('item_completion_events').upsert({
        user_id: userId,
        item_type: 'deadline',
        item_id: deadline.id,
        occurrence_date: deadline.due_date.split('T')[0],
        due_at: deadline.due_date,
      }, { onConflict: 'user_id,item_type,item_id,occurrence_date' })
    }
  }

  function postponementLabel(deadline: Deadline) {
    const events = activityEvents.filter(event => event.item_id === deadline.id && event.event_type === 'postponed')
    if (events.length === 0) return null
    const totalDays = events.reduce((sum, event) => {
      if (!event.from_due_at || !event.to_due_at) return sum
      return sum + Math.max(0, Math.round((new Date(event.to_due_at).getTime() - new Date(event.from_due_at).getTime()) / 86400000))
    }, 0)
    return `Moved ${events.length}× · pushed ${Math.max(1, Math.round(totalDays / 7))}w`
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this deadline?')) return
    await supabase.from('deadlines').delete().eq('id', id)
    setDeadlines(prev => prev.filter(d => d.id !== id))
  }

  return (
    <div className="space-y-6">
      <motion.div className="flex items-center justify-between" variants={fadeUp} initial="hidden" animate="show">
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
      </motion.div>

      {overdue.length > 0 && (
        <div className="flex items-center gap-3 p-4 rounded-xl border border-red-500/20 bg-red-500/[0.05]">
          <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
          <p className="text-sm text-red-300">{overdue.length} deadline{overdue.length > 1 ? 's are' : ' is'} overdue and need your attention</p>
        </div>
      )}

      {featureMessage && (
        <div role="status" className="flex items-center justify-between gap-3 rounded-xl border border-amber-500/20 bg-amber-500/[0.05] p-4 text-sm text-amber-200">
          <span>{featureMessage}</span>
          <button onClick={() => setFeatureMessage(null)} className="rounded-lg px-2 py-1 hover:bg-white/[0.06] focus:outline-none focus:ring-2 focus:ring-amber-400">Dismiss</button>
        </div>
      )}

      {/* Filter pills */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2 flex-wrap">
          {(['all', 'pending', 'overdue', 'completed'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                'px-3 py-1.5 rounded-full text-xs font-medium transition-all capitalize focus:outline-none focus:ring-2 focus:ring-indigo-400',
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
        <div className="flex rounded-xl border border-white/[0.08] bg-white/[0.03] p-1" aria-label="Deadline view">
          <button
            onClick={() => setView('list')}
            className={cn('flex min-h-10 items-center gap-2 rounded-lg px-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-400', view === 'list' ? 'bg-white/[0.08] text-white' : 'text-zinc-500')}
            aria-pressed={view === 'list'}
          >
            <List className="h-4 w-4" /> List
          </button>
          <button
            onClick={() => setView('kanban')}
            className={cn('flex min-h-10 items-center gap-2 rounded-lg px-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-400', view === 'kanban' ? 'bg-white/[0.08] text-white' : 'text-zinc-500')}
            aria-pressed={view === 'kanban'}
          >
            <Columns3 className="h-4 w-4" /> Kanban
          </button>
        </div>
      </div>

      {/* List */}
      {view === 'list' && (filtered.length === 0 ? (
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
        <motion.div className="space-y-2" variants={staggerContainer(0.04, 0.1)} initial="hidden" animate="show">
          {filtered.map(d => {
            const isOverdue = d.status === 'pending' && isBefore(new Date(d.due_date), now)
            return (
              <motion.div
                key={d.id}
                layout
                variants={fadeUp}
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
                    {postponementLabel(d) && <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">{postponementLabel(d)}</span>}
                  </div>
                  <p className="text-xs text-zinc-600 mt-0.5">{formatDate(d.due_date)}</p>
                </div>
                <UrgencyBadge date={d.due_date} complete={d.status === 'completed'} className="shrink-0" />
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(d)} className="p-1.5 rounded-lg hover:bg-white/[0.08] text-zinc-600 hover:text-zinc-200 transition-colors" aria-label="Edit"><Edit2 className="w-3.5 h-3.5" /></button>
                  <button onClick={() => handleDelete(d.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-zinc-600 hover:text-red-400 transition-colors" aria-label="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      ))}

      {view === 'kanban' && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {([
            { key: 'todo' as const, label: 'To Do' },
            { key: 'in_progress' as const, label: 'In Progress' },
            { key: 'done' as const, label: 'Done' },
          ]).map((column, columnIndex) => {
            const columnItems = filtered.filter(deadline => workflowStatus(deadline) === column.key)
            return (
              <section key={column.key} aria-labelledby={`kanban-${column.key}`} className="min-h-[240px] rounded-2xl border border-white/[0.06] bg-[#111118] p-3">
                <div className="mb-3 flex items-center justify-between px-1">
                  <h2 id={`kanban-${column.key}`} className="text-sm font-bold text-zinc-200">{column.label}</h2>
                  <span className="rounded-full bg-white/[0.06] px-2 py-1 text-[10px] font-bold text-zinc-400">{columnItems.length}</span>
                </div>
                <div className="space-y-2">
                  {columnItems.length === 0 ? (
                    <p className="rounded-xl border border-dashed border-white/[0.08] p-4 text-center text-xs text-zinc-600">
                      {column.key === 'done' ? 'Completed items will collect here.' : 'No items in this stage.'}
                    </p>
                  ) : columnItems.map(deadline => {
                    const days = getDaysUntil(deadline.due_date)
                    const isOverdue = deadline.status !== 'completed' && days < 0
                    return (
                      <article key={deadline.id} className="rounded-xl border border-white/[0.07] bg-black/20 p-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h3 className="truncate text-sm font-semibold text-zinc-100">{deadline.title}</h3>
                            <p className={cn('mt-1 text-xs', isOverdue ? 'text-red-300' : 'text-zinc-500')}>
                              {isOverdue ? `${Math.abs(days)}d overdue` : formatDate(deadline.due_date)}
                            </p>
                          </div>
                          <button onClick={() => openEdit(deadline)} className="rounded-lg p-2 text-zinc-500 hover:bg-white/[0.06] hover:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-400" aria-label={`Edit ${deadline.title}`}>
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${getPriorityBadge(deadline.priority)}`}>{deadline.priority}</span>
                          {postponementLabel(deadline) && <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">{postponementLabel(deadline)}</span>}
                        </div>
                        <div className="mt-3 flex items-center justify-between gap-2">
                          <button
                            onClick={() => moveDeadline(deadline, columnIndex === 1 ? 'todo' : 'in_progress')}
                            disabled={columnIndex === 0 || (!featureStorageReady && columnIndex === 2)}
                            className="grid min-h-10 min-w-10 place-items-center rounded-lg border border-white/[0.08] text-zinc-400 hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-30 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                            aria-label={`Move ${deadline.title} left`}
                          >
                            <ArrowLeft className="h-4 w-4" />
                          </button>
                          <span className="text-[10px] font-semibold uppercase tracking-wide text-zinc-600">{column.label}</span>
                          <button
                            onClick={() => moveDeadline(deadline, columnIndex === 0 ? 'in_progress' : 'done')}
                            disabled={columnIndex === 2 || (!featureStorageReady && columnIndex === 0)}
                            className="grid min-h-10 min-w-10 place-items-center rounded-lg border border-white/[0.08] text-zinc-400 hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-30 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                            aria-label={`Move ${deadline.title} right`}
                          >
                            <ArrowRight className="h-4 w-4" />
                          </button>
                        </div>
                      </article>
                    )
                  })}
                </div>
              </section>
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
              transition={spring.soft}
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
