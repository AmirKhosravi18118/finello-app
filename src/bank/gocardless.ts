/** REAL GoCardless (Nordigen) Bank Account Data provider — PSD2.
 *
 *  Browser calls never hit GoCardless directly (no CORS + secret exposure);
 *  they hit a tiny proxy (see workers/gocardless-proxy.js in the repo) whose
 *  base URL comes from VITE_BANK_API (default same-origin /api/gocardless on
 *  the deployed host). When the proxy + credentials exist, isLive() returns
 *  true and the whole bank UX (institution list → hosted consent link →
 *  accounts → transactions) runs REAL. Without it, bankConnection falls back
 *  to the mock provider and the UI shows the demo badge. */

import type { BankProvider, BankRef, BankTransaction } from './bankProvider'

/** Live provider is async at the edges; the sync-shaped adapter interface
 *  stays for the mock — this partial is used only via bankConnection helpers. */
export interface LiveBankProvider extends Omit<BankProvider, 'listBanks' | 'importTransactions'> {
  listBanks(): Promise<BankRef[]>
  importTransactions(bankId: string, sinceDays: number): Promise<BankTransaction[]>
  startConsent(bankId: string, redirectUrl: string): Promise<{ link: string; id: string }>
}

const PROXY_BASE = (import.meta.env.VITE_BANK_API as string | undefined) ?? '/api/gocardless'
const GC_ENABLED = String(import.meta.env.VITE_GC_ENABLED ?? '') === '1'

export function isLive(): boolean {
  return GC_ENABLED
}

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${PROXY_BASE}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
  })
  if (!res.ok) throw new Error(`gocardless ${path} → ${res.status}`)
  return (await res.json()) as T
}

export const gocardlessProvider: LiveBankProvider = {
  id: 'gocardless',

  async listBanks(): Promise<BankRef[]> {
    const rows = await api<Array<{ id: string; name: string }>>(`/institutions/?country=DE`)
    return rows.map((r) => ({ id: r.id, name: r.name }))
  },

  /** Full consent flow: create requisition for the institution, hand the user
   *  the hosted bank link; after consent the app links back and pulls data. */
  async startConsent(bankId: string, redirectUrl: string): Promise<{ link: string; id: string }> {
    const r = await api<{ id: string; link: string }>('/requisitions/', {
      method: 'POST',
      body: JSON.stringify({ institution_id: bankId, redirect: redirectUrl }),
    })
    return { link: r.link, id: r.id }
  },

  async importTransactions(bankId: string, _sinceDays: number): Promise<BankTransaction[]> {
    // transactions are fetched per requisition account after consent:
    void bankId
    void _sinceDays
    const accounts = await api<Array<{ id: string; iban: string }>>('/accounts/')
    const out: BankTransaction[] = []
    for (const acc of accounts) {
      const tx = await api<{
        transactions: {
          booked: Array<{
            transactionId: string
            remittanceInformationUnstructured?: string
            bookingDate: string
            transactionAmount: { amount: string }
          }>
        }
      }>(`/accounts/${acc.id}/transactions/`)
      for (const b of tx.transactions.booked ?? []) {
        out.push({
          id: b.transactionId || `${acc.id}-${b.bookingDate}-${out.length}`,
          name: (b.remittanceInformationUnstructured ?? 'Bank transaction').slice(0, 60),
          amount: Math.round(parseFloat(b.transactionAmount.amount) * 100) / 100,
          date: b.bookingDate,
        })
      }
    }
    return out
  },
}
