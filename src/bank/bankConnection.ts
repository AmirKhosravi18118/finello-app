import { useCallback, useEffect, useState } from 'react'
import { activeBankProvider, type BankRef } from './bankProvider'
import { gocardlessProvider, isLive } from './gocardless'

export { isLive }
import { demo, type Tx } from '../data/demo'
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

export async function importLiveTransactions(): Promise<number> {
  if (!isLive()) return 0
  const existing = getImportedTx()
  const existingIds = new Set(existing.map((t) => t.id))
  const rows = await gocardlessProvider.importTransactions('', 90)
  const fresh: BankTx[] = rows
    .filter((r) => !existingIds.has(r.id))
    .map((r) => ({ ...r, source: 'bank', categoryId: null, bankId: 'live' }))
  if (fresh.length) writeImported([...fresh, ...existing])
  return fresh.length
}

/** Persist a live consent result (called after bank redirect back into app). */
export function connectLiveBank(bank: BankRef) {
  const next = getConnectedBanks()
  if (!next.some((b) => b.id === bank.id)) {
    next.push(bank)
    writeBanks(next)
  }
}
