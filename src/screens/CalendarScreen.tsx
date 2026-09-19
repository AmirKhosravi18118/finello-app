import { useEffect, useState } from 'react'
import { useI18n } from '../i18n/I18nContext'
import { AppHeader, Badge, EmptyState, Icon, SectionHeader, SkeletonCard, type Tone } from '../components/ui'
import { AddPaymentSheet } from '../components/AddPaymentFab'
import { EditPaymentSheet } from '../components/EditPaymentSheet'
import { CATEGORIES, type Payment } from '../data/demo'
import type { PayStatus } from '../data/demo'
import { allPayments } from '../data/paymentsView'

const STATUS_TONE: Record<PayStatus, Tone> = {
  today: 'warn',
  overdue: 'danger',
  upcoming: 'neutral',
  paid: 'success',
}

export function CalendarScreen() {
  const { t, fmt, lang } = useI18n()
  const now = new Date()
  const [monthOffset, setMonthOffset] = useState(0)
  const viewDate = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1)
  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const todayNum = now.getDate()
  const isCurrentMonth = monthOffset === 0
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const [selected, setSelected] = useState(todayNum)
  const [editPayment, setEditPayment] = useState<Payment | null>(null)
  const [addOpen, setAddOpen] = useState(false)
  const [, setVersion] = useState(0)
  const refresh = () => setVersion((v) => v + 1)

  const goMonth = (delta: number) => {
    setMonthOffset((v) => v + delta)
    setSelected(1)
  }

  // simulated fetch so skeleton states are actually visible
  const [loaded, setLoaded] = useState(false)
  useEffect(() => {
    const id = window.setTimeout(() => setLoaded(true), 350)
    return () => window.clearTimeout(id)
  }, [])

  const payments = allPayments()

  const byDay = new Map<number, Payment[]>()
  for (const p of payments) {
    const list = byDay.get(p.dayOfMonth)
    if (list) list.push(p)
    else byDay.set(p.dayOfMonth, [p])
  }
  const paysOn = (d: number): Payment[] => byDay.get(d) ?? []

  // Week starts Saturday for fa, Monday otherwise.
  const firstWeekday = new Date(year, month, 1).getDay()
  const offset = lang === 'fa' ? (firstWeekday + 1) % 7 : (firstWeekday + 6) % 7

  const cells: Array<number | null> = [
    ...Array.from({ length: offset }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  while (cells.length % 7 !== 0) cells.push(null)

  const weekdayLabels = Array.from({ length: 7 }, (_, c) =>
    fmt.weekday(new Date(year, month, 1 + c - offset)),
  )

  const selectedPayments = paysOn(selected)

  // 7-day strip centered on the selected day (DS2.0 §5): 3 before + selected + 3 after, clamped.
  const stripStart = Math.min(Math.max(1, selected - 3), Math.max(1, daysInMonth - 6))
  const stripDays = Array.from({ length: 7 }, (_, i) => stripStart + i)

  return (
    <div className="flex flex-col gap-5">
      <AppHeader
        overline={fmt.month(viewDate)}
        title={t('cal.monthTitle')}
        trailing={
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              aria-label={t('cal.prev')}
              onClick={() => goMonth(-1)}
              className="tap shadow-card flex h-10 w-10 items-center justify-center rounded-2xl bg-surface text-ink rtl:rotate-180"
            >
              <Icon name="chevron" className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label={t('cal.next')}
              onClick={() => goMonth(1)}
              className="tap shadow-card flex h-10 w-10 items-center justify-center rounded-2xl bg-surface text-ink ltr:rotate-180"
            >
              <Icon name="chevron" className="h-4 w-4" />
            </button>
          </div>
        }
      />

      {/* 7-day strip centered on the selected day; center cell is the gradient hero */}
      <div className="grid grid-cols-7 gap-1.5">
        {stripDays.map((d) => {
          const pays = paysOn(d)
          const isCenter = selected === d
          return (
            <button
              key={d}
              type="button"
              onClick={() => setSelected(d)}
              aria-pressed={isCenter}
              className={`tap flex min-h-16 flex-col items-center justify-center gap-0.5 rounded-2xl px-0.5 py-1.5 ${
                isCenter
                  ? 'hero-gradient shadow-card text-white'
                  : `border border-line bg-surface text-ink ${todayNum === d ? 'ring-2 ring-primary' : ''}`
              }`}
            >
              <span
                className={`max-w-full truncate text-[9px] font-bold uppercase tracking-wide ${
                  isCenter ? 'text-white/70' : 'text-ink-soft'
                }`}
              >
                {fmt.weekday(new Date(year, month, d))}
              </span>
              <span className="num text-lg font-extrabold leading-none">{fmt.num(d)}</span>
              <span className="flex h-1.5 items-center gap-0.5">
                {pays.length > 0 ? (
                  pays
                    .slice(0, 3)
                    .map((p) => (
                      <span
                        key={p.id}
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ backgroundColor: CATEGORIES[p.categoryId].color }}
                      />
                    ))
                ) : (
                  <span className="h-1.5 w-1.5" />
                )}
              </span>
            </button>
          )
        })}
      </div>

      {/* month grid */}
      <div className="card p-4">
        <div className="mb-2 grid grid-cols-7 gap-1">
          {weekdayLabels.map((w, i) => (
            <div key={i} className="text-center text-[10px] font-bold text-ink-soft">
              {w}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {cells.map((d, i) =>
            d === null ? (
              <div key={`empty-${i}`} className="min-h-11" />
            ) : (
              <button
                key={d}
                type="button"
                onClick={() => setSelected(d)}
                className={`tap flex min-h-11 flex-col items-center justify-center gap-1 rounded-xl py-1 ${
                  todayNum === d ? 'ring-2 ring-primary' : ''
                } ${selected === d ? 'bg-navy text-white shadow-md' : ''}`}
              >
                <span className="num text-xs font-bold">{fmt.num(d)}</span>
                <span className="flex h-1 w-full items-center justify-center gap-0.5 px-1">
                  {paysOn(d).map((p) => (
                    <span
                      key={p.id}
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ backgroundColor: CATEGORIES[p.categoryId].color }}
                    />
                  ))}
                </span>
              </button>
            ),
          )}
        </div>
      </div>

      {/* day panel */}
      {loaded ? (
        payments.length === 0 ? (
          <div className="card">
            <EmptyState icon="calendar" text={t('common.empty')} />
          </div>
        ) : (
          <section>
            <SectionHeader
              icon="calendar"
              tone="warn"
              title={t('cal.paymentsOn', { date: fmt.date(new Date(year, month, selected)) })}
            />
            {selectedPayments.length === 0 ? (
              <div className="card">
                <EmptyState icon="calendar" tone="neutral" text={t('cal.noPayments')} />
              </div>
            ) : (
              <div className="card px-4">
                {selectedPayments.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setEditPayment(p)}
                    className="tap flex w-full items-center justify-between gap-3 border-t border-line py-3 text-start first:border-t-0"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: CATEGORIES[p.categoryId].color }}
                      />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-ink">{p.title}</p>
                        <p className="truncate text-xs text-ink-soft">{p.recipient}</p>
                      </div>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <span className="num text-sm font-extrabold text-ink">{fmt.currency(p.amount)}</span>
                      <Badge
                        tone={
                          isCurrentMonth ? STATUS_TONE[p.status] : monthOffset > 0 ? 'neutral' : 'success'
                        }
                      >
                        {t(`status.${monthOffset === 0 ? p.status : monthOffset > 0 ? 'upcoming' : 'paid'}`)}
                      </Badge>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </section>
        )
      ) : (
        <>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </>
      )}

      <EditPaymentSheet
        open={editPayment !== null}
        onClose={() => setEditPayment(null)}
        payment={editPayment}
        onSaved={refresh}
      />

      <AddPaymentSheet open={addOpen} onClose={() => setAddOpen(false)} onAdded={refresh} />
    </div>
  )
}
