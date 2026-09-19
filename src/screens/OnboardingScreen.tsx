import { useState } from 'react'
import { useI18n, type Lang } from '../i18n/I18nContext'
import { Card } from '../components/ui'

const LANGS: Array<{ id: Lang; label: string; native: string }> = [
  { id: 'fa', label: 'فارسی', native: 'Persian' },
  { id: 'de', label: 'Deutsch', native: 'German' },
  { id: 'en', label: 'English', native: 'English' },
]

export function OnboardingScreen({ onDone }: { onDone: () => void }) {
  const { t, setLang } = useI18n()
  const [picked, setPicked] = useState<Lang | null>(null)

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col">
      {/* full-width gradient hero */}
      <header
        className="hero-gradient shadow-card screen-in rounded-b-[28px] px-6 pb-10 pt-14 text-center text-white"
        style={{ animationFillMode: 'both' }}
      >
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-white/14 text-2xl font-extrabold">
          F
        </div>
        <h1 className="text-[28px] font-extrabold leading-tight tracking-[-0.02em]">{t('onb.welcome')}</h1>
        <p className="mx-auto mt-2 max-w-xs text-sm font-medium leading-relaxed text-white/70">
          {t('onb.subtitle')}
        </p>
      </header>

      <div className="flex flex-1 flex-col px-5 pb-10 pt-6">
        <p className="eyebrow mb-3" style={{ animationFillMode: 'both' }}>
          {t('onb.chooseLang')}
        </p>
        <div className="flex flex-col gap-3">
          {LANGS.map((l, i) => (
            <button
              key={l.id}
              type="button"
              onClick={() => setPicked(l.id)}
              aria-pressed={picked === l.id}
              className="screen-in tap w-full text-start"
              style={{ animationDelay: `${(i + 1) * 70}ms`, animationFillMode: 'both' }}
            >
              <Card
                className={`flex items-center justify-between !p-4 ${
                  picked === l.id ? 'ring-2 ring-primary' : ''
                }`}
              >
                <div className="flex min-w-0 items-center gap-3">
                  {/* textual flag */}
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-chip text-[11px] font-extrabold text-ink">
                    {l.id.toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <p className="text-base font-extrabold text-ink">{l.label}</p>
                    <p className="text-xs font-medium text-ink-soft">{l.native}</p>
                  </div>
                </div>
                <div
                  className={`h-6 w-6 shrink-0 rounded-full border-2 ${
                    picked === l.id ? 'border-primary bg-primary' : 'border-line'
                  }`}
                />
              </Card>
            </button>
          ))}
        </div>

        <button
          type="button"
          disabled={!picked}
          onClick={() => {
            if (picked) {
              setLang(picked)
              onDone()
            }
          }}
          className="btn-primary screen-in mt-8 w-full disabled:cursor-not-allowed disabled:opacity-40"
          style={{ animationDelay: `${(LANGS.length + 1) * 70}ms`, animationFillMode: 'both' }}
        >
          {t('onb.continue')}
        </button>
      </div>
    </div>
  )
}
