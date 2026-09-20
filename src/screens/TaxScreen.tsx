import { useEffect, useState } from 'react'
import { useI18n } from '../i18n/I18nContext'
import { demo, type TaxItem } from '../data/demo'
import {
  AppHeader,
  Badge,
  Card,
  EmptyState,
  Icon,
  Modal,
  Pill,
  SectionHeader,
  SkeletonCard,
  StatTile,
} from '../components/ui'
import { TaxWizard, getWizardResult, type TaxWizardResult } from '../components/TaxWizard'
import { addTaxExtra, getTaxExtras } from '../data/editStore'
import { todayLocalISO } from '../data/demo'
import { userProfile } from '../auth/account'

const CURRENT_YEAR = new Date().getFullYear()
const YEARS = [CURRENT_YEAR - 2, CURRENT_YEAR - 1, CURRENT_YEAR]

/** Parse a yyyy-mm-dd string as local midnight so the formatted day never shifts. */
const parseDate = (s: string) => new Date(`${s}T00:00:00`)

export function TaxScreen() {
  const { t, fmt } = useI18n()
  const profile = userProfile()
  const [year, setYear] = useState(CURRENT_YEAR)
  const [extras, setExtras] = useState<TaxItem[]>(() => getTaxExtras())
  const items = [...demo.tax.items, ...extras]
  const [formOpen, setFormOpen] = useState(false)
  const [wizardOpen, setWizardOpen] = useState(false)
  const [wizardResult, setWizardResult] = useState<TaxWizardResult | null>(() => getWizardResult())
  const [category, setCategory] = useState('')
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [date, setDate] = useState('')

  // simulated fetch so skeleton states are actually visible
  const [loaded, setLoaded] = useState(false)
  useEffect(() => {
    const id = window.setTimeout(() => setLoaded(true), 350)
    return () => window.clearTimeout(id)
  }, [])

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
        date: date || todayLocalISO(),
        year,
      }),
      ...prev,
    ])
    closeForm()
  }

  return (
    <div className="flex flex-col gap-5">
      <AppHeader
        overline={fmt.num(year)}
        title={t('nav.tax')}
        trailing={
          <button
            type="button"
            aria-label={t('tax.wizard')}
            onClick={() => setWizardOpen(true)}
            className="tap shadow-card flex h-11 w-11 items-center justify-center rounded-2xl bg-navy text-white"
          >
            <Icon name="tax" className="h-5 w-5" />
          </button>
        }
      />

      {/* wizard result card */}
      {wizardResult && (
        <Card className="!bg-primary-soft/30">
          <div className="flex flex-wrap items-center gap-2">
            <Icon name="check" className="h-4 w-4 text-primary-deep" />
            <p className="text-xs font-extrabold text-ink">{t('taxwiz.summary')}</p>
            <Badge tone="success">{t('taxwiz.resultClass', { n: fmt.num(wizardResult.taxClass) })}</Badge>
            <Badge tone={wizardResult.mandatory ? 'danger' : 'neutral'}>
              {wizardResult.mandatory ? t('taxwiz.mandatory') : t('taxwiz.optional')}
            </Badge>
          </div>
        </Card>
      )}

      {/* wizard */}
      <button type="button" className="btn-ghost w-full" onClick={() => setWizardOpen(true)}>
        <Icon name="tax" className="h-5 w-5" />
        {t('tax.wizard')}
      </button>

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
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-primary-deep">
          <Icon name="user" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-base font-extrabold text-ink">{profile.name}</p>
            <Badge tone="success">{t('tax.taxClass', { n: fmt.num(demo.tax.profile.taxClass) })}</Badge>
          </div>
          <div className="mt-1 flex items-baseline justify-between gap-2 text-sm">
            <span className="shrink-0 font-medium text-ink-soft">{t('tax.employment')}</span>
            <span className="truncate font-bold text-ink">{demo.tax.profile.employment}</span>
          </div>
        </div>
      </Card>

      {/* deductibles */}
      <section>
        <SectionHeader icon="receipt" tone="success" title={t('tax.deductibles')} />
        {!loaded ? (
          <div className="flex flex-col gap-3">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : (
          <Card>
            {filtered.length === 0 ? (
              <EmptyState icon="tax" text={t('tax.emptyTax')} />
            ) : (
              <>
                <div className="divide-y divide-line">
                  {filtered.map((it) => (
                    <div key={it.id} className="flex items-start justify-between gap-3 py-3">
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
                </div>
                <div className="flex items-center justify-between border-t border-line/70 pt-3">
                  <span className="text-sm font-bold text-ink-soft">{t('common.total')}</span>
                  <span className="num text-end text-base font-extrabold text-ink">{fmt.currency(sum)}</span>
                </div>
              </>
            )}
          </Card>
        )}
      </section>

      {/* add deductible */}
      <button type="button" onClick={() => setFormOpen(true)} className="btn-primary w-full">
        <Icon name="plus" className="h-4 w-4" />
        {t('tax.addDeductible')}
      </button>

      {/* readiness summary */}
      <section>
        <StatTile
          tone="success"
          icon="check"
          label={t('tax.readyForReturn', { rows: filtered.length, amount: fmt.currency(sum) })}
          value={fmt.currency(sum)}
        />
        <p className="mt-1 px-1 text-[11px] text-ink-soft">{t('tax.disclaimer')}</p>
      </section>

      {/* tax wizard modal */}
      <Modal open={wizardOpen} onClose={() => setWizardOpen(false)} title={t('taxwiz.title')}>
        <TaxWizard
          onDone={(r) => {
            setWizardResult(r)
            setWizardOpen(false)
          }}
        />
      </Modal>

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
