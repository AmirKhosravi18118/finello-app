import { useState } from 'react'
import { useI18n } from '../i18n/I18nContext'
import { Icon, Modal, Pill } from './ui'
import { CATEGORIES, type CategoryId } from '../data/demo'

const CATEGORY_IDS = Object.keys(CATEGORIES) as CategoryId[]
import { INCOME_TYPES, addCashTx } from '../data/editStore'
import { todayLocalISO } from '../data/demo'

/** Explicit money-entry sheet (WP9): clear expense/income toggle.
 *  Income rows store a positive amount + incomeType; expenses are negated and left uncategorized. */
export function AddMoneySheet({
  open,
  onClose,
  initialMode = 'expense',
  onSaved,
}: {
  open: boolean
  onClose: () => void
  initialMode?: 'expense' | 'income'
  onSaved?: () => void
}) {
  const { t } = useI18n()
  const [mode, setMode] = useState<'expense' | 'income'>(initialMode)
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(todayLocalISO())
  const [incomeType, setIncomeType] = useState<string>('salary')
  const [categoryId, setCategoryId] = useState<CategoryId | null>(null)

  const reset = () => {
    setMode(initialMode)
    setName('')
    setAmount('')
    setDate(todayLocalISO())
    setIncomeType('salary')
    setCategoryId(null)
  }

  const close = () => {
    reset()
    onClose()
  }

  const valid = name.trim() !== '' && Number(amount) > 0

  const save = () => {
    if (!valid) return
    addCashTx({
      name: name.trim(),
      amount: mode === 'income' ? Number(amount) : -Math.abs(Number(amount)),
      date,
      categoryId: mode === 'expense' ? (categoryId ?? null) : null,
      incomeType: mode === 'income' ? (incomeType as never) : null,
    })
    onSaved?.()
    close()
  }

  return (
    <Modal open={open} onClose={close} title={mode === 'income' ? t('cash.income') : t('cash.expense')}>
      <div className="flex flex-col gap-3">
        {/* explicit type toggle */}
        <div>
          <p className="mb-1.5 ps-1 text-xs font-bold text-ink-soft">{t('cash.type')}</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setMode('expense')}
              className={`tap flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-2xl text-sm font-bold ${
                mode === 'expense'
                  ? 'bg-danger-soft text-danger ring-2 ring-danger/40'
                  : 'border border-line bg-surface text-ink-soft'
              }`}
            >
              <Icon name="up" className="h-4 w-4 rotate-180" />
              {t('cash.expense')}
            </button>
            <button
              type="button"
              onClick={() => setMode('income')}
              className={`tap flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-2xl text-sm font-bold ${
                mode === 'income'
                  ? 'bg-primary-soft text-primary-deep ring-2 ring-primary/40'
                  : 'border border-line bg-surface text-ink-soft'
              }`}
            >
              <Icon name="down" className="h-4 w-4 rotate-180" />
              {t('cash.income')}
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="fin-money-name" className="mb-1 block ps-1 text-xs font-bold text-ink-soft">
            {mode === 'income' ? t('tx.name') : t('home.paymentTitle')}
          </label>
          <input
            id="fin-money-name"
            type="text"
            className="field"
            placeholder={mode === 'income' ? 'Gehalt, Nebenjob …' : 'Supermarkt, Miete …'}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="flex gap-3">
          <div className="flex-1">
            <label htmlFor="fin-money-amount" className="mb-1 block ps-1 text-xs font-bold text-ink-soft">
              {t('home.amount')}
            </label>
            <input
              id="fin-money-amount"
              type="number"
              min={0}
              step="0.01"
              className="field num"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <div className="flex-1">
            <label htmlFor="fin-money-date" className="mb-1 block ps-1 text-xs font-bold text-ink-soft">
              {t('tx.date')}
            </label>
            <input
              id="fin-money-date"
              type="date"
              className="field num"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
        </div>

        {mode === 'income' && (
          <div>
            <p className="mb-1.5 ps-1 text-xs font-bold text-ink-soft">{t('cash.incomeType')}</p>
            <div className="flex flex-wrap gap-2">
              {INCOME_TYPES.map((id) => (
                <Pill key={id} active={incomeType === id} onClick={() => setIncomeType(id)}>
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-primary" />
                    {t(`inc.${id}`)}
                  </span>
                </Pill>
              ))}
            </div>
          </div>
        )}
        {mode === 'expense' && (
          <div>
            <p className="mb-1.5 ps-1 text-xs font-bold text-ink-soft">{t('tx.assignCategory')}</p>
            <div className="flex max-h-32 flex-wrap gap-2 overflow-y-auto">
              {CATEGORY_IDS.map((id) => (
                <Pill key={id} active={categoryId === id} onClick={() => setCategoryId(id)}>
                  <span className="flex items-center gap-1.5">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: CATEGORIES[id].color }}
                    />
                    {t(`cat.${id}`)}
                  </span>
                </Pill>
              ))}
            </div>
          </div>
        )}

        <div className="mt-2 flex gap-3">
          <button type="button" className="btn-ghost flex-1" onClick={close}>
            {t('common.cancel')}
          </button>
          <button
            type="button"
            disabled={!valid}
            onClick={save}
            className="btn-primary flex-1 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {t('common.save')}
          </button>
        </div>
      </div>
    </Modal>
  )
}
