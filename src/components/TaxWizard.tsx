import { useState } from 'react'
import { useI18n } from '../i18n/I18nContext'
import { Badge, Card, Icon, Pill } from './ui'

export interface TaxWizardResult {
  taxClass: number
  mandatory: boolean
  pendlerEstimate: number
  homeofficeEstimate: number
  werkstudent: boolean
  savedAt: string
}

const STORAGE_KEY = 'finello_tax_wizard'

// eslint-disable-next-line react-refresh/only-export-components -- helper co-located with its component; splitting adds a file for two lines
export function getWizardResult(): TaxWizardResult | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as TaxWizardResult) : null
  } catch {
    return null
  }
}

interface Answers {
  marital: 'single' | 'marriedBoth' | 'marriedNoIncome' | 'separated'
  employers: number
  grossIncome: number
  hours: number
  enrolled: boolean | null
  km: number
  homeofficeDays: number
  capital: boolean | null
}

const EMPTY: Answers = {
  marital: 'single',
  employers: 1,
  grossIncome: 0,
  hours: 0,
  enrolled: true,
  km: 0,
  homeofficeDays: 0,
  capital: false,
}

function compute(a: Answers): TaxWizardResult {
  const taxClass = a.marital === 'marriedNoIncome' ? 3 : a.marital === 'marriedBoth' ? 4 : 1
  const mandatory = a.employers > 1 || a.capital === true
  const pendlerEstimate = Math.min(4500, Math.round(a.km * 0.3 * 250))
  const homeofficeEstimate = Math.min(1260, a.homeofficeDays * 6)
  return {
    taxClass,
    mandatory,
    pendlerEstimate,
    homeofficeEstimate,
    werkstudent: a.enrolled === true && a.hours > 0 && a.hours <= 20,
    savedAt: new Date().toISOString(),
  }
}

