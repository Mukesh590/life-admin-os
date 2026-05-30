'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatDate, getCategoryColor } from '@/lib/utils'
import type { Document as DocType, AIExtractionResult } from '@/types'
import { Upload, FileText, Brain, Trash2, CheckCircle2, AlertCircle, Search, X } from 'lucide-react'

type Props = { initialData: DocType[]; userId: string }

export function DocumentsClient({ initialData, userId }: Props) {
  const [docs, setDocs] = useState<DocType[]>(initialData)
  const [uploading, setUploading] = useState(false)
  const [extracting, setExtracting] = useState(false)
  const [extraction, setExtraction] = useState<AIExtractionResult | null>(null)
  const [showConfirm, setShowConfirm] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<{ url: string; name: string } | null>(null)
  const [search, setSearch] = useState('')
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const supabase = createClient()

  const filtered = docs.filter(d =>
    !search || d.file_name.toLowerCase().includes(search.toLowerCase())
    || d.vendor_name?.toLowerCase().includes(search.toLowerCase())
    || d.document_type.toLowerCase().includes(search.toLowerCase())
  )

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 10 * 1024 * 1024) { setError('File must be under 10MB'); return }
    if (!['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'].includes(file.type)) {
      setError('Only PNG, JPG, JPEG, and PDF files are accepted')
      return
    }
    setError(null)
    setUploading(true)

    const ext = file.name.split('.').pop()
    const path = `${userId}/${Date.now()}.${ext}`
    const { error: uploadErr } = await supabase.storage
      .from('documents')
      .upload(path, file, { contentType: file.type })

    if (uploadErr) { setError('Upload failed: ' + uploadErr.message); setUploading(false); return }

    const { data: { publicUrl } } = supabase.storage.from('documents').getPublicUrl(path)
    setUploadedFile({ url: publicUrl, name: file.name })
    setUploading(false)

    // AI extraction
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
    // Delete from storage
    const path = doc.file_url.split('/documents/')[1]
    if (path) await supabase.storage.from('documents').remove([path])
    await supabase.from('documents').delete().eq('id', doc.id)
    setDocs(prev => prev.filter(d => d.id !== doc.id))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Documents</h1>
          <p className="text-slate-400 text-sm mt-1">{docs.length} documents stored</p>
        </div>
        <button
          onClick={() => fileRef.current?.click()}
          disabled={uploading || extracting}
          className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-400 disabled:opacity-60 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all hover:-translate-y-0.5"
        >
          {uploading || extracting ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Upload className="w-4 h-4" />}
          {uploading ? 'Uploading...' : extracting ? 'AI reading...' : 'Upload document'}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept=".pdf,.png,.jpg,.jpeg"
          onChange={handleFileUpload}
          className="hidden"
          aria-label="Upload document"
        />
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl border border-red-500/20 bg-red-500/5">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          <p className="text-sm text-red-300">{error}</p>
          <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-300"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Upload drop zone */}
      {!showConfirm && (
        <div
          onClick={() => fileRef.current?.click()}
          className="border-2 border-dashed border-white/[0.1] hover:border-indigo-500/40 rounded-xl p-8 text-center cursor-pointer transition-colors"
        >
          <Upload className="w-8 h-8 text-indigo-400/50 mx-auto mb-3" />
          <p className="text-slate-400 text-sm mb-1">Drop a file here or click to upload</p>
          <p className="text-slate-600 text-xs">PDF, PNG, JPG up to 10MB. AI will automatically extract details.</p>
        </div>
      )}

      {/* AI Extraction confirmation */}
      {showConfirm && uploadedFile && (
        <div className="rounded-xl border border-indigo-500/20 bg-[#111827] p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/15 border border-indigo-500/20 flex items-center justify-center">
              <Brain className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-200">AI Extraction Complete</p>
              <p className="text-xs text-slate-500">{uploadedFile.name}</p>
            </div>
            {extraction && (
              <span className="ml-auto text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                {Math.round((extraction.confidence_score || 0) * 100)}% confident
              </span>
            )}
          </div>

          {extraction ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
              {[
                { label: 'Document type', value: extraction.document_type },
                { label: 'Vendor/Provider', value: extraction.vendor_name || 'Unknown' },
                { label: 'Amount', value: extraction.amount ? `${extraction.currency} ${extraction.amount}` : 'N/A' },
                { label: 'Key date', value: extraction.key_date ? formatDate(extraction.key_date) : 'N/A' },
                { label: 'Expiry', value: extraction.expiry_date ? formatDate(extraction.expiry_date) : 'N/A' },
                { label: 'Category', value: extraction.category },
              ].map(row => (
                <div key={row.label} className="bg-[#161b2e] rounded-lg p-3">
                  <p className="text-xs text-slate-500 mb-1">{row.label}</p>
                  <p className="text-sm text-slate-200 font-medium capitalize">{row.value}</p>
                </div>
              ))}
              {extraction.description && (
                <div className="col-span-2 sm:col-span-3 bg-[#161b2e] rounded-lg p-3">
                  <p className="text-xs text-slate-500 mb-1">Description</p>
                  <p className="text-sm text-slate-200">{extraction.description}</p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-slate-400 mb-5">AI extraction unavailable. Document will be saved as-is.</p>
          )}

          <div className="flex gap-3 justify-end">
            <button
              onClick={() => { setShowConfirm(false); setExtraction(null); setUploadedFile(null) }}
              className="px-4 py-2 text-sm text-slate-400 hover:text-slate-200 transition-colors"
            >
              Discard
            </button>
            <button
              onClick={saveDocument}
              className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-400 text-white px-5 py-2 rounded-lg text-sm font-medium transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              Save document
            </button>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search documents..."
          className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[#161b2e] border border-white/[0.08] text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 text-sm"
        />
      </div>

      {/* Documents grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 rounded-xl border border-white/[0.06] bg-[#111827]">
          <FileText className="w-10 h-10 text-cyan-400/30 mx-auto mb-3" />
          <p className="text-slate-400 text-sm mb-4">{search ? 'No documents match your search' : 'No documents yet'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((doc) => (
            <div key={doc.id} className="rounded-xl border border-white/[0.06] bg-[#111827] hover:bg-[#141a2e] transition-colors p-4 group">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 text-cyan-400" />
                </div>
                <div className="flex items-center gap-1.5">
                  {doc.ai_extracted && (
                    <span className="text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-1.5 py-0.5 rounded-full">AI</span>
                  )}
                  <button
                    onClick={() => handleDelete(doc)}
                    className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition-all"
                    aria-label="Delete document"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <p className="text-sm font-medium text-slate-200 truncate mb-1">{doc.file_name}</p>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs capitalize text-slate-400 bg-[#161b2e] px-2 py-0.5 rounded-full">{doc.document_type}</span>
                {doc.category && <span className={`text-xs px-2 py-0.5 rounded-full ${getCategoryColor(doc.category)}`}>{doc.category}</span>}
              </div>
              {doc.vendor_name && <p className="text-xs text-slate-500 mb-1">Vendor: {doc.vendor_name}</p>}
              {doc.amount && <p className="text-xs text-slate-500 mb-1">Amount: ${doc.amount}</p>}
              {doc.key_date && <p className="text-xs text-slate-500 mb-1">Key date: {formatDate(doc.key_date)}</p>}
              {doc.expiry_date && <p className="text-xs text-amber-400">Expires: {formatDate(doc.expiry_date)}</p>}
              <a
                href={doc.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
              >
                View file
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
