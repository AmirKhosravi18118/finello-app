import { describe, expect, it } from 'vitest'
import { monthMoney, type VisibleTx } from './incomeView'

const ref = new Date()
const iso = (day: number) => new Date(ref.getFullYear(), ref.getMonth(), day).toISOString().slice(0, 10)
const prevIso = new Date(ref.getFullYear(), ref.getMonth() - 1, 5).toISOString().slice(0, 10)

const rows: VisibleTx[] = [
  {
    id: 'a',
    name: 'Gehalt',
    amount: 850,
    date: iso(15),
    source: 'bank',
    categoryId: 'income',
    incomeType: 'salary',
  },
  { id: 'b', name: 'REWE', amount: -46, date: iso(19), source: 'bank', categoryId: 'groceries' },
  { id: 'c', name: 'Erstattung', amount: 120, date: iso(3), source: 'bank', categoryId: null },
  { id: 'd', name: 'alt', amount: -999, date: prevIso, source: 'bank', categoryId: 'other' },
]

describe('monthMoney', () => {
  it('sums current-month income/expense, ignores other months', () => {
    const m = monthMoney(rows, ref)
    expect(m.income).toBe(970)
    expect(m.expense).toBe(46)
    expect(m.balance).toBe(924)
  })

  it('groups income by type (unclassified positive → other)', () => {
    const m = monthMoney(rows, ref)
    expect(m.incomeByType.find((x) => x.type === 'salary')?.total).toBe(850)
    expect(m.incomeByType.find((x) => x.type === 'other')?.total).toBe(120)
  })
})
