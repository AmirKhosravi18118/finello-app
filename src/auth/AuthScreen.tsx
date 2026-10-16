import { useEffect, useState } from 'react'
import { useI18n, type Lang } from '../i18n/I18nContext'
import { Badge, Card, Icon, Pill } from '../components/ui'
import { LegalSheet } from '../components/LegalSheet'
import type { LegalDocKey } from '../legal/legalContent'
import { LEGAL_VERSION } from '../legal/legalContent'
import { getAccount, saveAccount, ACCOUNT_EVENT, type Account, type AccountConsent } from './account'
import { connectLiveBank, importLiveTransactions, useBankLive } from '../bank/bankConnection'
import { setSalary, setSavings } from '../data/editStore'
import { BrandMark } from '../components/Brand'

/* ---------- language step ---------- */

const LANGS: Array<{ id: Lang; label: string }> = [
  { id: 'fa', label: 'فارسی' },
  { id: 'de', label: 'Deutsch' },
  { id: 'en', label: 'English' },
]

/* ---------- auth screen (login + signup + setup + optional bank) ---------- */

export function AuthScreen({ onDone }: { onDone: () => void }) {
  const live = useBankLive()
  const { t, setLang, lang } = useI18n()
  const existing = getAccount()
  const [mode, setMode] = useState<'consent' | 'login' | 'signup' | 'setup' | 'bank'>(
    existing ? 'login' : 'consent',
  )
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [pin, setPin] = useState('')
  const [loginPin, setLoginPin] = useState('')
  const [err, setErr] = useState('')
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState({
    marital: 'single',
    occupation: 'werkstudent',
    hours: '',
    km: '',
    salaryDay: '',
    netSalary: '',
    goal: '',
  })
  const [accepted, setAccepted] = useState(false)
  const [consent, setConsent] = useState<AccountConsent | null>(null)
  const [legalOpen, setLegalOpen] = useState<LegalDocKey | null>(null)

  useEffect(() => {
    // pull live bank redirect result (?live=1&bank=<id>&name=<display>) after consent
    const p = new URLSearchParams(location.search)
    if (p.get('live') === '1') {
      const id = p.get('bank') ?? 'live'
      connectLiveBank({ id, name: p.get('name') ?? id })
      history.replaceState(null, '', location.pathname)
      window.dispatchEvent(new CustomEvent('finello:bank-imported', { detail: 0 }))
      void importLiveTransactions().then((n) =>
        window.dispatchEvent(new CustomEvent('finello:bank-imported', { detail: n })),
      )
    }
  }, [])

  const finish = (a: Account) => {
    saveAccount(a)
    localStorage.setItem('finello_onboarded', '1')
    window.dispatchEvent(new Event(ACCOUNT_EVENT))
    onDone()
  }

  const buildAccount = (): Account => ({
    name: name.trim() || existing?.name || 'Friend',
    email: email || existing?.email || '',
    pin: pin || undefined,
    createdAt: existing?.createdAt ?? new Date().toISOString(),
    setup: {
      marital: answers.marital,
      occupation: answers.occupation,
      hours: Number(answers.hours) || 0,
      km: Number(answers.km) || 0,
    },
    consent: consent ?? existing?.consent,
  })

  const persistExtras = () => {
    const day = Number(answers.salaryDay)
    const net = Number(answers.netSalary)
    if (day >= 1 && day <= 31 && net > 0) setSalary({ day, amount: net })
    const goal = Number(answers.goal)
    if (goal > 0) setSavings({ goal, amount: 0 })
  }

  /* language row */
  const langRow = (
    <div className="flex gap-2">
      {LANGS.map((l) => (
        <Pill key={l.id} active={lang === l.id} onClick={() => setLang(l.id)}>
          {l.label}
        </Pill>
      ))}
    </div>
  )

  /* step progress dots (v3): one per setup question, filled as the user advances */
  const stepDots = (
    <div
      className="flex items-center gap-1.5"
      role="img"
      aria-label={t('auth.step', { n: String(step + 1), total: '3' })}
    >
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className={`h-1.5 rounded-full transition-all duration-300 ${
            i === step ? 'w-5 bg-primary' : i < step ? 'w-1.5 bg-primary/50' : 'w-1.5 bg-line'
          }`}
        />
      ))}
    </div>
  )

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-5 py-8">
      {/* minimal split hero (v3): compact identity block, form lives below the fold */}
      <div className="hero-gradient screen-in mb-6 rounded-[24px] p-5 text-white shadow-card">
        <BrandMark className="h-11 w-11 shrink-0 rounded-[10px] shadow-card" />
        <h1 className="mt-4 text-[24px] font-extrabold leading-[1.1] tracking-[-0.02em]">
          {mode === 'login' ? t('auth.helloBack') : t('auth.welcome')}
        </h1>
        <p className="mt-1.5 text-sm font-[450] leading-[1.4] text-white/75">{t('auth.sub')}</p>
        <div className="mt-4">{langRow}</div>
      </div>

      {mode === 'login' && existing && (
        <Card className="screen-in flex flex-col gap-3 !p-5" style={{ animationDelay: '60ms' }}>
          <p className="text-sm font-bold text-ink">{existing.name}</p>
          {existing.pin && (
            <input
              className="field num"
              type="password"
              inputMode="numeric"
              maxLength={4}
              placeholder={t('auth.pin')}
              value={loginPin}
              onChange={(e) => setLoginPin(e.target.value)}
            />
          )}
          {err && <p className="text-xs font-bold text-danger">{err}</p>}
          <button
            type="button"
            className="btn-primary w-full"
            onClick={() => {
              if (existing.pin && loginPin !== existing.pin) {
                setErr(t('auth.wrongPin'))
                return
              }
              finish(existing)
            }}
          >
            {t('auth.loginBtn')}
          </button>
        </Card>
      )}

      {mode === 'signup' && (
        <Card className="screen-in flex flex-col gap-3 !p-5" style={{ animationDelay: '60ms' }}>
          <input
            className="field"
            placeholder={t('auth.name')}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            className="field"
            placeholder={t('auth.email')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="field num"
            type="password"
            inputMode="numeric"
            maxLength={4}
            placeholder={t('auth.pin')}
            value={pin}
            onChange={(e) => setPin(e.target.value)}
          />
          {err && <p className="text-xs font-bold text-danger">{err}</p>}
          <button
            type="button"
            className="btn-primary w-full"
            onClick={() => {
              if (name.trim().length < 2) return setErr(t('auth.needName'))
              if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return setErr(t('auth.invalidEmail'))
              setErr('')
              setMode('setup')
            }}
          >
            {t('auth.create')}
          </button>
        </Card>
      )}

      {mode === 'consent' && (
        <Card className="screen-in flex flex-col gap-4 !p-5" style={{ animationDelay: '60ms' }}>
          <h2 className="t-section">{t('auth2.consentTitle')}</h2>
          <p className="t-caption leading-relaxed">{t('auth2.consentSub')}</p>
          <label className="tap flex cursor-pointer items-start gap-2.5 rounded-2xl border border-line bg-surface p-3">
            <input
              type="checkbox"
              className="mt-0.5 h-5 w-5 shrink-0 accent-[#059669]"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
            />
            <span className="text-xs font-bold leading-relaxed text-ink">
              {t('auth2.acceptLabel')}{' '}
              <button
                type="button"
                className="underline"
                onClick={(e) => {
                  e.preventDefault()
                  setLegalOpen('terms')
                }}
              >
                AGB
              </button>{' '}
              &middot;{' '}
              <button
                type="button"
                className="underline"
                onClick={(e) => {
                  e.preventDefault()
                  setLegalOpen('privacy')
                }}
              >
                Datenschutz
              </button>{' '}
              &middot;{' '}
              <button
                type="button"
                className="underline"
                onClick={(e) => {
                  e.preventDefault()
                  setLegalOpen('impressum')
                }}
              >
                Impressum
              </button>
            </span>
          </label>
          {err && <p className="text-xs font-bold text-danger">{err}</p>}
          <button
            type="button"
            className="btn-primary w-full"
            onClick={() => {
              if (!accepted) return setErr(t('auth2.consentRequired'))
              setErr('')
              setConsent({
                docs: [
                  { doc: 'terms', version: LEGAL_VERSION, acceptedAt: new Date().toISOString(), lang },
                  { doc: 'privacy', version: LEGAL_VERSION, acceptedAt: new Date().toISOString(), lang },
                ],
                psd2: [],
              })
              setMode('signup')
            }}
          >
            {t('auth2.consentBtn')}
          </button>
        </Card>
      )}

      {mode === 'setup' && (
        <Card className="screen-in flex flex-col gap-4 !p-5">
          <div>
            <div className="flex items-center justify-between gap-3">
              <p className="eyebrow">{t('auth.step', { n: String(step + 1), total: '3' })}</p>
              {stepDots}
            </div>
            <h2 className="t-section mt-2">{t('auth.setupTitle')}</h2>
            <p className="t-caption mt-0.5">{t('auth.setupSub')}</p>
          </div>

          {step === 0 && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <p className="text-sm font-extrabold text-ink">{t('auth.q1')}</p>
                <div className="flex flex-wrap gap-2">
                  {(['single', 'married', 'separated'] as const).map((v) => (
                    <Pill
                      key={v}
                      active={answers.marital === v}
                      onClick={() => setAnswers({ ...answers, marital: v })}
                    >
                      {t(`auth.opt.${v}`)}
                    </Pill>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <p className="text-sm font-extrabold text-ink">{t('auth.q2')}</p>
                <div className="flex flex-wrap gap-2">
                  {(['werkstudent', 'job', 'student', 'other'] as const).map((v) => (
                    <Pill
                      key={v}
                      active={answers.occupation === v}
                      onClick={() => setAnswers({ ...answers, occupation: v })}
                    >
                      {t(`auth.opt.${v}`)}
                    </Pill>
                  ))}
                </div>
              </div>
            </div>
          )}
          {step === 1 && (
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="fin-salary-day" className="text-sm font-extrabold text-ink">
                  {t('auth2.salaryDay')}{' '}
                  <span className="font-medium text-ink-soft">&middot; {t('auth2.optional')}</span>
                </label>
                <input
                  id="fin-salary-day"
                  className="field num"
                  type="text"
                  inputMode="numeric"
                  maxLength={2}
                  value={answers.salaryDay}
                  onChange={(e) =>
                    setAnswers({ ...answers, salaryDay: e.target.value.replace(/[^0-9]/g, '') })
                  }
                  placeholder="15"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="fin-net-salary" className="text-sm font-extrabold text-ink">
                  {t('auth2.netSalary')}{' '}
                  <span className="font-medium text-ink-soft">&middot; {t('auth2.optional')}</span>
                </label>
                <input
                  id="fin-net-salary"
                  className="field num"
                  type="text"
                  inputMode="decimal"
                  value={answers.netSalary}
                  onChange={(e) =>
                    setAnswers({
                      ...answers,
                      netSalary: e.target.value.replace(/[^0-9.,]/g, '').replace(',', '.'),
                    })
                  }
                  placeholder="851"
                />
              </div>
            </div>
          )}
          {step === 2 && (
            <div className="flex flex-col gap-1.5">
              <label htmlFor="fin-goal" className="text-sm font-extrabold text-ink">
                {t('auth2.goalAmount')}{' '}
                <span className="font-medium text-ink-soft">&middot; {t('auth2.optional')}</span>
              </label>
              <input
                id="fin-goal"
                className="field num"
                type="text"
                inputMode="numeric"
                value={answers.goal}
                onChange={(e) => setAnswers({ ...answers, goal: e.target.value.replace(/[^0-9]/g, '') })}
                placeholder="2000"
              />
            </div>
          )}

          <div className="mt-1 flex gap-3">
            <button
              type="button"
              className="btn-ghost flex-1"
              onClick={() => (step === 0 ? setMode('signup') : setStep(step - 1))}
            >
              {t('taxwiz.back')}
            </button>
            {step < 2 ? (
              <button type="button" className="btn-primary flex-1" onClick={() => setStep(step + 1)}>
                {t('taxwiz.next')}
              </button>
            ) : (
              <button type="button" className="btn-primary flex-1" onClick={() => setMode('bank')}>
                {t('auth.finish')}
              </button>
            )}
          </div>
        </Card>
      )}

      {mode === 'bank' && (
        <Card className="screen-in flex flex-col gap-3 !p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-primary-deep">
              <Icon name="bank" className="h-5 w-5" />
            </span>
            <p className="min-w-0 flex-1 text-sm font-extrabold leading-snug text-ink">{t('auth.bankNow')}</p>
            <Badge tone={live ? 'success' : 'warn'}>{live ? t('auth.liveBadge') : t('auth.bankSoon')}</Badge>
          </div>
          <button
            type="button"
            className="btn-primary w-full"
            onClick={() => {
              localStorage.setItem('finello_tab', 'settings')
              persistExtras()
              localStorage.setItem('finello_open_bank', '1')
              finish(buildAccount())
            }}
          >
            {t('auth.bankNow')}
          </button>
          <button
            type="button"
            className="btn-ghost w-full"
            onClick={() => {
              persistExtras()
              finish(buildAccount())
            }}
          >
            {t('auth.bankLater')}
          </button>
        </Card>
      )}

      <LegalSheet docKey={legalOpen} onClose={() => setLegalOpen(null)} />

      {existing && mode !== 'login' && (
        <button
          type="button"
          className="tap mt-4 inline-flex min-h-11 items-center text-sm font-bold text-primary-deep"
          onClick={() => setMode('login')}
        >
          {t('auth.haveAccount')} {t('auth.login')}
        </button>
      )}
    </div>
  )
}
