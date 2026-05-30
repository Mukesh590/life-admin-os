'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import type { Appointment } from '@/types'
import { Plus, Clock, Trash2, Edit2, MapPin, Calendar } from 'lucide-react'
import { isAfter, isBefore, format } from 'date-fns'

type Props = { initialData: Appointment[]; userId: string }

export function AppointmentsClient({ initialData, userId }: Props) {
  const [apts, setApts] = useState<Appointment[]>(initialData)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Appointment | null>(null)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ title: '', date_time: '', location: '', notes: '' })

  const supabase = createClient()
  const now = new Date()
  const upcoming = apts.filter(a => isAfter(new Date(a.date_time), now))
  const past = apts.filter(a => isBefore(new Date(a.date_time), now))
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming')
  const displayed = tab === 'upcoming' ? upcoming : past

  function resetForm() { setForm({ title: '', date_time: '', location: '', notes: '' }); setEditing(null) }

  function openEdit(a: Appointment) {
    setEditing(a)
    const dt = new Date(a.date_time)
    const localDt = format(dt, "yyyy-MM-dd'T'HH:mm")
    setForm({ title: a.title, date_time: localDt, location: a.location || '', notes: a.notes || '' })
    setShowForm(true)
  }

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
    setLoading(false); setShowForm(false); resetForm()
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this appointment?')) return
    await supabase.from('appointments').delete().eq('id', id)
    setApts(prev => prev.filter(a => a.id !== id))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Appointments</h1>
          <p className="text-slate-400 text-sm mt-1">{upcoming.length} upcoming</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true) }} className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all hover:-translate-y-0.5">
          <Plus className="w-4 h-4" />Add appointment
        </button>
      </div>

      <div className="flex gap-2">
        {(['upcoming', 'past'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={cn('px-3 py-1.5 rounded-full text-xs font-medium transition-colors capitalize', tab === t ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'bg-[#161b2e] text-slate-400 border border-white/[0.06] hover:text-slate-200')}>
            {t} ({t === 'upcoming' ? upcoming.length : past.length})
          </button>
        ))}
      </div>

      {showForm && (
        <div className="rounded-xl border border-indigo-500/20 bg-[#111827] p-6">
          <h2 className="text-sm font-semibold text-slate-200 mb-4">{editing ? 'Edit appointment' : 'New appointment'}</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Title *</label>
              <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required placeholder="Doctor checkup, Dentist..." className="w-full px-3 py-2 rounded-lg bg-[#161b2e] border border-white/[0.08] text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Date and time *</label>
              <input type="datetime-local" value={form.date_time} onChange={e => setForm(p => ({ ...p, date_time: e.target.value }))} required className="w-full px-3 py-2 rounded-lg bg-[#161b2e] border border-white/[0.08] text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Location</label>
              <input value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} placeholder="123 Main St, Room 4B" className="w-full px-3 py-2 rounded-lg bg-[#161b2e] border border-white/[0.08] text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 text-sm" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Notes</label>
              <textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} rows={2} placeholder="Bring insurance card, fasting required..." className="w-full px-3 py-2 rounded-lg bg-[#161b2e] border border-white/[0.08] text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 text-sm resize-none" />
            </div>
            <div className="sm:col-span-2 flex gap-3 justify-end">
              <button type="button" onClick={() => { setShowForm(false); resetForm() }} className="px-4 py-2 text-sm text-slate-400 hover:text-slate-200">Cancel</button>
              <button type="submit" disabled={loading} className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-400 disabled:opacity-60 text-white px-5 py-2 rounded-lg text-sm font-medium">
                {loading && <span className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />}
                {editing ? 'Save changes' : 'Add appointment'}
              </button>
            </div>
          </form>
        </div>
      )}

      {displayed.length === 0 ? (
        <div className="text-center py-16 rounded-xl border border-white/[0.06] bg-[#111827]">
          <Clock className="w-10 h-10 text-violet-400/30 mx-auto mb-3" />
          <p className="text-slate-400 text-sm mb-4">No {tab} appointments</p>
          {tab === 'upcoming' && <button onClick={() => { resetForm(); setShowForm(true) }} className="text-indigo-400 hover:text-indigo-300 text-sm">Schedule one</button>}
        </div>
      ) : (
        <div className="space-y-2">
          {displayed.map(a => {
            const dt = new Date(a.date_time)
            return (
              <div key={a.id} className="flex items-start gap-4 p-4 rounded-xl border border-white/[0.06] bg-[#111827] hover:bg-[#141a2e] transition-colors group">
                <div className="text-center bg-violet-500/10 border border-violet-500/20 rounded-xl px-3 py-2 shrink-0">
                  <p className="text-[10px] text-violet-400 font-medium uppercase">{format(dt, 'MMM')}</p>
                  <p className="text-xl font-bold text-violet-300 leading-none">{format(dt, 'd')}</p>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-200">{a.title}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="flex items-center gap-1 text-xs text-slate-500">
                      <Calendar className="w-3 h-3" />{format(dt, 'h:mm a')}
                    </span>
                    {a.location && (
                      <span className="flex items-center gap-1 text-xs text-slate-500">
                        <MapPin className="w-3 h-3" />{a.location}
                      </span>
                    )}
                  </div>
                  {a.notes && <p className="text-xs text-slate-500 mt-1">{a.notes}</p>}
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(a)} className="p-1.5 rounded-lg hover:bg-white/[0.08] text-slate-500 hover:text-slate-200" aria-label="Edit"><Edit2 className="w-3.5 h-3.5" /></button>
                  <button onClick={() => handleDelete(a.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-slate-500 hover:text-red-400" aria-label="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
