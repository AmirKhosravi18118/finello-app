import { useEffect, useState, type ReactNode } from 'react'
import { useI18n } from '../i18n/I18nContext'
import {
  AppHeader,
  Badge,
  Card,
  DonutChart,
  EmptyState,
  Icon,
  Modal,
  Pill,
  ProgressBar,
  SectionHeader,
  SkeletonCard,
} from '../components/ui'
import { EditEntrySheet, type EntryDraft } from '../components/EditEntrySheet'
import { AddMoneySheet } from '../components/AddMoneySheet'
import { BY_CATEGORY, CATEGORIES, MONTH_TOTAL, SPLIT_MONTHS, demo } from '../data/demo'
import type { Expense } from '../data/demo'
import { applyExpenseEdits, getBudgets, saveTxEdit, setBudget, tombstoneTx } from '../data/editStore'
import { visibleTransactions } from '../data/incomeView'

/** Whole-number percent for `diff` relative to `base` (no decimals; 0 or 100 when base is empty). */
const pctOf = (diff: number, base: number): number => {
  if (base <= 0) return diff === 0 ? 0 : 100
  return Math.round((Math.abs(diff) / base) * 100)
}

/** ALL expenses in one place: demo entries + every negative transaction
 *  (cash + bank imports) → charts, totals and the list stay live-connected. */
function allExpenses(): Expense[] {
  const txExpenses: Expense[] = visibleTransactions()
    .filter((tx) => tx.amount < 0)
    .map((tx) => ({
      id: `tx-${tx.id}`,
      title: tx.name,
      amount: Math.abs(tx.amount),
      date: tx.date,
      categoryId: tx.categoryId ?? 'other',
    }))
  return applyExpenseEdits([...demo.expenses, ...txExpenses])
}

