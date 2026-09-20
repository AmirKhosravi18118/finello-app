import { useState } from 'react'
import { useI18n } from '../i18n/I18nContext'
import type { TabId } from '../data/demo'
import { Icon, type IconName } from './ui'

const TABS: Array<{ id: TabId; key: string; icon: IconName }> = [
  { id: 'home', key: 'nav.home', icon: 'home' },
  { id: 'calendar', key: 'nav.calendar', icon: 'calendar' },
  { id: 'expenses', key: 'nav.expenses', icon: 'wallet' },
  { id: 'transactions', key: 'nav.transactions', icon: 'receipt' },
  { id: 'tax', key: 'nav.tax', icon: 'tax' },
]

/** Cross-tab quick-add signal (DS2.0 §5): BottomNav dispatches, the screen that
 *  owns the target sheet (Home → payment, Transactions → expense/income) listens. */
const QUICK_ADD_EVENT = 'finello:quick-add'
type QuickAddDetail = 'expense' | 'payment' | 'income'

const QUICK_ACTIONS: Array<{
  detail: QuickAddDetail
  labelKey: string
  icon: IconName
  circle: string
  rotate?: boolean
}> = [
  {
    detail: 'expense',
    labelKey: 'qa.expense',
    icon: 'up',
    circle: 'bg-danger-soft text-danger',
    rotate: true,
  },
  { detail: 'payment', labelKey: 'qa.payment', icon: 'calendar', circle: 'bg-amber-soft text-amber-600' },
  {
    detail: 'income',
    labelKey: 'qa.income',
    icon: 'down',
    circle: 'bg-primary-soft text-primary-deep',
    rotate: true,
  },
]

/** Pro bottom bar (WP16): five tabs + a FLOATING + button docked to the bar's
 *  end edge (language-aware), above the nav. Tap toggles a drop-up with three
 *  separate labeled circles; tap + again (or the scrim) closes. */
export function BottomNav({ tab, onTab }: { tab: TabId; onTab: (t: TabId) => void }) {
  const { t } = useI18n()
  const [menuOpen, setMenuOpen] = useState(false)

  const quickAdd = (detail: QuickAddDetail) => {
    setMenuOpen(false)
    onTab(detail === 'payment' ? 'home' : 'transactions')
    // let the target screen mount before it receives the signal
    window.setTimeout(() => {
      window.dispatchEvent(new CustomEvent<QuickAddDetail>(QUICK_ADD_EVENT, { detail }))
    }, 80)
  }

  return (
    <>
      {menuOpen && (
        <div
          className="fixed inset-0 z-40 bg-navy/30 backdrop-blur-[2px]"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* drop-up: vertical stack of three separate labeled circles above the + */}
      {menuOpen && (
        <div
          className="fixed bottom-[10.75rem] z-50 flex flex-col items-center gap-4"
          style={{ insetInlineEnd: '1.25rem' }}
        >
          {QUICK_ACTIONS.map(({ detail, labelKey, icon, circle, rotate }, i) => (
            <button
              key={detail}
              type="button"
              onClick={() => quickAdd(detail)}
              className="screen-in tap flex w-24 flex-col items-center gap-1.5"
              style={{ animationDelay: `${(QUICK_ACTIONS.length - 1 - i) * 60}ms` }}
            >
              <span
                className={`flex h-14 w-14 items-center justify-center rounded-full border border-line bg-surface shadow-card ${circle}`}
              >
                <Icon name={icon} className={`h-6 w-6 ${rotate ? 'rotate-180' : ''}`} />
              </span>
              <span className="w-full truncate rounded-full bg-surface/95 px-1 py-1 text-center text-[11px] font-bold leading-tight text-ink shadow-card">
                {t(labelKey)}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* floating + — outside the bar, end edge, above the nav */}
      <button
        type="button"
        onClick={() => setMenuOpen((v) => !v)}
        aria-expanded={menuOpen}
        aria-label={t('qa.title')}
        className="tap fixed bottom-24 z-50 flex h-14 w-14 items-center justify-center rounded-full border border-white/25 bg-gradient-to-br from-primary to-primary-deep text-white shadow-fab transition-transform duration-300"
        style={{ insetInlineEnd: '1.25rem', transform: menuOpen ? 'rotate(45deg)' : undefined }}
      >
        <Icon name="plus" className="h-6 w-6" />
      </button>

      <nav className="pill-nav flex items-center justify-between gap-1 px-2 py-2">
        {TABS.map(({ id, key, icon }) => {
          const active = tab === id
          return (
            <button
              key={id}
              type="button"
              onClick={() => onTab(id)}
              aria-current={active ? 'page' : undefined}
              className={`tap flex min-h-11 min-w-11 flex-1 flex-col items-center justify-center gap-0.5 rounded-2xl px-1 py-1.5 ${
                active ? 'bg-primary/15' : ''
              }`}
            >
              <Icon name={icon} className={`h-5 w-5 ${active ? 'text-primary' : 'text-ink-soft'}`} />
              <span
                className={`max-w-full truncate text-[10px] leading-none ${
                  active ? 'font-bold text-primary' : 'font-medium text-ink-soft'
                }`}
              >
                {t(key)}
              </span>
            </button>
          )
        })}
      </nav>
    </>
  )
}
