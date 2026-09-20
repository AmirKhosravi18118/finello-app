export type TabId = 'home' | 'calendar' | 'expenses' | 'transactions' | 'tax' | 'settings'
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

const payments: Payment[] = [
  {
    id: 'p1',
    title: 'Miete ( WG )',
    amount: 420,
    dayOfMonth: 1,
    recipient: 'Vermieter Wagner',
    categoryId: 'rent',
    status: 'paid',
  },
  {
    id: 'p2',
    title: 'Telefon + Internet',
    amount: 39,
    dayOfMonth: clamp(today - 2),
    recipient: 'Vodafone',
    categoryId: 'phone',
    status: 'overdue',
  },
  {
    id: 'p3',
    title: 'Private Krankenversicherung',
    amount: 122,
    dayOfMonth: today,
    recipient: 'TK',
    categoryId: 'insurance',
    status: 'today',
  },
  {
    id: 'p4',
    title: 'Streaming',
    amount: 12,
    dayOfMonth: 22,
    recipient: 'Netflix',
    categoryId: 'subscription',
    status: statusFor(22),
  },
  {
    id: 'p5',
    title: 'Fitnessstudio',
    amount: 25,
    dayOfMonth: 28,
    recipient: 'McFit',
    categoryId: 'health',
    status: statusFor(28),
  },
  {
    id: 'p6',
    title: 'Semesterticket',
    amount: 18,
    dayOfMonth: 15,
    recipient: 'SemesterTicket NRW',
    categoryId: 'transport',
    status: statusFor(15),
  },
]

const expenses: Expense[] = [
  // current month
  { id: 'e1', title: 'REWE Einkauf', amount: 46, date: iso(Y, M, 2), categoryId: 'groceries' },
  { id: 'e2', title: 'Döner mit Freunden', amount: 9, date: iso(Y, M, 4), categoryId: 'leisure' },
  { id: 'e3', title: 'DB Ticket Köln', amount: 21, date: iso(Y, M, 6), categoryId: 'transport' },
  { id: 'e4', title: 'Aldi Einkauf', amount: 32, date: iso(Y, M, 9), categoryId: 'groceries' },
  { id: 'e5', title: 'Apotheke', amount: 14, date: iso(Y, M, 11), categoryId: 'health' },
  { id: 'e6', title: 'Skript Druck', amount: 7, date: iso(Y, M, 13), categoryId: 'study' },
  { id: 'e7', title: 'Kino', amount: 13, date: iso(Y, M, 16), categoryId: 'leisure' },
  { id: 'e8', title: 'Netto Einkauf', amount: 39, date: iso(Y, M, 19), categoryId: 'groceries' },
  { id: 'e9', title: 'Bibliothek Strafe', amount: 5, date: iso(Y, M, 21), categoryId: 'other' },
  // previous month
  { id: 'e10', title: 'REWE Einkauf', amount: 52, date: iso(Y, M - 1, 3), categoryId: 'groceries' },
  { id: 'e11', title: 'Starbucks', amount: 11, date: iso(Y, M - 1, 5), categoryId: 'leisure' },
  { id: 'e12', title: 'Amazon Bügelbrett', amount: 28, date: iso(Y, M - 1, 8), categoryId: 'other' },
  { id: 'e13', title: 'Aldi Einkauf', amount: 41, date: iso(Y, M - 1, 12), categoryId: 'groceries' },
  { id: 'e14', title: 'Fahrrad Reparatur', amount: 35, date: iso(Y, M - 1, 15), categoryId: 'transport' },
  { id: 'e15', title: 'Rosenmontag Party', amount: 18, date: iso(Y, M - 1, 17), categoryId: 'leisure' },
  { id: 'e16', title: 'Netto Einkauf', amount: 36, date: iso(Y, M - 1, 22), categoryId: 'groceries' },
  { id: 'e17', title: 'Schreibwaren', amount: 9, date: iso(Y, M - 1, 25), categoryId: 'study' },
  { id: 'e18', title: 'REWE Einkauf', amount: 44, date: iso(Y, M - 1, 27), categoryId: 'groceries' },
]

