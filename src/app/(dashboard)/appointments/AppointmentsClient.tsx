'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import type { Appointment } from '@/types'
import { Plus, Clock, Trash2, Edit2, MapPin, Calendar, X } from 'lucide-react'
import { isAfter, isBefore, format } from 'date-fns'
import { motion, AnimatePresence } from 'framer-motion'
import { staggerContainer, fadeUp, spring } from '@/lib/motion'

type Props = { initialData: Appointment[]; userId: string }

const glass = 'bg-[#111118] border border-white/[0.06]'
const inputCls = 'w-full px-3 py-2.5 rounded-lg bg-white/[0.03] border border-white/[0.08] text-zinc-100 placeholder-zinc-700 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/30 transition-all text-sm'
const labelCls = 'block text-xs font-medium text-zinc-500 mb-1.5 uppercase tracking-wide'

export function AppointmentsClient({ initialData, userId }: Props) {
  const [apts, setApts] = useState<Appointment[]>(initialData)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Appointment | null>(null)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ title: '', date_time: '', location: '', notes: '' })
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming')

  const supabase = createClient()
  const now = new Date()
  const upcoming = apts.filter(a => isAfter(new Date(a.date_time), now))
  const past = apts.filter(a => isBefore(new Date(a.date_time), now))
  const displayed = tab === 'upcoming' ? upcoming : past

  function resetForm() { setForm({ title: '', date_time: '', location: '', notes: '' }); setEditing(null) }

  function openEdit(a: Appointment) {
    setEditing(a)
    const dt = new Date(a.date_time)
    const localDt = format(dt, "yyyy-MM-dd'T'HH:mm")
    setForm({ title: a.title, date_time: localDt, location: a.location || '', notes: a.notes || '' })
    setShowForm(true)
  }

  function closeForm() { setShowForm(false); resetForm() }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const payload = { user_id: userId, title: form.title, date_time: form.date_time, location: form.location || null, notes: form.notes || null, reminder_sent: false }
    if (editing) {
      const { data } = await supabase.from('appointments').update(payload).eq('id', editing.id).select().single()
      if (data) setApts(prev => prev.map(a => a.id === editing.id ? data : a))
    } else {
      const { data } = await supabase.from('appointments').insert(payload).select().single()
      if (data) setApts(prev => [...prev, data].sort((a, b) => new Date(a.date_time).getTime() - new Date(b.date_time).getTime()))
    }
    setLoading(false); closeForm()
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this appointment?')) return
    await supabase.from('appointments').delete().eq('id', id)
    setApts(prev => prev.filter(a => a.id !== id))
  }

  return (
    <div className="space-y-6">
      <motion.div className="flex items-center justify-between" variants={fadeUp} initial="hidden" animate="show">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">Appointments</h1>
          <p className="text-zinc-500 text-sm mt-1">{upcoming.length} upcoming</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true) }}
          className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-violet-600 hover:opacity-90 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-opacity shadow-lg shadow-indigo-500/20"
        >
          <Plus className="w-4 h-4" />
          Add appointment
        </button>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2">
        {(['upcoming', 'past'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'px-3 py-1.5 rounded-full text-xs font-medium transition-all capitalize',
              tab === t
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                : 'bg-white/[0.03] text-zinc-500 border border-white/[0.06] hover:text-zinc-300 hover:border-white/[0.1]'
            )}
          >
            {t} ({t === 'upcoming' ? upcoming.length : past.length})
          </button>
        ))}
      </div>

      {/* List */}
      {displayed.length === 0 ? (
        <div className={`rounded-xl py-20 px-8 text-center ${glass}`}>
          <div className="w-16 h-16 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-center mx-auto mb-5">
            <Clock className="w-8 h-8 text-zinc-800" />
          </div>
          <h3 className="text-base font-bold text-zinc-300 mb-2">Nothing here yet</h3>
          <p className="text-sm text-zinc-600 mb-6 max-w-xs mx-auto">Schedule appointments to keep track of your upcoming commitments.</p>
          {tab === 'upcoming' && (
            <button
              onClick={() => { resetForm(); setShowForm(true) }}
              className="bg-gradient-to-r from-indigo-500 to-violet-600 hover:opacity-90 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-opacity"
            >
              Schedule one
            </button>
          )}
        </div>
      ) : (
        <motion.div className="space-y-2" variants={staggerContainer(0.04, 0.1)} initial="hidden" animate="show">
          {displayed.map(a => {
            const dt = new Date(a.date_time)
            return (
              <motion.div
                key={a.id}
                layout
                variants={fadeUp}
                className={`flex items-start gap-4 p-4 rounded-xl border border-white/[0.06] bg-[#111118] hover:bg-white/[0.03] hover:border-white/[0.09] transition-all group`}
              >
                <div className="text-center bg-violet-500/10 border border-violet-500/20 rounded-xl px-3 py-2 shrink-0 min-w-[48px]">
                  <p className="text-[10px] text-violet-400 font-semibold uppercase tracking-wide">{format(dt, 'MMM')}</p>
                  <p className="text-xl font-bold text-violet-300 leading-tight">{format(dt, 'd')}</p>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-200">{a.title}</p>
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    <span className="flex items-center gap-1 text-xs text-zinc-500">
                      <Calendar className="w-3 h-3" />{format(dt, 'h:mm a')}
                    </span>
                    {a.location && (
                      <span className="flex items-center gap-1 text-xs text-zinc-500">
                        <MapPin className="w-3 h-3" />{a.location}
                      </span>
                    )}
                  </div>
                  {a.notes && <p className="text-xs text-zinc-600 mt-1">{a.notes}</p>}
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <button onClick={() => openEdit(a)} className="p-1.5 rounded-lg hover:bg-white/[0.08] text-zinc-600 hover:text-zinc-200 transition-colors" aria-label="Edit"><Edit2 className="w-3.5 h-3.5" /></button>
                  <button onClick={() => handleDelete(a.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-zinc-600 hover:text-red-400 transition-colors" aria-label="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
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
                <h2 className="text-sm font-semibold text-zinc-100">{editing ? 'Edit appointment' : 'New appointment'}</h2>
                <button onClick={closeForm} className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.06] transition-all"><X className="w-4 h-4" /></button>
              </div>
              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto flex flex-col">
                <div className="px-6 py-5 space-y-4 flex-1">
                  <div>
                    <label className={labelCls}>Title *</label>
                    <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required placeholder="Doctor checkup, Dentist..." className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Date and time *</label>
                    <input type="datetime-local" value={form.date_time} onChange={e => setForm(p => ({ ...p, date_time: e.target.value }))} required className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Location</label>
                    <input value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} placeholder="123 Main St, Room 4B" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Notes</label>
                    <textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} rows={3} placeholder="Bring insurance card, fasting required..." className={inputCls + ' resize-none'} />
                  </div>
                </div>
                <div className="px-6 py-4 border-t border-white/[0.06] flex gap-3 justify-end shrink-0">
                  <button type="button" onClick={closeForm} className="px-4 py-2 text-sm text-zinc-500 hover:text-zinc-200 transition-colors">Cancel</button>
                  <button type="submit" disabled={loading} className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-violet-600 hover:opacity-90 disabled:opacity-50 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-opacity">
                    {loading && <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                    {editing ? 'Save changes' : 'Add appointment'}
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
