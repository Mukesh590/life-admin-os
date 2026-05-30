import Link from "next/link"
import { Brain } from "lucide-react"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[100dvh] bg-[#09090b] flex flex-col relative overflow-hidden">
      {/* Background grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
        }}
      />
      {/* Gradient orb top */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none"
        style={{
          width: 600,
          height: 400,
          background: 'rgba(99,102,241,0.05)',
          filter: 'blur(120px)',
          borderRadius: '50%',
        }}
      />
      {/* Gradient orb bottom-right */}
      <div
        className="absolute bottom-0 right-0 pointer-events-none"
        style={{
          width: 400,
          height: 300,
          background: 'rgba(139,92,246,0.04)',
          filter: 'blur(100px)',
          borderRadius: '50%',
        }}
      />

      {/* Nav */}
      <nav className="relative z-10 p-6">
        <Link href="/" className="inline-flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center group-hover:bg-indigo-500/30 transition-colors">
            <Brain className="w-4 h-4 text-indigo-400" />
          </div>
          <span className="font-bold text-[#fafafa] tracking-tight text-sm">
            Admin<span className="text-indigo-400">OS</span>
          </span>
        </Link>
      </nav>

      {/* Content */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-6 py-12">
        <div
          className="w-full max-w-sm rounded-2xl p-8"
          style={{
            background: 'rgba(17,17,21,0.8)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 0 60px rgba(99,102,241,0.06)',
          }}
        >
          {children}
        </div>
      </div>
    </div>
  )
}