const transactions: Tx[] = [
  {
    id: 't1',
    name: 'REWE Frankfurt',
    amount: -46,
    date: iso(Y, M, 19),
    source: 'bank',
    categoryId: 'groceries',
  },
  { id: 't2', name: 'Auszahlung ATM', amount: -100, date: iso(Y, M, 18), source: 'bank', categoryId: null },
  {
    id: 't3',
    name: 'Gehalt Werkstudent',
    amount: 850,
    date: iso(Y, M, 15),
    source: 'bank',
    categoryId: 'income',
  },
  { id: 't4', name: 'Vodafone Rechnung', amount: -39, date: iso(Y, M, 14), source: 'bank', categoryId: null },
  { id: 't5', name: 'Netflix', amount: -12, date: iso(Y, M, 12), source: 'bank', categoryId: 'subscription' },
  {
    id: 't6',
    name: 'Bäckerei Müller',
    amount: -6,
    date: iso(Y, M, 11),
    source: 'manual',
    categoryId: 'groceries',
  },
  { id: 't7', name: 'Amazon.de', amount: -28, date: iso(Y, M, 9), source: 'bank', categoryId: null },
  { id: 't8', name: 'Kantine Uni', amount: -4, date: iso(Y, M, 8), source: 'manual', categoryId: null },
  {
    id: 't9',
    name: 'Payback Gutschrift',
    amount: 15,
    date: iso(Y, M, 6),
    source: 'bank',
    categoryId: 'income',
  },
  { id: 't10', name: 'Apotheke', amount: -14, date: iso(Y, M, 5), source: 'bank', categoryId: 'health' },
  { id: 't11', name: 'DB Regio', amount: -21, date: iso(Y, M, 3), source: 'bank', categoryId: 'transport' },
  {
    id: 't12',
    name: 'Miete überwiesen',
    amount: -420,
    date: iso(Y, M, 1),
    source: 'bank',
    categoryId: 'rent',
  },
]

/** Optional demo dataset (WP12): default OFF → clean product with empty states.
 *  Settings ▸ Demo data toggles 'finello_demo_data' and reloads. */
const DEMO_KEY = 'finello_demo_data'

/** Today's local date as yyyy-mm-dd (never shifts like UTC ISO at midnight). */
export const todayLocalISO = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function demoDataEnabled(): boolean {
  try {
    return localStorage.getItem(DEMO_KEY) === '1'
  } catch {
    return false
  }
}

const maybe = <T>(rows: T[]): T[] => (demoDataEnabled() ? rows : [])

export const demo: DemoData = {
  user: { name: 'Amir', email: 'amir@demo.finello.app', status: 'Werkstudent' },
  salaryDay: 15,
  salaryAmount: 850,
  payments: maybe(payments),
  expenses: maybe(expenses),
  transactions: maybe(transactions),
  savings: { amount: demoDataEnabled() ? 2150 : 0, goal: 5000 },
  tax: {
    profile: { taxClass: 1, employment: 'Werkstudent 18h/Woche' },
    items: maybe<TaxItem>([
      {
        id: 'x1',
        category: 'Homeoffice',
        amount: 600,
        note: '6 Monate × 100€ Pauschale',
        date: iso(Y, 1, 15),
        year: Y,
      },
      {
        id: 'x2',
        category: 'Pendlerpauschale',
        amount: 220,
        note: '12 km × 21 Tage',
        date: iso(Y, 2, 20),
        year: Y,
      },
      {
        id: 'x3',
        category: 'Arbeitsmittel',
        amount: 349,
        note: 'Laptop',
        date: iso(Y, 4, 2),
        year: Y,
      },
      {
        id: 'x4',
        category: 'Fachbücher',
        amount: 87,
        note: '2 Statistik-Bücher',
        date: iso(Y, 6, 11),
        year: Y,
      },
      {
        id: 'x5',
        category: 'Krankenversicherung',
        amount: 1464,
        note: '12 × 122€',
        date: iso(Y, 8, 1),
        year: Y,
      },
    ]),
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
