import type {
  Appointment,
  Bill,
  CategoryBudget,
  CompletionEvent,
  Deadline,
  Document,
  ItemActivityEvent,
  QuickInboxItem,
  Subscription,
  UserProfile,
  Warranty,
  WeeklyFocusNote,
  WeeklyReportCache,
} from './index'

type InsertOf<Row> =
  Partial<Omit<Row, 'id' | 'created_at' | 'updated_at'>> &
  (Row extends { user_id: string } ? { user_id: string } : object)

type TableDefinition<Row> = {
  Row: Row
  Insert: InsertOf<Row>
  Update: Partial<InsertOf<Row>>
  Relationships: []
}

/**
 * Supabase schema type kept in the repository because the productivity
 * migration is intentionally created but not applied tonight.
 * Regenerate from the reviewed project after migration activation.
 */
export type Database = {
  public: {
    Tables: {
      users_profile: TableDefinition<UserProfile>
      subscriptions: TableDefinition<Subscription>
      deadlines: TableDefinition<Deadline>
      documents: TableDefinition<Document>
      bills: TableDefinition<Bill>
      appointments: TableDefinition<Appointment>
      warranties: TableDefinition<Warranty>
      quick_inbox_items: TableDefinition<QuickInboxItem>
      category_budgets: TableDefinition<CategoryBudget>
      weekly_focus_notes: TableDefinition<WeeklyFocusNote>
      item_completion_events: TableDefinition<CompletionEvent>
      item_activity_events: TableDefinition<ItemActivityEvent>
      weekly_report_cache: TableDefinition<WeeklyReportCache>
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

