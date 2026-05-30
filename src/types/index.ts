export type UserProfile = {
  id: string
  full_name: string | null
  avatar_url: string | null
  timezone: string
  created_at: string
}

export type Subscription = {
  id: string
  user_id: string
  name: string
  amount: number
  currency: string
  billing_cycle: 'monthly' | 'annual' | 'weekly' | 'quarterly'
  next_renewal_date: string
  category: string
  status: 'active' | 'cancelled' | 'paused'
  cancel_reminder: boolean
  notes: string | null
  logo_url: string | null
  created_at: string
  updated_at: string
}

export type Deadline = {
  id: string
  user_id: string
  title: string
  due_date: string
  category: 'school' | 'personal' | 'work' | 'financial' | 'medical' | 'government' | 'other'
  priority: 'critical' | 'high' | 'medium' | 'low'
  status: 'pending' | 'completed' | 'overdue'
  recurring: boolean
  recurrence_pattern: string | null
  notes: string | null
  created_at: string
}

export type Document = {
  id: string
  user_id: string
  file_url: string
  file_name: string
  document_type: 'subscription' | 'bill' | 'warranty' | 'appointment' | 'deadline' | 'receipt' | 'insurance' | 'other'
  vendor_name: string | null
  amount: number | null
  key_date: string | null
  expiry_date: string | null
  description: string | null
  category: string
  ai_extracted: boolean
  confidence_score: number | null
  created_at: string
}

export type Bill = {
  id: string
  user_id: string
  name: string
  amount: number
  currency: string
  due_date: string
  paid: boolean
  recurring: boolean
  category: string
  notes: string | null
  created_at: string
}

export type Appointment = {
  id: string
  user_id: string
  title: string
  date_time: string
  location: string | null
  notes: string | null
  reminder_sent: boolean
  created_at: string
}

export type Warranty = {
  id: string
  user_id: string
  product_name: string
  purchase_date: string
  expiry_date: string
  coverage_notes: string | null
  receipt_url: string | null
  created_at: string
}

export type AIExtractionResult = {
  document_type: string
  vendor_name: string | null
  amount: number | null
  currency: string
  billing_cycle: string | null
  key_date: string | null
  expiry_date: string | null
  description: string
  category: string
  confidence_score: number
}
