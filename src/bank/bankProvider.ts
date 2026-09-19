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
}

const GERMAN_BANKS: BankRef[] = [
  { id: 'sparkasse', name: 'Sparkasse' },
  { id: 'deutsche-bank', name: 'Deutsche Bank' },
  { id: 'commerzbank', name: 'Commerzbank' },
  { id: 'ing', name: 'ING' },
  { id: 'n26', name: 'N26' },
  { id: 'volksbank', name: 'Volksbank' },
]

/** Deterministic per-day pool so demo imports feel real without a backend. */
const IMPORT_POOL: Array<(bankId: string, daysAgo: number) => BankTransaction> = [
  (bankId, daysAgo) => ({
    id: `${bankId}-supermarkt-${daysAgo}`,
    name: 'SUPERMARKT KASSE',
    amount: -38.4,
    date: isoDaysAgo(daysAgo),
  }),
  (bankId, daysAgo) => ({
    id: `${bankId}-paypal-${daysAgo}`,
    name: 'PayPal *EBAY',
    amount: -24.9,
    date: isoDaysAgo(daysAgo),
  }),
  (bankId, daysAgo) => ({
    id: `${bankId}-cafeteria-${daysAgo}`,
    name: 'UNI Cafeteria',
    amount: -5.8,
    date: isoDaysAgo(daysAgo),
  }),
]

function isoDaysAgo(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d.toISOString().slice(0, 10)
}

export const mockBankProvider: BankProvider = {
  id: 'mock',
  listBanks: () => GERMAN_BANKS,
  importTransactions: (bankId, sinceDays) => {
    const rows: BankTransaction[] = []
    for (let d = 1; d <= Math.min(sinceDays, 7); d += 2) {
      rows.push(IMPORT_POOL[(d + sinceDays) % IMPORT_POOL.length](bankId, d))
    }
    return rows
  },
}

/** Swap to a real PSD2 provider here (V2) — no screen changes needed. */
export const activeBankProvider: BankProvider = mockBankProvider
