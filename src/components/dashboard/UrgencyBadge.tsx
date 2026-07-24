import { AlertTriangle, CheckCircle2, Clock3 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getUrgencyStatus, urgencyClasses } from '@/lib/life-admin'

export function UrgencyBadge({
  date,
  complete = false,
  className,
}: {
  date: string
  complete?: boolean
  className?: string
}) {
  if (complete) {
    return (
      <span className={cn('inline-flex items-center gap-1 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-2 py-1 text-[11px] font-bold text-emerald-300', className)}>
        <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
        Done
      </span>
    )
  }
  const urgency = getUrgencyStatus(date)
  const Icon = urgency.level === 'overdue' || urgency.level === 'red' ? AlertTriangle : Clock3
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-[11px] font-bold', urgencyClasses[urgency.level], className)}>
      <Icon className="h-3 w-3" aria-hidden="true" />
      {urgency.label}
    </span>
  )
}

