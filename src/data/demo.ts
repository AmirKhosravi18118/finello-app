export type TabId = 'home' | 'calendar' | 'konten' | 'analysen' | 'transactions' | 'tax' | 'settings'
export type PayStatus = 'upcoming' | 'today' | 'overdue' | 'paid'

export interface Payment {
  id: string
  title: string
  amount: number
  dayOfMonth: number
  recipient: string
  categoryId: CategoryId
  status: PayStatus
}
export interface Expense {
  id: string
  title: string
  amount: number
  date: string /* ISO yyyy-mm-dd */
  categoryId: CategoryId
}
export interface Tx {
  id: string
  name: string
  amount: number
  date: string /* ISO */
  source: 'bank' | 'manual'
  categoryId: CategoryId | null
}
export type CategoryId =
  | 'rent'
  | 'groceries'
  | 'transport'
  | 'phone'
  | 'insurance'
  | 'subscription'
  | 'leisure'
  | 'study'
  | 'health'
  | 'other'
  | 'income'

export interface Category {
  id: CategoryId
  color: string
}
export interface Savings {
  amount: number
  goal: number
}
export interface TaxItem {
  id: string
  category: string
  amount: number
  note: string
  date: string
  year: number
}

export interface DemoData {
  user: { name: string; email: string; status: string }
  salaryDay: number
  salaryAmount: number
  payments: Payment[]
  expenses: Expense[]
  transactions: Tx[]
  savings: Savings
  tax: { profile: { taxClass: 1 | 2 | 3 | 4 | 5 | 6; employment: string }; items: TaxItem[] }
}

export const CATEGORIES: Record<CategoryId, Category> = {
  rent: { id: 'rent', color: '#6366f1' },
  groceries: { id: 'groceries', color: '#10b981' },
  transport: { id: 'transport', color: '#0ea5e9' },
  phone: { id: 'phone', color: '#8b5cf6' },
  insurance: { id: 'insurance', color: '#f59e0b' },
  subscription: { id: 'subscription', color: '#ec4899' },
  leisure: { id: 'leisure', color: '#f43f5e' },
  study: { id: 'study', color: '#14b8a6' },
  health: { id: 'health', color: '#ef4444' },
  other: { id: 'other', color: '#94a3b8' },
  income: { id: 'income', color: '#22c55e' },
}

const now = new Date()
const Y = now.getFullYear()
const M = now.getMonth()
const today = now.getDate()
const clamp = (d: number) => Math.min(31, Math.max(1, d))
const iso = (y: number, m: number, d: number) => new Date(y, m, clamp(d)).toISOString().slice(0, 10)

export function statusFor(day: number): PayStatus {
  return day === today ? 'today' : day > today ? 'upcoming' : 'overdue'
}

export const todayLocalISO = () => {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

/** Legacy demo toggle — permanently off since the zero-kilometer release. */
export function demoDataEnabled(): boolean {
  return false
}

/** ZERO-KILOMETER (v2026-10 zero-demo release): no fake data ships anymore —
 *  every list is permanently empty and users start with a clean slate. */

export const demo: DemoData = {
  user: { name: '', email: '', status: '' },
  salaryDay: 15,
  salaryAmount: 0,
  payments: [],
  expenses: [],
  transactions: [],
  savings: { amount: 0, goal: 0 },
  tax: {
    profile: { taxClass: 1, employment: '' },
    items: [],
  },
}

export const MONTH_TOTAL = (list: Expense[]) => list.reduce((s, e) => s + e.amount, 0)

export const BY_CATEGORY = (list: Expense[]) => {
  const map = new Map<CategoryId, number>()
  for (const e of list) map.set(e.categoryId, (map.get(e.categoryId) ?? 0) + e.amount)
  return [...map.entries()]
    .map(([categoryId, total]) => ({ categoryId, total }))
    .sort((a, b) => b.total - a.total)
}

/** Expenses of the calendar month of `ref`, and of the month before. */
export const SPLIT_MONTHS = (list: Expense[], ref = new Date()) => {
  const cur: Expense[] = []
  const prev: Expense[] = []
  for (const e of list) {
    const d = new Date(e.date)
    if (d.getFullYear() === ref.getFullYear() && d.getMonth() === ref.getMonth()) cur.push(e)
    else prev.push(e)
  }
  return { cur, prev }
}
