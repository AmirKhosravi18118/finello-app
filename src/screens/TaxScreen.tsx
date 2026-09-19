import { useState } from 'react'
import { useI18n } from '../i18n/I18nContext'
import { demo, type TaxItem } from '../data/demo'
import { Badge, Card, Icon, Modal, Pill, SectionTitle, StatCard } from '../components/ui'
import { addTaxExtra, getTaxExtras } from '../data/editStore'

const CURRENT_YEAR = new Date().getFullYear()
const YEARS = [CURRENT_YEAR - 2, CURRENT_YEAR - 1, CURRENT_YEAR]

/** Parse a yyyy-mm-dd string as local midnight so the formatted day never shifts. */
const parseDate = (s: string) => new Date(`${s}T00:00:00`)

export function TaxScreen() {
  const { t, fmt } = useI18n()
  const [year, setYear] = useState(CURRENT_YEAR)
  const [extras, setExtras] = useState<TaxItem[]>(() => getTaxExtras())
  const items = [...demo.tax.items, ...extras]
  const [formOpen, setFormOpen] = useState(false)
  const [category, setCategory] = useState('')
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [date, setDate] = useState('')

  const filtered = items.filter((it) => it.year === year)
  const sum = filtered.reduce((s, it) => s + it.amount, 0)

  const closeForm = () => {
    setFormOpen(false)
    setCategory('')
    setAmount('')
    setNote('')
    setDate('')
  }

  const formValid = category.trim() !== '' && Number(amount) > 0

  const saveItem = () => {
    if (!formValid) return
    setExtras((prev) => [
      addTaxExtra({
        category: category.trim(),
        amount: Number(amount),
        note: note.trim(),
        date: date || new Date().toISOString().slice(0, 10),
        year,
      }),
      ...prev,
    ])
    closeForm()
  }

  return (
    <div className="flex flex-col gap-5">
      <SectionTitle title={t('nav.tax')} />

      {/* year selector */}
      <div className="flex gap-2">
        {YEARS.map((y) => (
          <Pill key={y} active={year === y} onClick={() => setYear(y)}>
            <span className="num">{fmt.num(y)}</span>
          </Pill>
        ))}
      </div>

      {/* tax profile */}
      <Card className="flex items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary-deep">
          <Icon name="user" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-base font-extrabold text-ink">{demo.user.name}</p>
            <Badge tone="success">{t('tax.taxClass', { n: fmt.num(demo.tax.profile.taxClass) })}</Badge>
          </div>
          <div className="mt-1 flex items-baseline justify-between gap-2 text-sm">
            <span className="shrink-0 font-medium text-ink-soft">{t('tax.employment')}</span>
            <span className="truncate font-bold text-ink">{demo.tax.profile.employment}</span>
          </div>
        </div>
      </Card>

      {/* deductibles */}
      <div>
        <SectionTitle title={t('tax.deductibles')} />
        <Card className="flex flex-col gap-3">
          {filtered.length === 0 ? (
            <p className="py-2 text-sm font-medium text-ink-soft">{t('tax.emptyTax')}</p>
          ) : (
            <>
              {filtered.map((it) => (
                <div key={it.id} className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-ink">{it.category}</p>
                    <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-ink-soft">
                      <span>{fmt.date(parseDate(it.date))}</span>
                      {it.note && <span>{it.note}</span>}
                    </p>
                  </div>
                  <span className="num shrink-0 text-end text-sm font-bold text-ink">
                    {fmt.currency(it.amount)}
                  </span>
                </div>
              ))}
              <div className="flex items-center justify-between border-t border-slate-200/70 pt-3">
                <span className="text-sm font-bold text-ink-soft">{t('common.total')}</span>
                <span className="num text-end text-base font-extrabold text-ink">{fmt.currency(sum)}</span>
              </div>
            </>
          )}
        </Card>
      </div>

      {/* add deductible */}
      <button type="button" onClick={() => setFormOpen(true)} className="btn-primary w-full">
        <Icon name="plus" className="h-4 w-4" />
        {t('tax.addDeductible')}
      </button>

      {/* readiness summary */}
      <div>
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary-deep">
            <Icon name="check" />
          </span>
          <StatCard
            tone="success"
            label={t('tax.readyForReturn', { rows: filtered.length, amount: fmt.currency(sum) })}
            value={fmt.currency(sum)}
          />
        </div>
        <p className="mt-1 px-1 text-[11px] text-ink-soft">{t('tax.disclaimer')}</p>
      </div>

      {/* add deductible modal */}
      <Modal open={formOpen} onClose={closeForm} title={t('tax.addDeductible')}>
        <div className="flex flex-col gap-3">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-bold text-ink-soft">{t('tax.category')}</span>
            <input className="field" value={category} onChange={(e) => setCategory(e.target.value)} />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-bold text-ink-soft">{t('tax.amount')}</span>
            <input
              type="number"
              min="0"
              step="1"
              className="field num"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-bold text-ink-soft">{t('tax.note')}</span>
            <input className="field" value={note} onChange={(e) => setNote(e.target.value)} />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-bold text-ink-soft">{t('tax.date')}</span>
            <input type="date" className="field num" value={date} onChange={(e) => setDate(e.target.value)} />
          </label>
          <div className="mt-1 flex gap-2">
            <button type="button" onClick={closeForm} className="btn-ghost flex-1">
              {t('common.cancel')}
            </button>
            <button
              type="button"
              onClick={saveItem}
              disabled={!formValid}
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
