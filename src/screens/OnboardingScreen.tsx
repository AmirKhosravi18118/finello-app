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
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-5 py-10">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-navy text-2xl font-extrabold text-primary shadow-lg">
          F
        </div>
        <h1 className="text-2xl font-extrabold text-ink">{t('onb.welcome')}</h1>
        <p className="mt-2 text-sm font-medium text-ink-soft">{t('onb.subtitle')}</p>
      </div>

      <p className="mb-3 ps-1 text-xs font-bold uppercase tracking-wide text-ink-soft">
        {t('onb.chooseLang')}
      </p>
      <div className="flex flex-col gap-3">
        {LANGS.map((l) => (
          <button key={l.id} type="button" onClick={() => setPicked(l.id)} className="tap text-start">
            <Card
              className={`flex items-center justify-between !p-4 ${
                picked === l.id ? 'ring-2 ring-primary' : ''
              }`}
            >
              <div>
                <p className="text-base font-extrabold text-ink">{l.label}</p>
                <p className="text-xs font-medium text-ink-soft">{l.native}</p>
              </div>
              <div
                className={`h-6 w-6 rounded-full border-2 ${
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
        className="btn-primary mt-8 w-full disabled:cursor-not-allowed disabled:opacity-40"
      >
        {t('onb.continue')}
      </button>
    </div>
  )
}
