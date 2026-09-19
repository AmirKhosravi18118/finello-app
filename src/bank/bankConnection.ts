import { useCallback, useState } from 'react'
import { activeBankProvider, type BankRef } from './bankProvider'
import { demo, type Tx } from '../data/demo'
import { getCashTx, uncategorizedCount } from '../data/editStore'

export type { BankRef }

/** Cross-screen bank-connection state persisted in localStorage.
 *  Screens remount on tab switch, so plain reads per mount keep them consistent. */

const BANK_KEY = 'finello_bank' // {"id","name"} | removed
const TX_KEY = 'finello_bank_tx' // persisted imported rows, capped
const TX_CAP = 50

export function getConnectedBank(): BankRef | null {
  try {
    const raw = localStorage.getItem(BANK_KEY)
    return raw ? (JSON.parse(raw) as BankRef) : null
  } catch {
    return null
  }
}

export function setConnectedBank(bank: BankRef | null) {
  if (bank) localStorage.setItem(BANK_KEY, JSON.stringify(bank))
  else {
    localStorage.removeItem(BANK_KEY)
    localStorage.removeItem(TX_KEY)
  }
}

export function getImportedTx(): Tx[] {
  try {
    const raw = localStorage.getItem(TX_KEY)
    return raw ? (JSON.parse(raw) as Tx[]) : []
  } catch {
    return []
  }
}

export function addImportedTx(rows: Tx[]): Tx[] {
  const next = [...rows, ...getImportedTx()].slice(0, TX_CAP)
  localStorage.setItem(TX_KEY, JSON.stringify(next))
  return next
}

/** Total uncategorized across demo + bank imports + cash, respecting edit overlays. */
export function uncategorizedTotal(): number {
  return uncategorizedCount([...demo.transactions, ...getImportedTx(), ...getCashTx()])
}

export function useBankConnection() {
  const [connected, setConnected] = useState<BankRef | null>(() => getConnectedBank())
  const [imported, setImported] = useState<Tx[]>(() => getImportedTx())

  const connect = useCallback((bank: BankRef) => {
    setConnectedBank(bank)
    setConnected(bank)
  }, [])

  const disconnect = useCallback(() => {
    setConnectedBank(null)
    setConnected(null)
    setImported([])
  }, [])

  /** Pull new rows from the provider and persist them. Returns how many were new. */
  const importNow = useCallback((): number => {
    const bank = getConnectedBank()
    if (!bank) return 0
    const existing = new Set(getImportedTx().map((t) => t.id))
    const fresh = activeBankProvider
      .importTransactions(bank.id, 7)
      .filter((r) => !existing.has(r.id))
      .map<Tx>((r) => ({ ...r, source: 'bank', categoryId: null }))
    if (fresh.length) setImported(addImportedTx(fresh))
    return fresh.length
  }, [])

  return { connected, banks: activeBankProvider.listBanks(), imported, connect, disconnect, importNow }
}
