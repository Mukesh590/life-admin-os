import Link from 'next/link'
import { Brain, Shield, Lock, Eye, Trash2, Mail } from 'lucide-react'

export default function PrivacyPage() {
  return (
    <div className="min-h-[100dvh] bg-[#0b0f1a] text-slate-100">
      <nav className="border-b border-white/[0.06] px-6 h-14 flex items-center">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
            <Brain className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <span className="font-semibold text-slate-100 text-sm">Life Admin OS</span>
        </Link>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-16">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <Shield className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Privacy Policy</h1>
            <p className="text-slate-500 text-sm">Last updated: January 2025</p>
          </div>
        </div>

        <div className="space-y-8 text-slate-300">
          <section>
            <p className="text-slate-400 text-sm leading-relaxed">
              Life Admin OS is a personal project, not a commercial financial service. This policy describes what data we collect, how it is stored, and your rights regarding that data.
            </p>
          </section>

          {[
            {
              icon: Eye,
              title: "What data we collect",
              content: [
                "Information you enter yourself: subscription names and amounts, deadlines, document metadata, bills, appointments, and warranty details",
                "Files you upload: receipts, bills, insurance cards, warranty cards (stored securely in Supabase Storage)",
                "Account information: email address and the name you provide during signup",
                "We do NOT collect bank account numbers, credit card numbers, Social Security numbers, or any financial credentials",
              ],
            },
            {
              icon: Lock,
              title: "How your data is stored",
              content: [
                "All data is stored in Supabase, a secure cloud database provider",
                "Data is encrypted at rest using industry-standard encryption",
                "Row-level security (RLS) is enabled on all tables, meaning you can only access your own data",
                "Files are stored in Supabase Storage with secure, authenticated URLs",
              ],
            },
            {
              icon: Shield,
              title: "How your data is used",
              content: [
                "Your data is used exclusively to power the features you use: tracking subscriptions, deadlines, documents, etc.",
                "When you upload a document, it may be sent to Anthropic's Claude API for AI extraction of dates and amounts",
                "We do not sell, share, rent, or trade your data with any third parties",
                "We do not use your data for advertising or marketing purposes",
              ],
            },
            {
              icon: Trash2,
              title: "Your rights",
              content: [
                "You can export all your data at any time from the Settings page",
                "You can delete your entire account and all associated data from the Settings page",
                "Deletion is permanent and irreversible",
                "You can contact us to request a copy of your data or ask questions about what we store",
              ],
            },
          ].map(section => (
            <section key={section.title} className="rounded-xl border border-white/[0.06] bg-[#111827] p-6">
              <div className="flex items-center gap-3 mb-4">
                <section.icon className="w-5 h-5 text-indigo-400 shrink-0" />
                <h2 className="text-base font-semibold text-slate-200">{section.title}</h2>
              </div>
              <ul className="space-y-2">
                {section.content.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400/50 shrink-0 mt-2" />
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          ))}

          <section className="rounded-xl border border-white/[0.06] bg-[#111827] p-6">
            <div className="flex items-center gap-3 mb-4">
              <Mail className="w-5 h-5 text-indigo-400" />
              <h2 className="text-base font-semibold text-slate-200">Contact</h2>
            </div>
            <p className="text-sm text-slate-400">
              For any questions about this privacy policy or your data, contact:{' '}
              <a href="mailto:mukesen0204@gmail.com" className="text-indigo-400 hover:text-indigo-300">
                mukesen0204@gmail.com
              </a>
            </p>
            <p className="text-sm text-slate-500 mt-3">
              This is a personal, non-commercial project. It is not a regulated financial service. Do not use it to store sensitive financial credentials.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
