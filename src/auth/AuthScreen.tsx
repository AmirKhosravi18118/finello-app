import { useEffect, useState } from 'react'
import { useI18n, type Lang } from '../i18n/I18nContext'
import { Badge, Card, Icon, Pill } from '../components/ui'
import { connectLiveBank, isLive } from '../bank/bankConnection'

/** Local account store (no backend yet): name/email/PIN on this device only. */
export interface Account {
  name: string
  email: string
  pin?: string
  createdAt: string
  setup?: { marital: string; occupation: string; hours: number; km: number }
}

const KEY = 'finello_account'

export function getAccount(): Account | null {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as Account) : null
  } catch {
    return null
  }
}

export function saveAccount(a: Account) {
  localStorage.setItem(KEY, JSON.stringify(a))
}

export const ACCOUNT_EVENT = 'finello:account'

/* ---------- language step ---------- */

const LANGS: Array<{ id: Lang; label: string }> = [
  { id: 'fa', label: 'فارسی' },
  { id: 'de', label: 'Deutsch' },
  { id: 'en', label: 'English' },
]

/* ---------- auth screen (login + signup + setup + optional bank) ---------- */

export function AuthScreen({ onDone }: { onDone: () => void }) {
  const { t, setLang, lang } = useI18n()
  const existing = getAccount()
  const [mode, setMode] = useState<'login' | 'signup' | 'setup' | 'bank'>(existing ? 'login' : 'signup')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [pin, setPin] = useState('')
  const [loginPin, setLoginPin] = useState('')
  const [err, setErr] = useState('')
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState({
    marital: 'single',
    occupation: 'werkstudent',
    hours: '18',
    km: '8',
  })

  useEffect(() => {
    // pull live bank redirect result (?live=1&bank=<id|name>) after consent
    const p = new URLSearchParams(location.search)
    if (p.get('live') === '1') {
      const id = p.get('bank') ?? 'live'
      connectLiveBank({ id, name: id })
      history.replaceState(null, '', location.pathname)
    }
  }, [])

  const finish = (a: Account) => {
    saveAccount(a)
    localStorage.setItem('finello_onboarded', '1')
    window.dispatchEvent(new Event(ACCOUNT_EVENT))
    onDone()
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

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-5 py-8">
      <div className="hero-gradient screen-in mb-6 rounded-[28px] p-6 text-white shadow-card">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-xl font-extrabold">
          F
        </div>
        <h1 className="mt-4 text-2xl font-extrabold tracking-tight">
          {mode === 'login' ? t('auth.helloBack') : t('auth.welcome')}
        </h1>
        <p className="mt-1 text-sm text-white/75">{t('auth.sub')}</p>
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

      {mode === 'setup' && (
        <Card className="screen-in flex flex-col gap-4 !p-5">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink-soft">
              {t('auth.step', { n: String(step + 1), total: '4' })}
            </p>
            <h2 className="mt-1 text-lg font-extrabold text-ink">{t('auth.setupTitle')}</h2>
            <p className="text-xs text-ink-soft">{t('auth.setupSub')}</p>
          </div>

          {step === 0 && (
            <div className="flex flex-wrap gap-2">
              {(['single', 'married', 'separated'] as const).map((v) => (
                <Pill
                  key={v}
                  active={answers.marital === v}
                  onClick={() => setAnswers({ ...answers, marital: v })}
                >
                  {v === 'single'
                    ? t('taxwiz.single')
                    : v === 'married'
                      ? t('taxwiz.marriedBoth')
                      : t('taxwiz.separated')}
                </Pill>
              ))}
            </div>
          )}
          {step === 1 && (
            <div className="flex flex-wrap gap-2">
              {(['werkstudent', 'job', 'student', 'other'] as const).map((v) => (
                <Pill
                  key={v}
                  active={answers.occupation === v}
                  onClick={() => setAnswers({ ...answers, occupation: v })}
                >
                  {v === 'werkstudent'
                    ? 'Werkstudent'
                    : v === 'job'
                      ? 'Vollzeit/Teilzeit'
                      : v === 'student'
                        ? t('taxwiz.q5')
                        : t('cat.other')}
                </Pill>
              ))}
            </div>
          )}
          {step === 2 && (
            <input
              className="field num"
              type="number"
              min={0}
              max={80}
              value={answers.hours}
              onChange={(e) => setAnswers({ ...answers, hours: e.target.value })}
              placeholder={t('auth.q3')}
            />
          )}
          {step === 3 && (
            <input
              className="field num"
              type="number"
              min={0}
              value={answers.km}
              onChange={(e) => setAnswers({ ...answers, km: e.target.value })}
              placeholder={t('auth.q4')}
            />
          )}

          <div className="mt-1 flex gap-3">
            <button
              type="button"
              className="btn-ghost flex-1"
              onClick={() => (step === 0 ? setMode('signup') : setStep(step - 1))}
            >
              {t('taxwiz.back')}
            </button>
            {step < 3 ? (
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
          <div className="flex items-center gap-2">
            <Icon name="bank" className="h-5 w-5 text-primary-deep" />
            <p className="text-sm font-extrabold text-ink">{t('auth.bankNow')}</p>
            <Badge tone={isLive() ? 'success' : 'warn'}>
              {isLive() ? t('auth.liveBadge') : t('auth.demoBadge')}
            </Badge>
          </div>
          <button
            type="button"
            className="btn-primary w-full"
            onClick={() => {
              finish({
                name: name.trim() || existing?.name || 'Friend',
                email: email || existing?.email || '',
                pin: pin || undefined,
                createdAt: new Date().toISOString(),
                setup: {
                  marital: answers.marital,
                  occupation: answers.occupation,
                  hours: Number(answers.hours) || 0,
                  km: Number(answers.km) || 0,
                },
              })
            }}
          >
            {t('auth.bankNow')}
          </button>
          <button
            type="button"
            className="btn-ghost w-full"
            onClick={() =>
              finish({
                name: name.trim() || existing?.name || 'Friend',
                email: email || existing?.email || '',
                pin: pin || undefined,
                createdAt: new Date().toISOString(),
                setup: {
                  marital: answers.marital,
                  occupation: answers.occupation,
                  hours: Number(answers.hours) || 0,
                  km: Number(answers.km) || 0,
                },
              })
            }
          >
            {t('auth.bankLater')}
          </button>
        </Card>
      )}

      {existing && mode !== 'login' && (
        <button
          type="button"
          className="tap mt-4 text-sm font-bold text-primary-deep"
          onClick={() => setMode('login')}
        >
          {t('auth.haveAccount')} {t('auth.login')}
        </button>
      )}
    </div>
  )
}
