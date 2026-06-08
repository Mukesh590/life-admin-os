'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatDate, getCategoryColor } from '@/lib/utils'
import type { Document as DocType, AIExtractionResult } from '@/types'
import { Upload, FileText, Brain, Trash2, CheckCircle2, AlertCircle, Search, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

type Props = { initialData: DocType[]; userId: string }

const glass = 'bg-[#111118] border border-white/[0.06]'

export function DocumentsClient({ initialData, userId }: Props) {
  const [docs, setDocs] = useState<DocType[]>(initialData)
  const [uploading, setUploading] = useState(false)
  const [extracting, setExtracting] = useState(false)
  const [extraction, setExtraction] = useState<AIExtractionResult | null>(null)
  const [showConfirm, setShowConfirm] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<{ url: string; name: string } | null>(null)
  const [search, setSearch] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const supabase = createClient()

  const filtered = docs.filter(d =>
    !search || d.file_name.toLowerCase().includes(search.toLowerCase())
    || d.vendor_name?.toLowerCase().includes(search.toLowerCase())
    || d.document_type.toLowerCase().includes(search.toLowerCase())
  )

  async function processFile(file: File) {
    if (file.size > 10 * 1024 * 1024) { setError('File must be under 10MB'); return }
    if (!['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'].includes(file.type)) {
      setError('Only PNG, JPG, JPEG, and PDF files are accepted')
      return
    }
    setError(null)
    setUploading(true)
    const ext = file.name.split('.').pop()
    const path = `${userId}/${Date.now()}.${ext}`
    const { error: uploadErr } = await supabase.storage.from('documents').upload(path, file, { contentType: file.type })
    if (uploadErr) { setError('Upload failed: ' + uploadErr.message); setUploading(false); return }
    const { data: { publicUrl } } = supabase.storage.from('documents').getPublicUrl(path)
    setUploadedFile({ url: publicUrl, name: file.name })
    setUploading(false)
    setExtracting(true)
    try {
      const reader = new FileReader()
      reader.onload = async () => {
        const base64 = (reader.result as string).split(',')[1]
        const res = await fetch('/api/extract', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ base64, mediaType: file.type, fileUrl: publicUrl }),
        })
        if (res.ok) {
          const data = await res.json()
          setExtraction(data)
          setShowConfirm(true)
        }
      }
      reader.readAsDataURL(file)
    } catch {
      setExtraction(null)
      setShowConfirm(true)
    } finally {
      setExtracting(false)
    }
    if (fileRef.current) fileRef.current.value = ''
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) await processFile(file)
  }

  async function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) await processFile(file)
  }

  async function saveDocument() {
    if (!uploadedFile) return
    const payload = {
      user_id: userId,
      file_url: uploadedFile.url,
      file_name: uploadedFile.name,
      document_type: extraction?.document_type || 'other',
      vendor_name: extraction?.vendor_name || null,
      amount: extraction?.amount || null,
      key_date: extraction?.key_date || null,
      expiry_date: extraction?.expiry_date || null,
      description: extraction?.description || null,
      category: extraction?.category || 'other',
      ai_extracted: !!extraction,
      confidence_score: extraction?.confidence_score || null,
    }
    const { data } = await supabase.from('documents').insert(payload).select().single()
    if (data) setDocs(prev => [data, ...prev])
    setShowConfirm(false)
    setExtraction(null)
    setUploadedFile(null)
  }

  async function handleDelete(doc: DocType) {
    if (!confirm('Delete this document?')) return
    const path = doc.file_url.split('/documents/')[1]
    if (path) await supabase.storage.from('documents').remove([path])
    await supabase.from('documents').delete().eq('id', doc.id)
    setDocs(prev => prev.filter(d => d.id !== doc.id))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">Documents</h1>
          <p className="text-zinc-500 text-sm mt-1">{docs.length} documents stored</p>
        </div>
        <button
          onClick={() => fileRef.current?.click()}
          disabled={uploading || extracting}
          className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-violet-600 hover:opacity-90 disabled:opacity-60 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-opacity shadow-lg shadow-indigo-500/20"
        >
          {uploading || extracting
            ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            : <Upload className="w-4 h-4" />
          }
          {uploading ? 'Uploading...' : extracting ? 'AI reading...' : 'Upload document'}
        </button>
        <input ref={fileRef} type="file" accept=".pdf,.png,.jpg,.jpeg" onChange={handleFileUpload} className="hidden" aria-label="Upload document" />
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl border border-red-500/20 bg-red-500/[0.05]">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          <p className="text-sm text-red-300">{error}</p>
          <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-300 transition-colors"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Drop zone */}
      {!showConfirm && (
        <div
          onClick={() => fileRef.current?.click()}
          onDragOver={e => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`rounded-xl p-8 text-center cursor-pointer transition-all border-2 border-dashed ${
            dragOver
              ? 'border-indigo-500/60 bg-indigo-500/[0.05]'
              : 'border-white/[0.08] hover:border-indigo-500/40 hover:bg-white/[0.02]'
          }`}
        >
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto mb-3">
            <Upload className="w-6 h-6 text-indigo-400" />
          </div>
          <p className="text-zinc-300 text-sm font-medium mb-1">Drop a file here or click to upload</p>
          <p className="text-zinc-600 text-xs">PDF, PNG, JPG up to 10MB · AI will automatically extract details</p>
        </div>
      )}

      {/* AI Extraction confirmation */}
      <AnimatePresence>
        {showConfirm && uploadedFile && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className={`rounded-xl p-6 ${glass}`}
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-lg bg-indigo-500/15 border border-indigo-500/20 flex items-center justify-center">
                <Brain className="w-4.5 h-4.5 text-indigo-400 w-[18px] h-[18px]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-zinc-100">AI Extraction Complete</p>
                <p className="text-xs text-zinc-500">{uploadedFile.name}</p>
              </div>
              {extraction && (
                <span className="ml-auto text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full font-mono">
                  {Math.round((extraction.confidence_score || 0) * 100)}% confident
                </span>
              )}
            </div>

            {extraction ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-5">
                {[
                  { label: 'Document type', value: extraction.document_type },
                  { label: 'Vendor/Provider', value: extraction.vendor_name || 'Unknown' },
                  { label: 'Amount', value: extraction.amount ? `${extraction.currency} ${extraction.amount}` : 'N/A' },
                  { label: 'Key date', value: extraction.key_date ? formatDate(extraction.key_date) : 'N/A' },
                  { label: 'Expiry', value: extraction.expiry_date ? formatDate(extraction.expiry_date) : 'N/A' },
                  { label: 'Category', value: extraction.category },
                ].map(row => (
                  <div key={row.label} className="bg-white/[0.03] rounded-lg p-3 border border-white/[0.05]">
                    <p className="text-[10px] text-zinc-600 mb-1 uppercase tracking-wide font-medium">{row.label}</p>
                    <p className="text-sm text-zinc-200 font-medium capitalize">{row.value}</p>
                  </div>
                ))}
                {extraction.description && (
                  <div className="col-span-2 sm:col-span-3 bg-white/[0.03] rounded-lg p-3 border border-white/[0.05]">
                    <p className="text-[10px] text-zinc-600 mb-1 uppercase tracking-wide font-medium">Description</p>
                    <p className="text-sm text-zinc-200">{extraction.description}</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-zinc-500 mb-5">AI extraction unavailable. Document will be saved as-is.</p>
            )}

            <div className="flex gap-3 justify-end">
              <button onClick={() => { setShowConfirm(false); setExtraction(null); setUploadedFile(null) }} className="px-4 py-2 text-sm text-zinc-500 hover:text-zinc-200 transition-colors">
                Discard
              </button>
              <button onClick={saveDocument} className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-violet-600 hover:opacity-90 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-opacity">
                <CheckCircle2 className="w-4 h-4" />
                Save document
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search documents..."
          className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white/[0.03] border border-white/[0.08] text-zinc-100 placeholder-zinc-700 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/30 transition-all text-sm"
        />
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className={`rounded-xl py-20 px-8 text-center ${glass}`}>
          <div className="w-16 h-16 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-center mx-auto mb-5">
            <FileText className="w-8 h-8 text-zinc-800" />
          </div>
          <h3 className="text-base font-bold text-zinc-300 mb-2">Nothing here yet</h3>
          <p className="text-sm text-zinc-600 mb-6 max-w-xs mx-auto">{search ? 'No documents match your search.' : 'Upload receipts, contracts, warranties — AI will extract the key details.'}</p>
          {!search && (
            <button onClick={() => fileRef.current?.click()} className="bg-gradient-to-r from-indigo-500 to-violet-600 hover:opacity-90 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-opacity">
              Upload first document
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map(doc => (
            <motion.div
              key={doc.id}
              layout
              className={`rounded-xl p-4 transition-all hover:border-white/[0.1] group ${glass}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 text-cyan-400" />
                </div>
                <div className="flex items-center gap-1.5">
                  {doc.ai_extracted && (
                    <span className="text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-1.5 py-0.5 rounded-full font-mono">AI</span>
                  )}
                  <button onClick={() => handleDelete(doc)} className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-500/10 text-zinc-600 hover:text-red-400 transition-all" aria-label="Delete document">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <p className="text-sm font-medium text-zinc-200 truncate mb-2">{doc.file_name}</p>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="text-[10px] capitalize text-zinc-500 bg-white/[0.03] border border-white/[0.06] px-2 py-0.5 rounded-full">{doc.document_type}</span>
                {doc.category && <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${getCategoryColor(doc.category)}`}>{doc.category}</span>}
              </div>
              {doc.vendor_name && <p className="text-xs text-zinc-600 mb-0.5">Vendor: <span className="text-zinc-400">{doc.vendor_name}</span></p>}
              {doc.amount && <p className="text-xs text-zinc-600 mb-0.5">Amount: <span className="text-zinc-400">${doc.amount}</span></p>}
              {doc.key_date && <p className="text-xs text-zinc-600 mb-0.5">Key date: <span className="text-zinc-400">{formatDate(doc.key_date)}</span></p>}
              {doc.expiry_date && <p className="text-xs text-amber-400 font-medium">Expires: {formatDate(doc.expiry_date)}</p>}
              <a href={doc.file_url} target="_blank" rel="noopener noreferrer" className="mt-3 text-xs text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1 transition-colors">
                View file
              </a>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
