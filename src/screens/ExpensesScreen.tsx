import { useState, type ReactNode } from 'react'
import { useI18n } from '../i18n/I18nContext'
import { Badge, Card, EmptyState, Icon, Pill, SectionTitle, StatCard } from '../components/ui'
import { EditEntrySheet, type EntryDraft } from '../components/EditEntrySheet'
import { BY_CATEGORY, CATEGORIES, MONTH_TOTAL, SPLIT_MONTHS, demo } from '../data/demo'
import type { Expense } from '../data/demo'
import { applyExpenseEdits, saveTxEdit, tombstoneTx } from '../data/editStore'

/** Whole-number percent for `diff` relative to `base` (no decimals; 0 or 100 when base is empty). */
const pctOf = (diff: number, base: number): number => {
  if (base <= 0) return diff === 0 ? 0 : 100
  return Math.round((Math.abs(diff) / base) * 100)
}

export function ExpensesScreen() {
  const { t, fmt } = useI18n()
  const [editExp, setEditExp] = useState<Expense | null>(null)
  const [, setVersion] = useState(0)
  const { cur, prev } = SPLIT_MONTHS(applyExpenseEdits(demo.expenses))
  const curTotal = MONTH_TOTAL(cur)
  const prevTotal = MONTH_TOTAL(prev)
  const byCat = BY_CATEGORY(cur)
  const prevByCat = new Map(BY_CATEGORY(prev).map((row) => [row.categoryId, row.total]))
  const sorted = [...cur].sort((a, b) => b.date.localeCompare(a.date))
  const max = byCat[0]?.total ?? 0

  const renderDelta = (value: number, base: number): ReactNode => {
    const diff = value - base
    const amount = <span className="num text-sm font-extrabold text-ink">{fmt.currency(Math.abs(diff))}</span>
    if (diff > 0)
      return (
        <span className="flex shrink-0 items-center gap-2.5">
          {amount}
          <span className="flex items-center gap-1 text-xs font-bold text-danger">
            <Icon name="up" className="h-3.5 w-3.5" />
            {t('exp.more', { p: pctOf(diff, base) })}
          </span>
        </span>
      )
    if (diff < 0)
      return (
        <span className="flex shrink-0 items-center gap-2.5">
          {amount}
          <span className="flex items-center gap-1 text-xs font-bold text-primary-deep">
            <Icon name="down" className="h-3.5 w-3.5" />
            {t('exp.less', { p: pctOf(diff, base) })}
          </span>
        </span>
      )
    return (
      <span className="flex shrink-0 items-center gap-2.5">
        {amount}
        <span className="text-xs font-bold text-ink-soft">{t('exp.noChange')}</span>
      </span>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      <SectionTitle title={t('nav.expenses')} />

      <StatCard label={t('exp.monthTotal')} value={fmt.currency(curTotal)} />

      <Card>
        <SectionTitle title={t('exp.byCategory')} />
        {byCat.length > 0 && (
          <svg viewBox="0 0 320 140" className="w-full" aria-hidden="true">
            <line x1="0" y1="130.5" x2="320" y2="130.5" stroke="#E2E8F0" strokeWidth="1" />
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
              <span className="max-w-24 truncate">{t(`cat.${categoryId}`)}</span>
            </span>
          ))}
        </div>
      </Card>

      <div className="flex flex-wrap items-stretch gap-2">
        {byCat.map(({ categoryId }) => (
          <span key={categoryId} className="flex min-h-11 items-center">
            <Pill>
              <span className="flex items-center gap-1.5">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: CATEGORIES[categoryId].color }}
                />
                {t(`cat.${categoryId}`)}
              </span>
            </Pill>
          </span>
        ))}
      </div>

      <Card>
        <SectionTitle title={t('exp.comparePrev')} />
        <div className="divide-y divide-slate-100">
          <div className="flex min-h-11 items-center justify-between gap-2 py-1">
            <span className="text-sm font-extrabold text-ink">{t('common.total')}</span>
            {renderDelta(curTotal, prevTotal)}
          </div>
          {byCat.slice(0, 3).map(({ categoryId, total }) => (
            <div key={categoryId} className="flex min-h-11 items-center justify-between gap-2 py-1">
              <span className="flex min-w-0 items-center gap-2 text-sm font-bold text-ink">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: CATEGORIES[categoryId].color }}
                />
                <span className="truncate">{t(`cat.${categoryId}`)}</span>
              </span>
              {renderDelta(total, prevByCat.get(categoryId) ?? 0)}
            </div>
          ))}
        </div>
      </Card>

      <div>
        <SectionTitle title={t('exp.expensesList')} />
        {sorted.length === 0 ? (
          <Card>
            <EmptyState icon="wallet" text={t('exp.emptyExpenses')} />
          </Card>
        ) : (
          <div className="flex flex-col gap-2">
            {sorted.map((e) => (
              <Card key={e.id} className="tap flex items-center gap-2.5" onClick={() => setEditExp(e)}>
                <span className="shrink-0 text-xs font-medium text-ink-soft">
                  {fmt.date(new Date(e.date))}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm font-bold text-ink">{e.title}</span>
                <span className="shrink-0">
                  <Badge tone="neutral">
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ backgroundColor: CATEGORIES[e.categoryId].color }}
                    />
                    {t(`cat.${e.categoryId}`)}
                  </Badge>
                </span>
                <span className="num shrink-0 text-sm font-extrabold text-ink">{fmt.currency(e.amount)}</span>
              </Card>
            ))}
          </div>
        )}
      </div>

      <EditEntrySheet
        open={editExp !== null}
        onClose={() => setEditExp(null)}
        title={t('exp.edit')}
        allowCategoryClear={false}
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
    </div>
  )
}
