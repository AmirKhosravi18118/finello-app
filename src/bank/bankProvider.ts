/** Bank connectivity adapter (CONTRACT extension WP4).
 *  The active provider is the single swap point for a real PSD2 provider
 *  (GoCardless/Nordigen, TrueLayer, …) in V2 — screens never talk to a bank directly. */

export interface BankRef {
  id: string
  name: string
}

export interface BankTransaction {
  id: string
  name: string
  amount: number
  date: string // ISO yyyy-mm-dd
}

export interface BankProvider {
  id: string
  listBanks(): BankRef[]
  importTransactions(bankId: string, sinceDays: number): BankTransaction[]
  /** Live providers (PSD2) add the hosted consent flow. */
  startConsent?: (bankId: string, redirectUrl: string) => Promise<{ link: string; id: string }>
}

/** ZERO-KILOMETER: the fallback provider is permanently empty — banks come
 *  exclusively from the live PSD2 catalog (TrueLayer via the VPS proxy). */

export const mockBankProvider: BankProvider = {
  id: 'mock',
  listBanks: () => [],
  importTransactions: () => [],
}

export const activeBankProvider: BankProvider = mockBankProvider
