import { useEffect, useState } from 'react'
import { useI18n } from '../i18n/I18nContext'
import {
  AppHeader,
  Badge,
  Card,
  EmptyState,
  Icon,
  Pill,
  SectionHeader,
  SkeletonCard,
  SkeletonStats,
  StatTile,
} from '../components/ui'
import { EditEntrySheet, type EntryDraft } from '../components/EditEntrySheet'
import { AddMoneySheet } from '../components/AddMoneySheet'
import { CATEGORIES } from '../data/demo'
import type { CategoryId, Tx } from '../data/demo'
import type { IncomeType } from '../data/editStore'
import { useBankConnection } from '../bank/bankConnection'
import { INCOME_TYPES, removeCashTx, saveTxEdit, tombstoneTx } from '../data/editStore'
import { visibleTransactions } from '../data/incomeView'

const CATEGORY_IDS = Object.keys(CATEGORIES) as CategoryId[]

/** Cross-tab quick-add signal (DS2.0 §5) — dispatched by BottomNav. */
const QUICK_ADD_EVENT = 'finello:quick-add'

export function TransactionsScreen() {
  const { t, fmt } = useI18n()
  const { banks, importNow } = useBankConnection()
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [importFlash, setImportFlash] = useState(0)
  const [editTx, setEditTx] = useState<Tx | null>(null)
  const [cashOpen, setCashOpen] = useState(false)
  const [cashMode, setCashMode] = useState<'expense' | 'income'>('expense')
  const [filtersVisible, setFiltersVisible] = useState(true)
  const openCash = (mode: 'expense' | 'income') => {
    setCashMode(mode)
    setCashOpen(true)
  }
  const [bankFilter, setBankFilter] = useState<string | null>(null)
  const [, setVersion] = useState(0) // bump re-renders after persisted edits/cash changes

  // simulated fetch so skeleton states are actually visible
  const [loaded, setLoaded] = useState(false)
  useEffect(() => {
    const id = window.setTimeout(() => setLoaded(true), 350)
    return () => window.clearTimeout(id)
  }, [])

  // bottom-nav quick add → cash expense/income sheet
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<'expense' | 'payment' | 'income'>).detail
      if (detail === 'expense' || detail === 'income') {
        setCashMode(detail)
        setCashOpen(true)
      }
    }
    window.addEventListener(QUICK_ADD_EVENT, handler)
    return () => window.removeEventListener(QUICK_ADD_EVENT, handler)
  }, [])

  const all = visibleTransactions() as Array<Tx & { incomeType?: IncomeType; bankId?: string }>
  const bankName = (id?: string) => banks.find((b) => b.id === id)?.name ?? id ?? ''
  const txs = bankFilter ? all.filter((tx) => tx.bankId === bankFilter) : all
  const uncategorizedCount = txs.filter((tx) =>
    tx.amount >= 0 ? tx.incomeType === undefined : tx.categoryId === null,
  ).length
  const now = new Date()
  const inMonth = txs.filter((tx) => {
    const d = new Date(tx.date)
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
  })
  const monthSum = inMonth.reduce((sum, tx) => sum + tx.amount, 0)
  const monthIncome = inMonth.filter((tx) => tx.amount >= 0).reduce((s, tx) => s + tx.amount, 0)
  const monthExpense = inMonth.filter((tx) => tx.amount < 0).reduce((s, tx) => s + Math.abs(tx.amount), 0)

  const refresh = () => setVersion((v) => v + 1)

  const saveEdit = (draft: EntryDraft) => {
    if (!editTx) return
    const inflow = editTx.amount >= 0
    saveTxEdit(
      editTx.id,
      inflow
        ? {
            name: draft.name,
            amount: draft.amount,
            date: draft.date,
            incomeType: draft.incomeType ?? 'other',
          }
        : { name: draft.name, amount: draft.amount, date: draft.date, categoryId: draft.categoryId },
    )
    refresh()
  }

  const deleteTx = () => {
    if (!editTx) return
    if (editTx.id.startsWith('cash-')) removeCashTx(editTx.id)
    else tombstoneTx(editTx.id)
    refresh()
  }

  return (
    <div className="flex flex-col gap-5">
      <AppHeader
        overline={fmt.month(new Date())}
        title={t('nav.transactions')}
        trailing={
          <button
            type="button"
            aria-label={t('tx.bank')}
            aria-pressed={filtersVisible}
            onClick={() => setFiltersVisible((v) => !v)}
            className={`tap flex h-10 w-10 items-center justify-center rounded-2xl border ${
              filtersVisible
                ? 'border-primary bg-primary-soft text-primary-deep'
                : 'border-line bg-surface text-ink-soft'
            }`}
          >
            <Icon name="settings" className="h-5 w-5" />
          </button>
        }
      />

      {banks.length > 0 && filtersVisible && (
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
          <Pill active={bankFilter === null} onClick={() => setBankFilter(null)}>
            {t('common.all')}
          </Pill>
          {banks.map((b) => (
            <Pill key={b.id} active={bankFilter === b.id} onClick={() => setBankFilter(b.id)}>
              <span className="flex items-center gap-1.5">
                <Icon name="bank" className="h-3.5 w-3.5" />
                {b.name}
              </span>
            </Pill>
          ))}
        </div>
      )}

      {/* stats: 3-tile grid */}
      {!loaded ? (
        <SkeletonStats />
      ) : bankFilter ? (
        <div className="grid grid-cols-2 gap-3">
          <StatTile
            tone="success"
            icon="down"
            label={t('home.monthIncome')}
            value={fmt.currency(monthIncome)}
          />
          <StatTile tone="warn" icon="up" label={t('home.monthExpense')} value={fmt.currency(monthExpense)} />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <StatTile
            icon="receipt"
            label={t('tx.count', { n: fmt.num(txs.length) })}
            value={fmt.num(txs.length)}
          />
          <StatTile
            tone="warn"
            icon="bell"
            label={t('tx.uncategorized', { n: fmt.num(uncategorizedCount) })}
            value={fmt.num(uncategorizedCount)}
          />
          <StatTile
            tone="success"
            icon="wallet"
            label={t('tx.thisMonth')}
            value={fmt.currency(monthSum)}
            className="col-span-2"
          />
        </div>
      )}

      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          <button type="button" className="btn-ghost flex-1 !px-3" onClick={() => openCash('expense')}>
            <Icon name="up" className="h-4.5 w-4.5 rotate-180" />
            {t('cash.expense')}
          </button>
          <button
            type="button"
            className="tap flex min-h-11 flex-1 items-center justify-center gap-2 rounded-2xl bg-primary-soft px-3 text-sm font-bold text-primary-deep ring-1 ring-primary/30 transition active:scale-[0.97]"
            onClick={() => openCash('income')}
          >
            <Icon name="down" className="h-4.5 w-4.5 rotate-180" />
            {t('cash.income')}
          </button>
        </div>
        <button
          type="button"
          className="btn-ghost w-full"
          onClick={() => {
            setImportFlash(importNow())
            refresh()
          }}
        >
          <Icon name={banks.length > 0 ? 'bank' : 'download'} className="h-5 w-5" />
          {banks.length > 0 ? t('tx.importBank') : t('tx.importCsv')}
        </button>
        {importFlash > 0 && (
          <p className="num text-center text-xs font-bold text-primary-deep">
            {t('tx.importedNew', { n: importFlash })}
          </p>
        )}
      </div>

      {/* recent transactions */}
      <section>
        <SectionHeader icon="receipt" title={t('tx.recent')} />
        {!loaded ? (
          <div className="flex flex-col gap-3">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : txs.length === 0 ? (
          <Card>
            <EmptyState icon="receipt" text={t('tx.emptyTx')} />
          </Card>
        ) : (
          <div className="flex flex-col gap-2">
            {txs.map((tx) => {
              const inflow = tx.amount >= 0
              const classified = inflow ? tx.incomeType !== undefined : tx.categoryId !== null
              const open = expandedId === tx.id && !classified
              return (
                <Card key={tx.id} className="tap !p-4" onClick={() => classified && setEditTx(tx)}>
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${
                        inflow ? 'bg-primary-soft text-primary-deep' : 'bg-chip text-ink-soft'
                      }`}
                    >
                      <Icon name={tx.source === 'bank' ? 'bank' : 'hand'} className="h-5 w-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-ink">{tx.name}</p>
                      <p className="flex flex-wrap items-center gap-1.5 text-xs font-medium text-ink-soft">
                        <span>{fmt.date(new Date(tx.date))}</span>
                        {tx.source === 'manual' ? (
                          <Badge tone="neutral">
                            <Icon name="hand" className="h-3 w-3" />
                            {t('tx.methodCash')}
                          </Badge>
                        ) : (
                          <Badge tone="neutral">
                            <Icon name="bank" className="h-3 w-3" />
                            {t('tx.methodCard')}
                            {tx.bankId && bankName(tx.bankId) !== tx.bankId
                              ? ` · ${bankName(tx.bankId)}`
                              : ''}
                          </Badge>
                        )}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <span
                        className={`num text-sm font-extrabold ${tx.amount < 0 ? 'text-ink' : 'text-primary-deep'}`}
                      >
                        {fmt.currency(tx.amount)}
                      </span>
                      {classified ? (
                        inflow ? (
                          <Badge tone="success">
                            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                            {t(`inc.${tx.incomeType}`)}
                          </Badge>
                        ) : (
                          <Badge tone="neutral">
                            <span
                              className="h-1.5 w-1.5 rounded-full"
                              style={{ backgroundColor: CATEGORIES[tx.categoryId!].color }}
                            />
                            {t(`cat.${tx.categoryId}`)}
                          </Badge>
                        )
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            setExpandedId(open ? null : tx.id)
                          }}
                          className="tap flex min-h-11 items-center rounded-xl px-2 text-xs font-bold text-primary-deep"
                        >
                          {inflow ? t('tx.assignIncome') : t('tx.assignCategory')}
                        </button>
                      )}
                    </div>
                  </div>
                  {open && (
                    <div className="mt-3 flex flex-wrap items-stretch gap-2">
                      {inflow
                        ? INCOME_TYPES.map((id) => (
                            <Pill
                              key={id}
                              onClick={() => {
                                saveTxEdit(tx.id, { incomeType: id })
                                setExpandedId(null)
                                refresh()
                              }}
                            >
                              <span className="flex items-center gap-1.5">
                                <span className="h-2 w-2 rounded-full bg-primary" />
                                {t(`inc.${id}`)}
                              </span>
                            </Pill>
                          ))
                        : CATEGORY_IDS.map((id) => (
                            <Pill
                              key={id}
                              onClick={() => {
                                saveTxEdit(tx.id, { categoryId: id })
                                setExpandedId(null)
                                refresh()
                              }}
                            >
                              <span className="flex items-center gap-1.5">
                                <span
                                  className="h-2 w-2 rounded-full"
                                  style={{ backgroundColor: CATEGORIES[id].color }}
                                />
                                {t(`cat.${id}`)}
                              </span>
                            </Pill>
                          ))}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setEditTx(tx)
                        }}
                        className="tap flex min-h-11 items-center rounded-xl px-2 text-xs font-bold text-ink-soft underline"
                      >
                        {t('common.edit')}
                      </button>
                    </div>
                  )}
                </Card>
              )
            })}
          </div>
        )}
      </section>

      <EditEntrySheet
        open={editTx !== null}
        onClose={() => setEditTx(null)}
        title={t('tx.edit')}
        inflow={editTx ? editTx.amount >= 0 : false}
        initial={
          editTx
            ? {
                name: editTx.name,
                amount: editTx.amount,
                date: editTx.date,
                categoryId: editTx.categoryId,
                incomeType: (editTx as Tx & { incomeType?: IncomeType }).incomeType,
              }
            : { name: '', amount: 0, date: new Date().toISOString().slice(0, 10), categoryId: null }
        }
        onSave={saveEdit}
        onDelete={deleteTx}
        showDelete
      />

      <AddMoneySheet
        open={cashOpen}
        onClose={() => setCashOpen(false)}
        initialMode={cashMode}
        onSaved={refresh}
      />
    </div>
  )
}
