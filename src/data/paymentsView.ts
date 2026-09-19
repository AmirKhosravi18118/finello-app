import { demo, statusFor, type Payment } from './demo'
import { applyEdits, getUserPayments } from './editStore'

/** Merged payment list: demo + user payments, edit overlay applied, statuses live-computed. */
export function allPayments(): Payment[] {
  const user = getUserPayments().map((p) => ({
    id: p.id,
    title: p.title,
    amount: p.amount,
    dayOfMonth: p.dayOfMonth,
    recipient: p.recipient,
    categoryId: p.categoryId,
    status: statusFor(p.dayOfMonth),
  }))
  return applyEdits([...demo.payments, ...user])
}

/** Next N payments ordered by proximity to today (for home + notifications). */
export function nearestPayments(all: Payment[], count: number): Payment[] {
  const today = new Date().getDate()
  return [...all]
    .sort((a, b) => Math.abs(a.dayOfMonth - today) - Math.abs(b.dayOfMonth - today))
    .slice(0, count)
}
