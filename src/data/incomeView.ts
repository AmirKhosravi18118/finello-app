import { demo, type Tx } from './demo'
import { applyEdits, getCashTx } from './editStore'
import { getImportedTx } from '../bank/bankConnection'
import type { IncomeType } from './editStore'

export type VisibleTx = Tx & { incomeType?: IncomeType }

/** All visible transactions: demo + bank imports + cash, edit overlay applied. */
export function visibleTransactions(): VisibleTx[] {
  const bank = getImportedTx()
  return applyEdits([...demo.transactions, ...bank, ...getCashTx()] as VisibleTx[]).sort((a, b) =>
    b.date.localeCompare(a.date),
  )
}

export interface MonthMoney {
  income: number
  expense: number
  balance: number
  incomeByType: Array<{ type: IncomeType; total: number }>
}

/** Current-calendar-month income/expense totals from all visible transactions. */
export function monthMoney(txs: VisibleTx[], ref = new Date()): MonthMoney {
  let income = 0
  let expense = 0
  const byType = new Map<IncomeType, number>()
  for (const tx of txs) {
    const d = new Date(tx.date)
    if (d.getFullYear() !== ref.getFullYear() || d.getMonth() !== ref.getMonth()) continue
    if (tx.amount >= 0) {
      income += tx.amount
      const type = tx.incomeType ?? 'other'
      byType.set(type, (byType.get(type) ?? 0) + tx.amount)
    } else {
      expense += Math.abs(tx.amount)
    }
  }
  return {
    income,
    expense,
    balance: income - expense,
    incomeByType: [...byType.entries()]
      .map(([type, total]) => ({ type, total }))
      .sort((a, b) => b.total - a.total),
  }
}
