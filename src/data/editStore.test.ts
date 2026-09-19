import { describe, expect, it } from 'vitest'
import {
  addCashTx,
  addUserPayment,
  addTaxExtra,
  applyEdits,
  getCashTx,
  getTaxExtras,
  getTxEdits,
  getUserPayments,
  removeCashTx,
  removeUserPayment,
  savePaymentEdit,
  saveTxEdit,
  setSalary,
  getSalary,
  tombstoneTx,
  uncategorizedCount,
  type StorageLike,
} from './editStore'
import { demo, type Tx } from './demo'

function memoryStore(): StorageLike & { dump(): Record<string, string> } {
  const m = new Map<string, string>()
  return {
    getItem: (k) => m.get(k) ?? null,
    setItem: (k, v) => m.set(k, v),
    removeItem: (k) => m.delete(k),
    dump: () => Object.fromEntries(m),
  }
}

const base: Tx[] = [
  { id: 'a', name: 'REWE', amount: -10, date: '2026-09-01', source: 'bank', categoryId: null },
  { id: 'b', name: 'Netflix', amount: -12, date: '2026-09-02', source: 'bank', categoryId: 'subscription' },
]

describe('editStore', () => {
  it('applies field edits on top of rows without mutating them', () => {
    const s = memoryStore()
    saveTxEdit('a', { name: 'REWE Einkauf', amount: -11 }, s)
    const out = applyEdits(base, s)
    expect(out[0]).toMatchObject({ name: 'REWE Einkauf', amount: -11 })
    expect(base[0].name).toBe('REWE')
  })

  it('can recategorize (null → category) and tombstone hides a row', () => {
    const s = memoryStore()
    saveTxEdit('a', { categoryId: 'groceries' }, s)
    expect(uncategorizedCount(base, s)).toBe(0)
    tombstoneTx('b', s)
    expect(applyEdits(base, s).map((t) => t.id)).toEqual(['a'])
    expect(getTxEdits(s)['b']).toBe('DELETED')
  })

  it('manages cash rows (add → list → remove)', () => {
    const s = memoryStore()
    const t = addCashTx({ name: 'Bäckerei', amount: -4, date: '2026-09-19', categoryId: null }, s)
    expect(getCashTx(s).map((x) => x.id)).toEqual([t.id])
    expect(t.source).toBe('manual')
    removeCashTx(t.id, s)
    expect(getCashTx(s)).toHaveLength(0)
  })

  it('counts demo uncategorized through the edit lens', () => {
    const s = memoryStore()
    const demoNulls = demo.transactions.filter((t) => t.categoryId === null).length
    expect(uncategorizedCount(demo.transactions, s)).toBe(demoNulls)
  })
})

describe('WP6 stores', () => {
  it('manages user payments (add → edit overlay → remove)', () => {
    const s = memoryStore()
    const p = addUserPayment(
      { title: 'Miete WG', amount: 420, dayOfMonth: 1, recipient: 'Vermieter', categoryId: 'rent' },
      s,
    )
    expect(getUserPayments(s).map((x) => x.id)).toEqual([p.id])
    savePaymentEdit(p.id, { amount: 430 }, s)
    expect(applyEdits(getUserPayments(s), s)[0].amount).toBe(430)
    removeUserPayment(p.id, s)
    expect(getUserPayments(s)).toHaveLength(0)
  })

  it('persists tax extras and salary config', () => {
    const s = memoryStore()
    const item = addTaxExtra(
      { category: 'Sprachkurs', amount: 300, note: '', date: '2026-05-01', year: 2026 },
      s,
    )
    expect(getTaxExtras(s).map((x) => x.id)).toEqual([item.id])
    setSalary({ day: 28, amount: 900 }, s)
    expect(getSalary(s)).toEqual({ day: 28, amount: 900 })
  })
})