/** 8-question German tax check (sources: docs/TAX_KNOWLEDGE_DE.md §4, engineering input only). */
export function TaxWizard({ onDone }: { onDone: (r: TaxWizardResult) => void }) {
  const { t, fmt } = useI18n()
  const [started, setStarted] = useState(false)
  const [step, setStep] = useState(0)
  const [a, setA] = useState<Answers>(EMPTY)
  const [result, setResult] = useState<TaxWizardResult | null>(null)

  const set = (patch: Partial<Answers>) => setA((prev) => ({ ...prev, ...patch }))
  const total = 8

  const yesNo = (key: 'enrolled' | 'capital', value: Answers['enrolled']) => a[key] === value

  if (result) {
    return (
      <div className="flex flex-col gap-3">
        <Card className="!bg-primary-soft/40">
          <div className="flex items-center gap-2">
            <Icon name="check" className="h-5 w-5 text-primary-deep" />
            <p className="text-sm font-extrabold text-ink">{t('taxwiz.summary')}</p>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Badge tone="success">{t('taxwiz.resultClass', { n: fmt.num(result.taxClass) })}</Badge>
            <Badge tone={result.mandatory ? 'danger' : 'neutral'}>
              {result.mandatory ? t('taxwiz.mandatory') : t('taxwiz.optional')}
            </Badge>
          </div>
          <div className="mt-3 flex flex-col gap-1.5 text-xs font-medium text-ink-soft">
            <p className="num">{t('taxwiz.estPendler', { amount: fmt.currency(result.pendlerEstimate) })}</p>
            <p className="num">
              {t('taxwiz.estHomeoffice', { amount: fmt.currency(result.homeofficeEstimate) })}
            </p>
            {result.werkstudent && <p className="text-primary-deep">{t('taxwiz.werkstudent')}</p>}
          </div>
        </Card>
        <div className="flex gap-3">
          <button
            type="button"
            className="btn-ghost flex-1"
            onClick={() => {
              setResult(null)
              setStep(0)
              setA(EMPTY)
            }}
          >
            {t('taxwiz.redo')}
          </button>
          <button
            type="button"
            className="btn-primary flex-1"
            onClick={() => {
              localStorage.setItem(STORAGE_KEY, JSON.stringify(result))
              onDone(result)
            }}
          >
            {t('taxwiz.save')}
          </button>
        </div>
      </div>
    )
  }

  if (!started) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm font-medium text-ink-soft">
          {t('taxwiz.step', { n: fmt.num(8), total: fmt.num(8) })} · {t('taxwiz.title')}
        </p>
        <button type="button" className="btn-primary w-full" onClick={() => setStarted(true)}>
          {t('taxwiz.start')}
        </button>
      </div>
    )
  }

  const NumberField = ({
    id,
    value,
    onChange,
  }: {
    id: string
    value: number
    onChange: (n: number) => void
  }) => (
    <input
      id={id}
      type="number"
      min={0}
      className="field num"
      value={value === 0 ? '' : value}
      onChange={(e) => onChange(Number(e.target.value))}
    />
  )

  return (
    <div className="flex flex-col gap-4">
      <p className="num text-xs font-bold text-ink-soft">
        {t('taxwiz.step', { n: fmt.num(step + 1), total: fmt.num(total) })}
      </p>

      {step === 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-sm font-extrabold text-ink">{t('taxwiz.q1')}</p>
          {(['single', 'marriedBoth', 'marriedNoIncome', 'separated'] as const).map((v) => (
            <Pill key={v} active={a.marital === v} onClick={() => set({ marital: v })}>
              {t(`taxwiz.${v}`)}
            </Pill>
          ))}
        </div>
      )}
      {step === 1 && (
        <div>
          <label htmlFor="wiz-employers" className="mb-1 block text-sm font-extrabold text-ink">
            {t('taxwiz.q2')}
          </label>
          <NumberField id="wiz-employers" value={a.employers} onChange={(n) => set({ employers: n })} />
        </div>
      )}
      {step === 2 && (
        <div>
          <label htmlFor="wiz-gross" className="mb-1 block text-sm font-extrabold text-ink">
            {t('taxwiz.q3')}
          </label>
          <NumberField id="wiz-gross" value={a.grossIncome} onChange={(n) => set({ grossIncome: n })} />
        </div>
      )}
      {step === 3 && (
        <div>
          <label htmlFor="wiz-hours" className="mb-1 block text-sm font-extrabold text-ink">
            {t('taxwiz.q4')}
          </label>
          <NumberField id="wiz-hours" value={a.hours} onChange={(n) => set({ hours: n })} />
        </div>
      )}
      {step === 4 && (
        <div className="flex flex-col gap-2">
          <p className="text-sm font-extrabold text-ink">{t('taxwiz.q5')}</p>
          <div className="flex gap-2">
            <Pill active={yesNo('enrolled', true)} onClick={() => set({ enrolled: true })}>
              {t('taxwiz.yes')}
            </Pill>
            <Pill active={a.enrolled === false} onClick={() => set({ enrolled: false })}>
              {t('taxwiz.no')}
            </Pill>
          </div>
        </div>
      )}
      {step === 5 && (
        <div>
          <label htmlFor="wiz-km" className="mb-1 block text-sm font-extrabold text-ink">
            {t('taxwiz.q6')}
          </label>
          <NumberField id="wiz-km" value={a.km} onChange={(n) => set({ km: n })} />
        </div>
      )}
      {step === 6 && (
        <div>
          <label htmlFor="wiz-ho" className="mb-1 block text-sm font-extrabold text-ink">
            {t('taxwiz.q7')}
          </label>
          <NumberField id="wiz-ho" value={a.homeofficeDays} onChange={(n) => set({ homeofficeDays: n })} />
        </div>
      )}
      {step === 7 && (
        <div className="flex flex-col gap-2">
          <p className="text-sm font-extrabold text-ink">{t('taxwiz.q8')}</p>
          <div className="flex gap-2">
            <Pill active={a.capital === true} onClick={() => set({ capital: true })}>
              {t('taxwiz.yes')}
            </Pill>
            <Pill active={a.capital === false} onClick={() => set({ capital: false })}>
              {t('taxwiz.no')}
            </Pill>
          </div>
        </div>
      )}

      <div className="mt-2 flex gap-3">
        <button
          type="button"
          className="btn-ghost flex-1"
          onClick={() => (step === 0 ? setStarted(false) : setStep((s) => s - 1))}
        >
          {t('taxwiz.back')}
        </button>
        {step < total - 1 ? (
          <button type="button" className="btn-primary flex-1" onClick={() => setStep((s) => s + 1)}>
            {t('taxwiz.next')}
          </button>
        ) : (
          <button type="button" className="btn-primary flex-1" onClick={() => setResult(compute(a))}>
            {t('taxwiz.finish')}
          </button>
        )}
      </div>
    </div>
  )
}
