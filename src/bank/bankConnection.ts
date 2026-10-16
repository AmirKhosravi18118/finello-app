import { useCallback, useEffect, useState } from 'react'
import { activeBankProvider, type BankRef } from './bankProvider'
import { gocardlessProvider, isLive, proxyConfigured } from './gocardless'

export { isLive }
import { demo, type Tx } from '../data/demo'
import { getAccount, saveAccount } from '../auth/account'
import { getCashTx, uncategorizedCount } from '../data/editStore'

export type { BankRef }

/** A transaction imported from a connected bank, tagged with its origin. */
export interface BankTx extends Tx {
  bankId: string
}

/** Cross-screen multi-bank connection state persisted in localStorage.
 *  Screens remount on tab switch, so plain reads per mount keep them consistent. */

const BANKS_KEY = 'finello_banks' // BankRef[]
const LEGACY_BANK_KEY = 'finello_bank' // single-bank predecessor → migrated on read
const TX_KEY = 'finello_bank_tx' // persisted imported rows, capped
const TX_CAP = 200

export function getConnectedBanks(): BankRef[] {
  try {
    const raw = localStorage.getItem(BANKS_KEY)
    if (raw) return JSON.parse(raw) as BankRef[]
    const legacy = localStorage.getItem(LEGACY_BANK_KEY)
    if (legacy) {
      const bank = JSON.parse(legacy) as BankRef
      localStorage.setItem(BANKS_KEY, JSON.stringify([bank]))
      return [bank]
    }
    return []
  } catch {
    return []
  }
}

function writeBanks(list: BankRef[]) {
  localStorage.setItem(BANKS_KEY, JSON.stringify(list))
}

export function getImportedTx(): BankTx[] {
  try {
    const raw = localStorage.getItem(TX_KEY)
    return raw ? (JSON.parse(raw) as BankTx[]) : []
  } catch {
    return []
  }
}

function writeImported(rows: BankTx[]) {
  localStorage.setItem(TX_KEY, JSON.stringify(rows.slice(0, TX_CAP)))
}

/** Total uncategorized across demo + bank imports + cash, respecting edit overlays. */
export function uncategorizedTotal(): number {
  return uncategorizedCount([...demo.transactions, ...getImportedTx(), ...getCashTx()])
}

export function useBankConnection() {
  const [banks, setBanks] = useState<BankRef[]>(() => getConnectedBanks())
  const [imported, setImported] = useState<BankTx[]>(() => getImportedTx())

  // refresh after the PSD2 consent return (App/AuthScreen fire this)
  useEffect(() => {
    const onImported = () => {
      setBanks(getConnectedBanks())
      setImported(getImportedTx())
    }
    window.addEventListener('finello:bank-imported', onImported)
    return () => window.removeEventListener('finello:bank-imported', onImported)
  }, [])

  const connect = useCallback((bank: BankRef) => {
    const next = getConnectedBanks()
    if (!next.some((b) => b.id === bank.id)) {
      next.push(bank)
      writeBanks(next)
    }
    setBanks(getConnectedBanks())
  }, [])

  const disconnect = useCallback((bankId: string) => {
    writeBanks(getConnectedBanks().filter((b) => b.id !== bankId))
    writeImported(getImportedTx().filter((t) => t.bankId !== bankId))
    setBanks(getConnectedBanks())
    setImported(getImportedTx())
  }, [])

  /** Pull new rows from every connected bank (tagged with bankId). Returns how many were new. */
  const importNow = useCallback((): number => {
    const connected = getConnectedBanks()
    const existing = getImportedTx()
    const existingIds = new Set(existing.map((t) => t.id))
    const existingKeys = new Set(existing.map((t) => `${t.name}|${t.date}`))
    const fresh: BankTx[] = []
    for (const bank of connected) {
      for (const r of activeBankProvider.importTransactions(bank.id, 7)) {
        const key = `${r.name}|${r.date}`
        if (!existingIds.has(r.id) && !existingKeys.has(key)) {
          fresh.push({ ...r, source: 'bank', categoryId: null, bankId: bank.id })
          existingIds.add(r.id)
          existingKeys.add(key)
        }
      }
    }
    if (fresh.length) {
      const next = [...fresh, ...existing]
      writeImported(next)
      setImported(next.slice(0, TX_CAP))
    }
    return fresh.length
  }, [])

  return { banks, catalog: activeBankProvider.listBanks(), imported, connect, disconnect, importNow }
}

/** Live (GoCardless) variants: async catalog + async pull that lands rows in
 *  the same finello_bank_tx store so every screen keeps working unchanged. */
/** Runtime bank mode: 'live' only when the build enables GC AND the proxy
 *  reports configured keys — otherwise the demo provider stays in charge. */
export function useBankLive(): boolean {
  const [live, setLive] = useState(false)
  useEffect(() => {
    if (!isLive()) return
    void proxyConfigured().then(setLive)
  }, [])
  return live
}

/** Kick off the real PSD2 consent: requisition → GoCardless hosted bank link.
 *  The redirect carries ?live=1&bank=<institutionId>; App.tsx consumes it. */
export async function startLiveConsent(bankId: string): Promise<string> {
  const redirect = `${location.origin}${location.pathname}?live=1&bank=${encodeURIComponent(bankId)}`
  const { link } = await gocardlessProvider.startConsent(bankId, redirect)
  return link
}

export function useLiveBankCatalog(): BankRef[] {
  const [catalog, setCatalog] = useState<BankRef[]>(() => (isLive() ? [] : activeBankProvider.listBanks()))
  useEffect(() => {
    if (!isLive()) return
    gocardlessProvider
      .listBanks()
      .then(setCatalog)
      .catch(() => setCatalog(activeBankProvider.listBanks()))
  }, [])
  return catalog
}

/** Live per-bank fetch: resolves the real institution id for each connected
 *  bank via the catalog, then pulls transactions for that institution. */
export async function importLiveTransactions(): Promise<number> {
  if (!isLive()) return 0
  const existing = getImportedTx()
  const existingIds = new Set(existing.map((t) => t.id))
  let added = 0
  for (const bank of getConnectedBanks()) {
    try {
      const rows = await gocardlessProvider.importTransactions(bank.id, 90)
      const fresh: BankTx[] = rows
        .filter((r) => !existingIds.has(r.id))
        .map((r) => ({ ...r, source: 'bank', categoryId: null, bankId: bank.id }))
      if (fresh.length) {
        writeImported([...fresh, ...existing])
        existing.push(...fresh)
        added += fresh.length
      }
    } catch {
      // one bank failing must not block the others
    }
  }
  return added
}

/** Persist a live consent result (called after bank redirect back into app). */
export function connectLiveBank(bank: BankRef) {
  const next = getConnectedBanks()
  // a live connection supersedes any stale entry for the same bank (name match
  // covers legacy demo-connected rows) — never keep duplicates
  const stale = next.findIndex((b) => b.id === bank.id || b.name === bank.name)
  if (stale >= 0) next.splice(stale, 1)
  next.push(bank)
  writeBanks(next)
  // PSD2 consent audit trail (Art. 7 DSGVO) — append, never overwrite
  try {
    const a = getAccount()
    if (a) {
      a.consent = a.consent ?? { docs: [], psd2: [] }
      a.consent.psd2.push({
        bankId: bank.id,
        scope: 'read-only:transactions',
        grantedAt: new Date().toISOString(),
        revokedAt: null,
      })
      saveAccount(a)
    }
  } catch {
    // best-effort audit; connection itself stays authoritative
  }
}
