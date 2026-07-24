import assert from 'node:assert/strict'
import test from 'node:test'
import {
  calculateBudget,
  compareMonthlyTrends,
  computeCompletionScore,
  computeStreak,
  findMissingDocumentation,
  getUrgencyStatus,
  summarizePostponements,
} from '../src/lib/life-admin.ts'

test('urgency calculation has consistent green, yellow, red, and overdue states', () => {
  const now = new Date('2026-07-23T12:00:00Z')
  assert.equal(getUrgencyStatus('2026-08-20', now).level, 'green')
  assert.equal(getUrgencyStatus('2026-08-01', now).level, 'yellow')
  assert.equal(getUrgencyStatus('2026-07-25', now).level, 'red')
  assert.equal(getUrgencyStatus('2026-07-20', now).level, 'overdue')
})

test('completion score is transparent and treats an empty system positively', () => {
  const result = computeCompletionScore({
    totalOpen: 0,
    overdue: 0,
    upcoming: 0,
    upcomingPrepared: 0,
    recurringDue: 0,
    recurringCompleted: 0,
    missingDocumentation: 0,
    documentationCandidates: 0,
    inboxItems: [],
  })
  assert.equal(result.score, 100)
  assert.equal(result.factors.reduce((sum, factor) => sum + factor.weight, 0), 100)
})

test('monthly trend compares current and previous periods', () => {
  const trend = compareMonthlyTrends({
    now: new Date('2026-07-23T12:00:00Z'),
    completions: [
      { occurrence_date: '2026-07-02' },
      { occurrence_date: '2026-07-09' },
      { occurrence_date: '2026-06-10' },
    ],
    dueItems: [
      { dueAt: '2026-07-10', complete: false },
      { dueAt: '2026-06-10', complete: true },
    ],
    recurringCosts: [
      { createdAt: '2026-05-01', monthlyAmount: 20 },
      { createdAt: '2026-07-01', monthlyAmount: 10 },
    ],
  })
  assert.equal(trend.delta.completed, 1)
  assert.equal(trend.delta.recurringCost, 10)
})

test('streak computation returns current and best streaks from real occurrences', () => {
  const streak = computeStreak(
    [
      { occurrence_date: '2026-07-02' },
      { occurrence_date: '2026-07-09' },
      { occurrence_date: '2026-07-16' },
    ],
    'weekly',
    new Date('2026-07-23'),
  )
  assert.deepEqual(streak, { current: 3, best: 3 })
})

test('missing documentation flags warranties and unmatched bills', () => {
  const flags = findMissingDocumentation(
    [{
      id: 'w1', user_id: 'u1', product_name: 'Laptop', purchase_date: '2026-01-01',
      expiry_date: '2027-01-01', coverage_notes: null, receipt_url: null, created_at: '2026-01-01',
    }],
    [{
      id: 'b1', user_id: 'u1', name: 'Electric Co', amount: 50, currency: 'USD',
      due_date: '2026-07-20', paid: false, recurring: true, category: 'utilities',
      notes: null, created_at: '2026-07-01',
    }],
    [],
  )
  assert.deepEqual(flags.map(flag => flag.itemType), ['warranty', 'bill'])
})

test('budget calculation includes subscriptions and optional positive rollover', () => {
  const result = calculateBudget({
    now: new Date('2026-07-23'),
    budget: { category: 'utilities', monthly_cap: 100, rollover_enabled: true },
    previousRemaining: 20,
    bills: [{
      id: 'b1', user_id: 'u1', name: 'Power', amount: 60, currency: 'USD',
      due_date: '2026-07-20', paid: true, recurring: false, category: 'utilities',
      notes: null, created_at: '2026-07-01',
    }],
    subscriptions: [],
  })
  assert.equal(result.effectiveCap, 120)
  assert.equal(result.remaining, 60)
  assert.equal(result.progress, 50)
})

test('postponement summary is event-derived', () => {
  const result = summarizePostponements([
    {
      id: 'e1', user_id: 'u1', item_type: 'deadline', item_id: 'd1',
      event_type: 'postponed', from_due_at: '2026-07-01', to_due_at: '2026-07-08',
      metadata: {}, created_at: '2026-06-30', updated_at: '2026-06-30',
    },
    {
      id: 'e2', user_id: 'u1', item_type: 'deadline', item_id: 'd1',
      event_type: 'postponed', from_due_at: '2026-07-08', to_due_at: '2026-07-22',
      metadata: {}, created_at: '2026-07-07', updated_at: '2026-07-07',
    },
  ])
  assert.equal(result.count, 2)
  assert.equal(result.totalDays, 21)
  assert.equal(result.totalWeeks, 3)
})

