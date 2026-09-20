import type { CategoryId, Expense, TaxItem, Tx } from './demo'
import type { VisibleTx } from './incomeView'

/** Edit overlay + cash/payment/tax stores (WP5→WP6). Injectable Storage keeps it unit-testable. */

/** Income classification for positive (inflow) transactions. */
export type IncomeType = 'salary' | 'sidejob' | 'scholarship' | 'refund' | 'gift' | 'other'

export const INCOME_TYPES: IncomeType[] = ['salary', 'sidejob', 'scholarship', 'refund', 'gift', 'other']

export interface EntryEdit {
  name?: string
  amount?: number
  date?: string
  categoryId?: CategoryId | null
  incomeType?: IncomeType
}

export interface PaymentEdit {
  title?: string
  amount?: number
  dayOfMonth?: number
  recipient?: string
}

type EditValue = Record<string, unknown> | 'DELETED'
type EditMap = Record<string, EditValue>

export interface StorageLike {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}

const EDITS_KEY = 'finello_edits'
const CASH_KEY = 'finello_cash_tx'
const PAYMENTS_KEY = 'finello_payments'
const TAX_KEY = 'finello_tax_items'
const SALARY_KEY = 'finello_salary'

function defaultStorage(): StorageLike {
  return globalThis.localStorage
}

function readJson(store: StorageLike, key: string): unknown {
  try {
    const raw = store.getItem(key)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

/* ---------- edit overlay + tombstones (shared by tx / expenses / payments) ---------- */

export function getTxEdits(store: StorageLike = defaultStorage()): EditMap {
  return (readJson(store, EDITS_KEY) as EditMap) ?? {}
}

function writeEdits(map: EditMap, store: StorageLike) {
  store.setItem(EDITS_KEY, JSON.stringify(map))
}

function saveEdit(id: string, patch: Record<string, unknown>, store: StorageLike) {
  const map = getTxEdits(store)
  const cur = map[id]
  if (cur === 'DELETED') return
  map[id] = { ...(cur ?? {}), ...patch }
  writeEdits(map, store)
}

export function saveTxEdit(id: string, patch: EntryEdit, store: StorageLike = defaultStorage()) {
  saveEdit(id, patch as Record<string, unknown>, store)
}

export function savePaymentEdit(id: string, patch: PaymentEdit, store: StorageLike = defaultStorage()) {
  saveEdit(id, patch as Record<string, unknown>, store)
}

/** Tombstone: hides a demo/imported row without mutating the source list. */
export function tombstoneTx(id: string, store: StorageLike = defaultStorage()) {
  const map = getTxEdits(store)
  map[id] = 'DELETED'
  writeEdits(map, store)
}

/** Remove a tombstone or edit (used by cash-row deletion cleanup / undo). */
export function clearTxEdit(id: string, store: StorageLike = defaultStorage()) {
  const map = getTxEdits(store)
  delete map[id]
  writeEdits(map, store)
}

/** Overlay edits (by id) on any row list; tombstoned ids are dropped. */
export function applyEdits<T extends { id: string }>(list: T[], store: StorageLike = defaultStorage()): T[] {
  const map = getTxEdits(store)
  const out: T[] = []
  for (const row of list) {
    const e = map[row.id]
    if (e === 'DELETED') continue
    if (e && typeof e === 'object') {
      const patch: Record<string, unknown> = {}
      for (const [k, v] of Object.entries(e)) if (v !== undefined) patch[k] = v
      out.push(Object.assign({}, row, patch))
    } else out.push(row)
  }
  return out
}

/** Same overlay applied to expenses (name ↔ title mapping). */
export function applyExpenseEdits(list: Expense[], store: StorageLike = defaultStorage()): Expense[] {
  return applyEdits(
    list.map((e) => ({ ...e, name: e.title })),
    store,
  ).map(({ name, ...rest }) => ({ ...rest, title: name ?? '' }))
}

/* ---------- cash transactions (user-entered, source=manual) ---------- */

export function getCashTx(store: StorageLike = defaultStorage()): Tx[] {
  return (readJson(store, CASH_KEY) as Tx[]) ?? []
}

export function addCashTx(
  entry: {
    name: string
    amount: number
    date: string
    categoryId: CategoryId | null
    incomeType?: IncomeType | null
  },
  store: StorageLike = defaultStorage(),
): Tx {
  const cash = getCashTx(store)
  const tx: Tx = { id: `cash-${Date.now()}-${cash.length}`, source: 'manual', ...entry }
  store.setItem(CASH_KEY, JSON.stringify([tx, ...cash]))
  return tx
}

export function removeCashTx(id: string, store: StorageLike = defaultStorage()) {
  store.setItem(CASH_KEY, JSON.stringify(getCashTx(store).filter((t) => t.id !== id)))
}

/** Uncategorized total across demo + bank imports + cash, respecting edits.
 *  Inflows count as uncategorized until an income TYPE is assigned (not category). */
export function uncategorizedCount(allTx: VisibleTx[], store: StorageLike = defaultStorage()): number {
  return applyEdits(allTx, store).filter((t) =>
    t.amount >= 0 ? t.incomeType === undefined : t.categoryId === null,
  ).length
}

/* ---------- user payments (WP6: real CRUD from FAB) ---------- */

export interface UserPayment {
  id: string
  title: string
  amount: number
  dayOfMonth: number
  recipient: string
  categoryId: CategoryId
}

export function getUserPayments(store: StorageLike = defaultStorage()): UserPayment[] {
  return (readJson(store, PAYMENTS_KEY) as UserPayment[]) ?? []
}

export function addUserPayment(
  entry: { title: string; amount: number; dayOfMonth: number; recipient: string; categoryId: CategoryId },
  store: StorageLike = defaultStorage(),
): UserPayment {
  const list = getUserPayments(store)
  const p: UserPayment = { id: `pay-${Date.now()}-${list.length}`, ...entry }
  store.setItem(PAYMENTS_KEY, JSON.stringify([p, ...list]))
  return p
}

export function removeUserPayment(id: string, store: StorageLike = defaultStorage()) {
  store.setItem(PAYMENTS_KEY, JSON.stringify(getUserPayments(store).filter((p) => p.id !== id)))
}

/* ---------- tax extras (WP6: user-added deductible items persist) ---------- */

export function getTaxExtras(store: StorageLike = defaultStorage()): TaxItem[] {
  return (readJson(store, TAX_KEY) as TaxItem[]) ?? []
}

export function addTaxExtra(
  entry: { category: string; amount: number; note: string; date: string; year: number },
  store: StorageLike = defaultStorage(),
): TaxItem {
  const list = getTaxExtras(store)
  const item: TaxItem = { id: `tax-${Date.now()}-${list.length}`, ...entry }
  store.setItem(TAX_KEY, JSON.stringify([item, ...list]))
  return item
}

/* ---------- salary override ---------- */

export interface SalaryConfig {
  day: number
  amount: number
}

export function getSalary(store: StorageLike = defaultStorage()): SalaryConfig | null {
  return readJson(store, SALARY_KEY) as SalaryConfig | null
}

export function setSalary(cfg: SalaryConfig, store: StorageLike = defaultStorage()) {
  store.setItem(SALARY_KEY, JSON.stringify(cfg))
}
