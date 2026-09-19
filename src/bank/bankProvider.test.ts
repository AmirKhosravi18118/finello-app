import { describe, expect, it } from 'vitest'
import { mockBankProvider } from './bankProvider'

describe('mockBankProvider', () => {
  it('lists real German banks', () => {
    const banks = mockBankProvider.listBanks()
    expect(banks.length).toBeGreaterThanOrEqual(6)
    expect(banks.map((b) => b.id)).toContain('sparkasse')
  })

  it('imports well-formed transactions (negative amounts, ISO dates, unique ids)', () => {
    const rows = mockBankProvider.importTransactions('ing', 7)
    expect(rows.length).toBeGreaterThan(0)
    for (const r of rows) {
      expect(r.amount).toBeLessThan(0)
      expect(r.date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(r.id.startsWith('ing-')).toBe(true)
    }
    expect(new Set(rows.map((r) => r.id)).size).toBe(rows.length)
  })

  it('caps the lookback window', () => {
    expect(mockBankProvider.importTransactions('n26', 365).length).toBeLessThanOrEqual(4)
  })
})
