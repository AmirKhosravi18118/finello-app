import { describe, expect, it } from 'vitest'
import { mockBankProvider } from './bankProvider'

/** ZERO-KILOMETER contract: the fallback provider ships NO fake banks and NO
 *  fake transactions — banks come exclusively from the live PSD2 catalog. */
describe('mockBankProvider (zero-kilometer)', () => {
  it('lists no demo banks', () => {
    expect(mockBankProvider.listBanks()).toEqual([])
  })

  it('imports no demo transactions', () => {
    expect(mockBankProvider.importTransactions('any', 7)).toEqual([])
    expect(mockBankProvider.importTransactions('any', 365)).toEqual([])
  })
})