export function AnalysenScreen() {
  const { t, fmt } = useI18n()
  const [editExp, setEditExp] = useState<Expense | null>(null)
  const [addOpen, setAddOpen] = useState(false)
  const [, setVersion] = useState(0)
  const { cur, prev } = SPLIT_MONTHS(allExpenses())
  const curTotal = MONTH_TOTAL(cur)
  const prevTotal = MONTH_TOTAL(prev)
  const byCat = BY_CATEGORY(cur)
  const prevByCat = new Map(BY_CATEGORY(prev).map((row) => [row.categoryId, row.total]))
  const sorted = [...cur].sort((a, b) => b.date.localeCompare(a.date))
  const now = new Date()
  const max = byCat[0]?.total ?? 0

  // budgets (WP26)
  const [budgets, setBudgetsState] = useState(() => getBudgets())
  const [budgetOpen, setBudgetOpen] = useState(false)
  const [budgetCat, setBudgetCat] = useState<string>('rent')
  const [budgetAmt, setBudgetAmt] = useState('')
  const saveBudgetEntry = () => {
    if (Number(budgetAmt) > 0) {
      setBudget(budgetCat as never, Number(budgetAmt))
      setBudgetsState(getBudgets())
    }
    setBudgetOpen(false)
    setBudgetAmt('')
  }

  // 6-month trend (WP26)
  const trend = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
    const total = demo.expenses
      .concat()
      .filter((e) => {
        const ed = new Date(e.date)
        return ed.getFullYear() === d.getFullYear() && ed.getMonth() === d.getMonth()
      })
      .reduce((sum, e) => sum + e.amount, 0)
    return { label: fmt.weekday(d).slice(0, 2), total }
  })
  const trendMax = Math.max(...trend.map((x) => x.total), 1)

  // simulated fetch so skeleton states are actually visible
  const [loaded, setLoaded] = useState(false)
  useEffect(() => {
    const id = window.setTimeout(() => setLoaded(true), 350)
    return () => window.clearTimeout(id)
  }, [])

  /** Colored delta text (no amount) — used as the hero comparison caption. */
  const deltaText = (value: number, base: number): ReactNode => {
    const diff = value - base
    if (diff > 0)
      return (
        <span className="flex items-center gap-1 text-xs font-bold text-danger">
          <Icon name="up" className="h-3.5 w-3.5" />
          {t('exp.more', { p: pctOf(diff, base) })}
        </span>
      )
    if (diff < 0)
      return (
        <span className="flex items-center gap-1 text-xs font-bold text-primary-deep">
          <Icon name="down" className="h-3.5 w-3.5" />
          {t('exp.less', { p: pctOf(diff, base) })}
        </span>
      )
    return <span className="text-xs font-bold text-ink-soft">{t('exp.noChange')}</span>
  }

  const renderDelta = (value: number, base: number): ReactNode => {
    const diff = value - base
    const amount = <span className="num text-sm font-extrabold text-ink">{fmt.currency(Math.abs(diff))}</span>
    return (
      <span className="flex shrink-0 items-center gap-2.5">
        {amount}
        {deltaText(value, base)}
      </span>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      <AppHeader
        overline={fmt.month(new Date())}
        title={t('nav.analysen')}
        trailing={
          <button
            type="button"
            aria-label={t('common.add')}
            onClick={() => setAddOpen(true)}
            className="tap shadow-card flex h-11 w-11 items-center justify-center rounded-2xl bg-navy text-white"
          >
            <Icon name="plus" className="h-5 w-5" />
          </button>
        }
      />

      {/* numeric hero (v3): month total + comparison caption */}
      <section className="card p-5">
        <p className="eyebrow">{t('exp.monthTotal')}</p>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-2">
          <p className="t-display num">{fmt.currency(curTotal)}</p>
          {deltaText(curTotal, prevTotal)}
        </div>
      </section>

      {/* donut card + legend with % and amounts (Finanzguru-style analytics) */}
      {byCat.length > 0 && (
        <Card className="flex flex-wrap items-center gap-5">
          <DonutChart
            segments={byCat.map(({ categoryId, total }) => ({
              color: CATEGORIES[categoryId].color,
              value: total,
            }))}
            centerValue={fmt.currency(curTotal)}
            centerLabel={t('exp.monthTotal')}
          />
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            {byCat.slice(0, 5).map(({ categoryId, total }) => (
              <div key={categoryId} className="flex items-center justify-between gap-2">
                <span className="flex min-w-0 items-center gap-1.5 text-xs font-bold text-ink">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: CATEGORIES[categoryId].color }}
                  />
                  <span className="min-w-0">{t(`cat.${categoryId}`)}</span>
                </span>
                <span className="flex shrink-0 items-baseline gap-2">
                  <span className="num text-xs font-bold text-ink-soft">
                    {curTotal > 0 ? Math.round((total / curTotal) * 100) : 0}%
                  </span>
                  <span className="num w-20 text-end text-xs font-extrabold text-ink">
                    {fmt.currency(total)}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* category chart */}
      <Card>
        <SectionHeader icon="wallet" tone="success" title={t('exp.byCategory')} />
        {byCat.length > 0 && (
          <svg viewBox="0 0 320 140" className="w-full" aria-hidden="true">
            <line x1="0" y1="130.5" x2="320" y2="130.5" className="stroke-line" strokeWidth="1" />
            {byCat.map((item, i) => {
              const slot = 320 / byCat.length
              const barW = Math.min(26, slot * 0.6)
              const h = max > 0 ? Math.max(4, (item.total / max) * 116) : 4
              const x = i * slot + (slot - barW) / 2
              return (
                <rect
                  key={item.categoryId}
                  x={x}
                  y={130 - h}
                  width={barW}
                  height={h}
                  rx={Math.min(6, barW / 2, h)}
                  fill={CATEGORIES[item.categoryId].color}
                />
              )
            })}
          </svg>
        )}
        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1.5">
          {byCat.map(({ categoryId }) => (
            <span
              key={categoryId}
              className="flex items-center gap-1.5 text-[11px] font-medium text-ink-soft"
            >
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: CATEGORIES[categoryId].color }}
              />
              <span className="min-w-0">{t(`cat.${categoryId}`)}</span>
            </span>
          ))}
        </div>
      </Card>

      {/* month-over-month comparison */}
      <Card>
        <SectionHeader icon="calendar" title={t('exp.comparePrev')} />
        <div className="divide-y divide-line">
          <div className="flex min-h-11 items-center justify-between gap-2 py-3">
            <span className="text-sm font-extrabold text-ink">{t('common.total')}</span>
            {renderDelta(curTotal, prevTotal)}
          </div>
          {byCat.slice(0, 3).map(({ categoryId, total }) => (
            <div key={categoryId} className="flex min-h-11 items-center justify-between gap-2 py-3">
              <span className="flex min-w-0 items-center gap-2 text-sm font-bold text-ink">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: CATEGORIES[categoryId].color }}
                />
                <span className="min-w-0">{t(`cat.${categoryId}`)}</span>
              </span>
              {renderDelta(total, prevByCat.get(categoryId) ?? 0)}
            </div>
          ))}
        </div>
      </Card>

      {/* list */}
      <section>
        {/* budgets (WP26) */}
        <Card>
          <SectionHeader
            icon="wallet"
            tone="warn"
            title={t('bud.title')}
            action={
              <button
                type="button"
                aria-label={t('bud.add')}
                onClick={() => setBudgetOpen(true)}
                className="tap flex h-11 w-11 items-center justify-center rounded-2xl bg-chip text-ink"
              >
                <Icon name="plus" className="h-4.5 w-4.5" />
              </button>
            }
          />
          {Object.entries(budgets).length === 0 ? (
            <p className="py-3 text-center text-sm font-medium text-ink-soft">{t('bud.empty')}</p>
          ) : (
            <div className="flex flex-col gap-3">
              {Object.entries(budgets).map(([cat, amt]) => {
                const spent = byCat.find((x) => x.categoryId === cat)?.total ?? 0
                const over = spent > (amt as number)
                return (
                  <div key={cat} className="flex flex-col gap-1">
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="flex items-center gap-1.5 font-bold text-ink">
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: CATEGORIES[cat as keyof typeof CATEGORIES].color }}
                        />
                        {t(`cat.${cat}`)}
                      </span>
                      <span className="num font-bold text-ink-soft">
                        {fmt.currency(spent)} / {fmt.currency(amt as number)}
                      </span>
                    </div>
                    <ProgressBar value={spent / (amt as number)} label={t(`cat.${cat}`)} />
                    {over && (
                      <p className="text-[10px] font-bold text-danger">
                        {t('exp.more', {
                          p: Math.round(((spent - (amt as number)) / (amt as number)) * 100),
                        })}
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </Card>

        {/* 6-month trend (WP26) */}
        <Card>
          <SectionHeader icon="receipt" tone="success" title={t('exp.comparePrev')} />
          <svg viewBox="0 0 320 120" className="w-full" aria-hidden="true">
            <line x1="0" y1="110.5" x2="320" y2="110.5" className="stroke-line" strokeWidth="1" />
            {trend.map((m, i) => {
              const slot = 320 / 6
              const barW = Math.min(28, slot * 0.55)
              const h = Math.max(4, (m.total / trendMax) * 96)
              const x = i * slot + (slot - barW) / 2
              return (
                <g key={i}>
                  <rect
                    x={x}
                    y={110 - h}
                    width={barW}
                    height={h}
                    rx={Math.min(6, barW / 2)}
                    className="fill-primary"
                  />
                  <text
                    x={x + barW / 2}
                    y={124}
                    textAnchor="middle"
                    className="fill-current text-[9px] font-bold text-ink-soft"
                  >
                    {m.label}
                  </text>
                </g>
              )
            })}
          </svg>
        </Card>

        <SectionHeader icon="receipt" title={t('exp.expensesList')} />
        {!loaded ? (
          <div className="flex flex-col gap-3">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : sorted.length === 0 ? (
          <Card>
            <EmptyState icon="wallet" text={t('exp.emptyExpenses')} />
          </Card>
        ) : (
          <div className="card anim-stagger px-5">
            {sorted.map((e) => (
              <button
                key={e.id}
                type="button"
                onClick={() => setEditExp(e)}
                className="tap flex w-full items-center gap-2.5 border-t border-line py-3 text-start first:border-t-0"
              >
                <span className="shrink-0 text-xs font-medium text-ink-soft">
                  {fmt.date(new Date(e.date))}
                </span>
                <span className="min-w-0 flex-1 text-sm font-bold leading-snug text-ink">{e.title}</span>
                <span className="shrink-0">
                  <Badge tone="neutral">
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ backgroundColor: CATEGORIES[e.categoryId].color }}
                    />
                    {t(`cat.${e.categoryId}`)}
                  </Badge>
                </span>
                <span className="num shrink-0 text-sm font-extrabold leading-[1.1] text-ink">
                  {fmt.currency(e.amount)}
                </span>
              </button>
            ))}
          </div>
        )}
      </section>

      <EditEntrySheet
        open={editExp !== null}
        onClose={() => setEditExp(null)}
        title={t('exp.edit')}
        initial={
          editExp
            ? {
                name: editExp.title,
                amount: editExp.amount,
                date: editExp.date,
                categoryId: editExp.categoryId,
              }
            : { name: '', amount: 0, date: new Date().toISOString().slice(0, 10), categoryId: null }
        }
        onSave={(draft: EntryDraft) => {
          if (!editExp) return
          saveTxEdit(editExp.id, {
            name: draft.name,
            amount: draft.amount,
            date: draft.date,
            categoryId: draft.categoryId ?? 'other',
          })
          setVersion((v) => v + 1)
        }}
        onDelete={() => {
          if (!editExp) return
          tombstoneTx(editExp.id)
          setVersion((v) => v + 1)
        }}
        showDelete
      />

      <AddMoneySheet open={addOpen} onClose={() => setAddOpen(false)} initialMode="expense" />

      <Modal open={budgetOpen} onClose={() => setBudgetOpen(false)} title={t('bud.set')}>
        <div className="flex flex-col gap-3">
          <div>
            <p className="mb-1.5 ps-1 text-xs font-bold text-ink-soft">{t('bud.category')}</p>
            <div className="flex max-h-32 flex-wrap gap-2 overflow-y-auto">
              {(Object.keys(CATEGORIES) as Array<keyof typeof CATEGORIES>).map((id) => (
                <Pill key={id} active={budgetCat === id} onClick={() => setBudgetCat(id)}>
                  {t(`cat.${id}`)}
                </Pill>
              ))}
            </div>
          </div>
          <div>
            <label htmlFor="fin-budget-amt" className="mb-1 block ps-1 text-xs font-bold text-ink-soft">
              {t('bud.amount')}
            </label>
            <input
              id="fin-budget-amt"
              type="text"
              inputMode="numeric"
              className="field num"
              value={budgetAmt}
              onChange={(e) => setBudgetAmt(e.target.value.replace(/[^0-9]/g, ''))}
            />
          </div>
          <div className="mt-2 flex gap-3">
            <button type="button" className="btn-ghost flex-1" onClick={() => setBudgetOpen(false)}>
              {t('common.cancel')}
            </button>
            <button
              type="button"
              disabled={Number(budgetAmt) <= 0}
              onClick={saveBudgetEntry}
              className="btn-primary flex-1 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {t('common.save')}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
