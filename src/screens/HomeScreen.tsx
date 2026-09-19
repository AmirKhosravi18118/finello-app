import { useState } from 'react'
import { useI18n } from '../i18n/I18nContext'
import { Badge, Card, Modal, ProgressBar, SectionTitle, StatCard, type Tone } from '../components/ui'
import { AddPaymentFab } from '../components/AddPaymentFab'
import { EditPaymentSheet } from '../components/EditPaymentSheet'
import { demo, type PayStatus, type Payment } from '../data/demo'
import { getSalary, setSalary } from '../data/editStore'
import { allPayments, nearestPayments } from '../data/paymentsView'
import { monthMoney, visibleTransactions } from '../data/incomeView'

const STATUS_TONE: Record<PayStatus, Tone> = {
  today: 'warn',
  overdue: 'danger',
  upcoming: 'neutral',
  paid: 'success',
}

export function HomeScreen() {
  const { t, fmt } = useI18n()
  const [editPayment, setEditPayment] = useState<Payment | null>(null)
  const [salaryOpen, setSalaryOpen] = useState(false)
  const [, setVersion] = useState(0)
  const refresh = () => setVersion((v) => v + 1)

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

  const salaryValid = Number(salaryDay) >= 1 && Number(salaryDay) <= 31 && Number(salaryAmount) > 0

  return (
    <div className="flex flex-col gap-4">
      <Card className="!p-5">
        <h1 className="text-xl font-extrabold text-ink">{t('home.greeting', { name: demo.user.name })}</h1>
        <p className="mt-1 text-sm font-medium text-ink-soft">{demo.user.status}</p>
      </Card>

      <div className="flex flex-col gap-1.5">
        <button type="button" className="tap text-start" onClick={() => setSalaryOpen(true)}>
          <StatCard
            tone="success"
            label={t('home.salaryCountdown')}
            value={salaryValue}
            sub={t('home.salaryDayOf', { n: fmt.num(salary.day) })}
          />
        </button>
        <p className="num ps-4 text-sm font-bold text-primary-deep">{fmt.currency(salary.amount)}</p>
      </div>

      <Card>
        <SectionTitle title={t('home.balance')} />
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <p className="num text-xl font-extrabold text-ink">{fmt.currency(money.balance)}</p>
          <span
            className={`badge ${money.balance >= 0 ? 'bg-primary-soft text-primary-deep' : 'bg-danger-soft text-danger'}`}
          >
            {money.balance >= 0 ? t('home.surplus') : t('home.deficit')}
          </span>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="rounded-2xl bg-primary-soft/50 p-3">
            <p className="text-[11px] font-bold text-primary-deep">{t('home.monthIncome')}</p>
            <p className="num mt-0.5 text-base font-extrabold text-primary-deep">
              {fmt.currency(money.income)}
            </p>
          </div>
          <div className="rounded-2xl bg-slate-100 p-3">
            <p className="text-[11px] font-bold text-ink-soft">{t('home.monthExpense')}</p>
            <p className="num mt-0.5 text-base font-extrabold text-ink">{fmt.currency(money.expense)}</p>
          </div>
        </div>
        {money.incomeByType.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
            {money.incomeByType.map(({ type, total }) => (
              <span key={type} className="flex items-center gap-1.5 text-[11px] font-medium text-ink-soft">
                <span className="h-2 w-2 rounded-full bg-primary" />
                {t(`inc.${type}`)}
                <span className="num font-bold">{fmt.currency(total)}</span>
              </span>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <SectionTitle title={t('home.nextPayments')} />
        {nextPayments.length === 0 ? (
          <p className="py-4 text-center text-sm font-medium text-ink-soft">{t('home.emptyPayments')}</p>
        ) : (
          <div className="flex flex-col">
            {nextPayments.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setEditPayment(p)}
                className="tap -mx-1 flex items-center justify-between gap-3 rounded-xl px-1 py-2.5 text-start border-t border-slate-100 first:border-t-0"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="num flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-sm font-bold text-ink">
                    {fmt.num(p.dayOfMonth)}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-ink">{p.title}</p>
                    <p className="truncate text-xs text-ink-soft">{p.recipient}</p>
                  </div>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <span className="num text-sm font-extrabold text-ink">{fmt.currency(p.amount)}</span>
                  <Badge tone={STATUS_TONE[p.status]}>{t(`status.${p.status}`)}</Badge>
                </div>
              </button>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <SectionTitle title={t('home.savings')} />
        <p className="num text-xl font-extrabold text-ink">{fmt.currency(demo.savings.amount)}</p>
        <div className="mt-2">
          <ProgressBar value={demo.savings.amount / demo.savings.goal} label={t('home.savings')} />
        </div>
        <p className="mt-1.5 text-xs font-medium text-ink-soft">
          {t('home.savingsGoal', { goal: fmt.currency(demo.savings.goal) })}
        </p>
      </Card>

      <EditPaymentSheet
        open={editPayment !== null}
        onClose={() => setEditPayment(null)}
        payment={editPayment}
        onSaved={refresh}
      />

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

      <AddPaymentFab onAdded={refresh} />
    </div>
  )
}
