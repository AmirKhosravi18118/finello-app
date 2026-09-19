import type { Payment } from './demo'
import { applyEdits } from './editStore'
import { demo } from './demo'
import type { Tx } from './demo'

/** CSV export of all visible transactions (date,name,amount,category). */
export function transactionsCsv(txs: Tx[]): string {
  const esc = (s: string) => `"${s.replaceAll('"', '""')}"`
  const head = 'date,name,amount,category'
  const rows = txs.map((tx) =>
    [tx.date, tx.name, tx.amount.toFixed(2), tx.categoryId ?? 'uncategorized'].map(esc).join(','),
  )
  return [head, ...rows].join('\n')
}

/** ICS calendar file: one all-day recurring-style event per payment for the next 3 months. */
export function paymentsIcs(payments: Payment[], title: string): string {
  const now = new Date()
  const y = now.getFullYear()
  const m = now.getMonth()
  const pad = (n: number) => String(n).padStart(2, '0')
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Finello//Payments//FA',
    'CALSCALE:GREGORIAN',
  ]
  for (let i = 0; i < 3; i++) {
    const month = new Date(y, m + i, 1)
    const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()
    for (const p of payments) {
      const day = Math.min(p.dayOfMonth, daysInMonth)
      const d = `${month.getFullYear()}${pad(month.getMonth() + 1)}${pad(day)}`
      lines.push(
        'BEGIN:VEVENT',
        `UID:finello-${p.id}-${d}@finello.app`,
        `DTSTAMP:${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}T000000Z`,
        `DTSTART;VALUE=DATE:${d}`,
        `SUMMARY:${title}: ${p.title} (${p.amount.toFixed(0)} EUR)`,
        `DESCRIPTION:${p.recipient}`,
        'END:VEVENT',
      )
    }
  }
  lines.push('END:VCALENDAR')
  return lines.join('\r\n')
}

/** Trigger a browser download for the given content. */
export function downloadFile(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

/** All visible transactions merged with edits (helper for CSV export). */
export function exportableTransactions(): Tx[] {
  const cash = JSON.parse(localStorage.getItem('finello_cash_tx') || '[]') as Tx[]
  const bank = JSON.parse(localStorage.getItem('finello_bank_tx') || '[]') as Tx[]
  return applyEdits([...demo.transactions, ...bank, ...cash]).sort((a, b) => b.date.localeCompare(a.date))
}
