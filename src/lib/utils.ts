import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, formatDistanceToNow, differenceInDays, isAfter, isBefore, addDays } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatDate(date: string | Date): string {
  return format(new Date(date), 'MMM d, yyyy')
}

export function formatDateTime(date: string | Date): string {
  return format(new Date(date), 'MMM d, yyyy h:mm a')
}

export function formatRelative(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true })
}

export function getDaysUntil(date: string | Date): number {
  return differenceInDays(new Date(date), new Date())
}

export function isExpiringSoon(date: string | Date, daysThreshold = 7): boolean {
  const d = new Date(date)
  return isAfter(d, new Date()) && isBefore(d, addDays(new Date(), daysThreshold))
}

export function isOverdue(date: string | Date): boolean {
  return isBefore(new Date(date), new Date())
}

export function getUrgencyColor(daysUntil: number): string {
  if (daysUntil < 0) return 'text-red-400'
  if (daysUntil <= 1) return 'text-red-400'
  if (daysUntil <= 3) return 'text-rose-400'
  if (daysUntil <= 7) return 'text-amber-400'
  if (daysUntil <= 14) return 'text-yellow-400'
  return 'text-emerald-400'
}

export function getUrgencyBg(daysUntil: number): string {
  if (daysUntil < 0) return 'bg-red-500/10 border-red-500/20'
  if (daysUntil <= 1) return 'bg-red-500/10 border-red-500/20'
  if (daysUntil <= 3) return 'bg-rose-500/10 border-rose-500/20'
  if (daysUntil <= 7) return 'bg-amber-500/10 border-amber-500/20'
  if (daysUntil <= 14) return 'bg-yellow-500/10 border-yellow-500/20'
  return 'bg-emerald-500/10 border-emerald-500/20'
}

export function getPriorityColor(priority: string): string {
  const map: Record<string, string> = {
    critical: 'text-red-400',
    high: 'text-rose-400',
    medium: 'text-amber-400',
    low: 'text-emerald-400',
  }
  return map[priority] || 'text-muted-foreground'
}

export function getPriorityBadge(priority: string): string {
  const map: Record<string, string> = {
    critical: 'bg-red-500/15 text-red-400 border-red-500/20',
    high: 'bg-rose-500/15 text-rose-400 border-rose-500/20',
    medium: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
    low: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  }
  return map[priority] || 'bg-muted text-muted-foreground'
}

export function getCategoryColor(category: string): string {
  const map: Record<string, string> = {
    school: 'bg-blue-500/15 text-blue-400',
    personal: 'bg-purple-500/15 text-purple-400',
    work: 'bg-cyan-500/15 text-cyan-400',
    financial: 'bg-emerald-500/15 text-emerald-400',
    medical: 'bg-red-500/15 text-red-400',
    government: 'bg-amber-500/15 text-amber-400',
    other: 'bg-slate-500/15 text-slate-400',
    entertainment: 'bg-violet-500/15 text-violet-400',
    utilities: 'bg-orange-500/15 text-orange-400',
    insurance: 'bg-teal-500/15 text-teal-400',
    software: 'bg-indigo-500/15 text-indigo-400',
  }
  return map[category?.toLowerCase()] || 'bg-slate-500/15 text-slate-400'
}

export function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

export function truncate(str: string, n: number): string {
  return str.length > n ? str.slice(0, n - 1) + '...' : str
}

export function annualCost(amount: number, cycle: string): number {
  const multipliers: Record<string, number> = {
    monthly: 12,
    annual: 1,
    weekly: 52,
    quarterly: 4,
  }
  return amount * (multipliers[cycle] || 12)
}

export function monthlyCost(amount: number, cycle: string): number {
  const divisors: Record<string, number> = {
    monthly: 1,
    annual: 12,
    weekly: 0.25,
    quarterly: 3,
  }
  return amount / (divisors[cycle] || 1)
}
