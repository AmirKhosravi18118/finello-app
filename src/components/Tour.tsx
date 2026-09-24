import { useEffect, useState } from 'react'
import { useI18n } from '../i18n/I18nContext'
import { Icon, type IconName } from './ui'

export const TOUR_SEEN_KEY = 'finello_tour_seen'
export const TOUR_EVENT = 'finello:tour'

interface TourStep {
  icon: IconName
  titleKey: string
  descKey: string
}

const STEPS: TourStep[] = [
  { icon: 'home', titleKey: 'tour.s1t', descKey: 'tour.s1d' },
  { icon: 'calendar', titleKey: 'tour.s2t', descKey: 'tour.s2d' },
  { icon: 'wallet', titleKey: 'tour.s3t', descKey: 'tour.s3d' },
  { icon: 'receipt', titleKey: 'tour.s4t', descKey: 'tour.s4d' },
  { icon: 'tax', titleKey: 'tour.s5t', descKey: 'tour.s5d' },
  { icon: 'settings', titleKey: 'tour.s6t', descKey: 'tour.s6d' },
]

export function tourSeen(): boolean {
  return localStorage.getItem(TOUR_SEEN_KEY) === '1'
}

export function markTourSeen() {
  localStorage.setItem(TOUR_SEEN_KEY, '1')
}

export function requestTour() {
  window.dispatchEvent(new Event(TOUR_EVENT))
}

/** Guided app tour (WP12): six bottom-sheet steps, shown once after onboarding
 *  and re-openable from Settings via requestTour(). */
export function Tour() {
  const { t } = useI18n()
  const [step, setStep] = useState(0)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!tourSeen()) setOpen(true)
    const handler = () => {
      setStep(0)
      setOpen(true)
    }
    window.addEventListener(TOUR_EVENT, handler)
    return () => window.removeEventListener(TOUR_EVENT, handler)
  }, [])

  const close = () => {
    markTourSeen()
    setOpen(false)
  }

  if (!open) return null
  const s = STEPS[step]
  const last = step === STEPS.length - 1

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-navy/50 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
    >
      <div className="sheet-in w-full max-w-md">
        <div className="hero-gradient rounded-t-[28px] p-5 pb-8 text-white shadow-card">
          <div className="grabber mb-4 !bg-white/30" aria-hidden="true" />
          <div className="flex items-center justify-between">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/12 backdrop-blur-sm">
              <Icon name={s.icon} className="h-6 w-6" />
            </span>
            <div className="flex items-center gap-1.5">
              {STEPS.map((_, i) => (
                <span
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === step ? 'w-5 bg-primary' : 'w-1.5 bg-white/30'
                  }`}
                />
              ))}
            </div>
          </div>
          <h3 className="mt-4 text-lg font-extrabold">{t(s.titleKey)}</h3>
          <p className="mt-1.5 text-sm font-[450] leading-[1.4] text-white/80">{t(s.descKey)}</p>
          <div className="mt-5 flex gap-3">
            <button
              type="button"
              className="btn-ghost flex-1 !border-white/20 !bg-white/10 !text-white"
              onClick={close}
            >
              {t('tour.skip')}
            </button>
            <button
              type="button"
              className="btn-primary flex-1"
              onClick={() => (last ? close() : setStep((v) => v + 1))}
            >
              {last ? t('tour.done') : t('tour.next')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
