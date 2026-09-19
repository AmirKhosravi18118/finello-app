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

const GERMAN_BANKS: BankRef[] = [
  { id: 'sparkasse', name: 'Sparkasse' },
  { id: 'deutsche-bank', name: 'Deutsche Bank' },
  { id: 'commerzbank', name: 'Commerzbank' },
  { id: 'ing', name: 'ING' },
  { id: 'n26', name: 'N26' },
  { id: 'volksbank', name: 'Volksbank' },
]

/** Deterministic per-day pool so demo imports feel real without a backend. */
/** 8 distinct merchants; each bank picks a seeded rotation so two connected
 *  banks never duplicate the same row (name+date) — month totals stay honest. */
const MERCHANTS: Array<[string, number]> = [
  ['SUPERMARKT KASSE', -38.4],
  ['PayPal *EBAY', -24.9],
  ['UNI Cafeteria', -5.8],
  ['DB Regio Ticket', -21.0],
  ['ROS SMOOTHIES', -7.4],
  ['AMZN MARKETPLACE', -33.2],
  ['Backerei KRAUS', -4.6],
  ['VBL Versicherung', -12.8],
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
    const seed = Math.abs(bankId.split('').reduce((a, c) => a + c.charCodeAt(0), 0))
    const rows: BankTransaction[] = []
    for (let d = 1; d <= Math.min(sinceDays, 7); d += 2) {
      const [name, amount] = MERCHANTS[(seed + d) % MERCHANTS.length]
      rows.push({ id: `${bankId}-${d}-${name.replace(/\W+/g, '')}`, name, amount, date: isoDaysAgo(d) })
    }
    return rows
  },
}

/** Swap to a real PSD2 provider here (V2) — no screen changes needed. */
export const activeBankProvider: BankProvider = mockBankProvider
