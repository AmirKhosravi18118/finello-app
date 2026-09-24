import { useEffect, useState } from 'react'
import { useI18n } from '../i18n/I18nContext'
import {
  Badge,
  Card,
  EmptyState,
  Icon,
  IconChip,
  Modal,
  SectionHeader,
  SkeletonCard,
  SkeletonStats,
  StatTile,
  type Tone,
} from '../components/ui'
import { AddPaymentSheet } from '../components/AddPaymentFab'
import { EditPaymentSheet } from '../components/EditPaymentSheet'
import { AddMoneySheet } from '../components/AddMoneySheet'
import { CATEGORIES, demo, type Payment } from '../data/demo'
import type { PayStatus } from '../data/demo'
import { getSalary, setSalary } from '../data/editStore'
import { allPayments, nearestPayments } from '../data/paymentsView'
import { monthMoney, visibleTransactions } from '../data/incomeView'
import { userProfile } from '../auth/account'

const STATUS_TONE: Record<PayStatus, Tone> = {
  today: 'warn',
  overdue: 'danger',
  upcoming: 'neutral',
  paid: 'success',
}

/** Cross-tab quick-add signal (DS2.0 §5) — dispatched by BottomNav. */
const QUICK_ADD_EVENT = 'finello:quick-add'

export function HomeScreen() {
  const { t, fmt } = useI18n()
  const [editPayment, setEditPayment] = useState<Payment | null>(null)
  const [salaryOpen, setSalaryOpen] = useState(false)
  const [incomeOpen, setIncomeOpen] = useState(false)
  const [addOpen, setAddOpen] = useState(false)
  const [, setVersion] = useState(0)
  const refresh = () => setVersion((v) => v + 1)

  // simulated fetch so skeleton states are actually visible
  const [loaded, setLoaded] = useState(false)
  useEffect(() => {
    const id = window.setTimeout(() => setLoaded(true), 350)
    return () => window.clearTimeout(id)
  }, [])

  // bottom-nav quick add → payment sheet
  useEffect(() => {
    const handler = (e: Event) => {
      if ((e as CustomEvent<'expense' | 'payment' | 'income'>).detail === 'payment') setAddOpen(true)
    }
    window.addEventListener(QUICK_ADD_EVENT, handler)
    return () => window.removeEventListener(QUICK_ADD_EVENT, handler)
  }, [])

  const salary = getSalary() ?? { day: demo.salaryDay, amount: demo.salaryAmount }
  const [salaryDay, setSalaryDay] = useState(String(salary.day))
  const [salaryAmount, setSalaryAmount] = useState(String(salary.amount))

  const now = new Date()
  const dayNow = now.getDate()
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  const diff = salary.day - dayNow
  const salaryValue =
    diff === 0 ? t('home.paydayToday') : fmt.num(diff > 0 ? diff : daysInMonth - dayNow + salary.day)

  const payments = allPayments()
  const nextPayments = nearestPayments(payments, 3)
  const money = monthMoney(visibleTransactions())
  const profile = userProfile()

  const salaryValid = Number(salaryDay) >= 1 && Number(salaryDay) <= 31 && Number(salaryAmount) > 0

  return (
    <div className="flex flex-col gap-5">
      {/* gradient hero (v3): greeting small → balance HUGE → surplus badge inline → glass chips */}
      <section className="hero-gradient shadow-card screen-in rounded-[24px] p-5 text-white">
        <div className="flex items-center justify-between gap-2">
          <p className="min-w-0 text-[11px] font-bold uppercase tracking-[0.12em] text-white/70">
            {profile.name ? t('home.greeting', { name: profile.name }) : t('home.guest')}
          </p>
          {profile.status && (
            <span className="shrink-0 rounded-full bg-white/12 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.06em] text-white/80 backdrop-blur-sm">
              {profile.status}
            </span>
          )}
        </div>
        <p className="mt-4 text-xs font-medium text-white/60">{t('home.balance')}</p>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-2">
          <p className="num text-[30px] font-extrabold leading-[1.1] tracking-[-0.02em]">
            {fmt.currency(money.balance)}
          </p>
          <span
            className={`badge backdrop-blur-sm ${money.balance >= 0 ? 'bg-white/12 text-primary' : 'bg-white/12 text-danger'}`}
          >
            {money.balance >= 0 ? t('home.surplus') : t('home.deficit')}
          </span>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setIncomeOpen(true)}
            aria-label={t('cash.income')}
            className="tap rounded-2xl bg-white/12 p-3 text-start backdrop-blur-sm"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="min-w-0 text-[11px] font-bold text-white/70">{t('home.monthIncome')}</p>
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/20 text-white">
                <Icon name="plus" className="h-3.5 w-3.5" />
              </span>
            </div>
            <p className="num mt-0.5 text-base font-extrabold leading-[1.1]">{fmt.currency(money.income)}</p>
          </button>
          <div className="rounded-2xl bg-white/12 p-3 backdrop-blur-sm">
            <p className="text-[11px] font-bold text-white/70">{t('home.monthExpense')}</p>
            <p className="num mt-0.5 text-base font-extrabold leading-[1.1]">{fmt.currency(money.expense)}</p>
          </div>
        </div>

        {money.incomeByType.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1">
            {money.incomeByType.map(({ type, total }) => (
              <span key={type} className="flex items-center gap-1.5 text-[11px] font-medium text-white/70">
                <span className="h-2 w-2 rounded-full bg-primary" />
                {t(`inc.${type}`)}
                <span className="num font-bold">{fmt.currency(total)}</span>
              </span>
            ))}
          </div>
        )}
      </section>

      {!loaded ? (
        <>
          <SkeletonStats />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </>
      ) : (
        <>
          {/* quick actions (v3): payment / income / expense via existing quick-add wiring */}
          <section className="grid grid-cols-3 gap-3" aria-label={t('qa.title')}>
            <button
              type="button"
              onClick={() =>
                window.dispatchEvent(new CustomEvent<'payment'>(QUICK_ADD_EVENT, { detail: 'payment' }))
              }
              className="tap card flex flex-col items-center gap-2 p-3"
            >
              <IconChip icon="calendar" tone="warn" />
              <span className="text-center text-[11px] font-bold leading-tight text-ink">
                {t('qa.payment')}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setIncomeOpen(true)}
              className="tap card flex flex-col items-center gap-2 p-3"
            >
              <IconChip icon="down" tone="success" />
              <span className="text-center text-[11px] font-bold leading-tight text-ink">
                {t('qa.income')}
              </span>
            </button>
            <button
              type="button"
              onClick={() => {
                window.dispatchEvent(new CustomEvent('finello:goto', { detail: 'transactions' }))
                window.setTimeout(
                  () =>
                    window.dispatchEvent(new CustomEvent<'expense'>(QUICK_ADD_EVENT, { detail: 'expense' })),
                  80,
                )
              }}
              className="tap card flex flex-col items-center gap-2 p-3"
            >
              <IconChip icon="up" tone="danger" />
              <span className="text-center text-[11px] font-bold leading-tight text-ink">
                {t('qa.expense')}
              </span>
            </button>
          </section>

          {/* payday + savings tiles */}
          <section className="grid grid-cols-2 gap-3">
            <button
              type="button"
              aria-label={t('home.salaryCountdown')}
              className="tap w-full text-start"
              onClick={() => setSalaryOpen(true)}
            >
              <StatTile
                tone="success"
                icon="calendar"
                label={t('home.salaryCountdown')}
                value={salaryValue}
                sub={t('home.salaryDayOf', { n: fmt.num(salary.day) })}
                progress={dayNow / daysInMonth}
              />
            </button>
            <StatTile
              icon="bank"
              label={t('home.savings')}
              value={fmt.currency(demo.savings.amount)}
              sub={t('home.savingsGoal', { goal: fmt.currency(demo.savings.goal) })}
              progress={demo.savings.amount / demo.savings.goal}
            />
          </section>

          {/* nearest payments */}
          <section className="screen-in">
            <SectionHeader
              icon="bell"
              tone="warn"
              title={t('home.nextPayments')}
              action={
                <button
                  type="button"
                  aria-label={t('nav.calendar')}
                  onClick={() =>
                    window.dispatchEvent(new CustomEvent('finello:goto', { detail: 'calendar' }))
                  }
                  className="tap flex h-11 w-11 items-center justify-center rounded-2xl bg-chip text-ink"
                >
                  <Icon name="calendar" className="h-4.5 w-4.5" />
                </button>
              }
            />
            {nextPayments.length === 0 ? (
              <Card>
                <EmptyState icon="calendar" text={t('home.emptyPayments')} />
              </Card>
            ) : (
              <div className="card anim-stagger px-5">
                {nextPayments.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setEditPayment(p)}
                    className="tap flex w-full items-center justify-between gap-3 border-t border-line py-3 text-start first:border-t-0"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span
                        className="num flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-sm font-bold"
                        style={{
                          backgroundColor: `${CATEGORIES[p.categoryId].color}1f`,
                          color: CATEGORIES[p.categoryId].color,
                        }}
                      >
                        {fmt.num(p.dayOfMonth)}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-bold leading-snug text-ink">{p.title}</p>
                        <p className="t-caption">{p.recipient}</p>
                      </div>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <span className="num text-sm font-extrabold leading-[1.1] text-ink">
                        {fmt.currency(p.amount)}
                      </span>
                      <Badge tone={STATUS_TONE[p.status]}>{t(`status.${p.status}`)}</Badge>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </section>
        </>
      )}

      {/* quick-add lives in the nav + menu (drop-up); income chip above also opens income */}

      <EditPaymentSheet
        open={editPayment !== null}
        onClose={() => setEditPayment(null)}
        payment={editPayment}
        onSaved={refresh}
      />

      <AddMoneySheet
        open={incomeOpen}
        onClose={() => setIncomeOpen(false)}
        initialMode="income"
        onSaved={refresh}
      />

      <AddPaymentSheet open={addOpen} onClose={() => setAddOpen(false)} onAdded={refresh} />

      <Modal open={salaryOpen} onClose={() => setSalaryOpen(false)} title={t('home.salaryCountdown')}>
        <div className="flex flex-col gap-3">
          <div className="flex gap-3">
            <div className="flex-1">
              <label htmlFor="fin-salary-day" className="mb-1 block ps-1 text-xs font-bold text-ink-soft">
                {t('home.dayOfMonth')}
              </label>
              <input
                id="fin-salary-day"
                type="number"
                min={1}
                max={31}
                className="field num"
                value={salaryDay}
                onChange={(e) => setSalaryDay(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <label htmlFor="fin-salary-amount" className="mb-1 block ps-1 text-xs font-bold text-ink-soft">
                {t('home.amount')}
              </label>
              <input
                id="fin-salary-amount"
                type="number"
                min={0}
                className="field num"
                value={salaryAmount}
                onChange={(e) => setSalaryAmount(e.target.value)}
              />
            </div>
          </div>
          <div className="mt-2 flex gap-3">
            <button type="button" className="btn-ghost flex-1" onClick={() => setSalaryOpen(false)}>
              {t('common.cancel')}
            </button>
            <button
              type="button"
              disabled={!salaryValid}
              className="btn-primary flex-1 disabled:cursor-not-allowed disabled:opacity-40"
              onClick={() => {
                setSalary({ day: Number(salaryDay), amount: Number(salaryAmount) })
                refresh()
                setSalaryOpen(false)
              }}
            >
              {t('common.save')}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
