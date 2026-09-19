import { useState } from 'react'
import { useI18n } from '../i18n/I18nContext'
import type { TabId } from '../data/demo'
import { Icon, Modal, type IconName } from './ui'

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

/** Pill bottom nav, Pro edition: raised gradient + button in the middle opens the
 *  quick-add drop-up; active tab = primary/15 pill with primary icon + bold label. */
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

  const renderTab = ({ id, key, icon }: { id: TabId; key: string; icon: IconName }) => {
    const active = tab === id
    return (
      <button
        key={id}
        type="button"
        onClick={() => onTab(id)}
        aria-current={active ? 'page' : undefined}
        className={`tap flex min-h-11 min-w-11 flex-1 flex-col items-center justify-center gap-0.5 rounded-full px-1 py-1.5 ${
          active ? 'bg-primary/15 text-primary' : 'text-ink-soft'
        }`}
      >
        <Icon name={icon} className={`h-5 w-5 ${active ? 'text-primary' : ''}`} />
        <span
          className={`max-w-full truncate text-[9px] leading-none ${active ? 'font-bold' : 'font-medium'}`}
        >
          {t(key)}
        </span>
      </button>
    )
  }

  return (
    <>
      <nav className="pill-nav flex items-center justify-between gap-1 px-2 py-2">
        {TABS.slice(0, 2).map(renderTab)}
        <div className="relative h-11 w-14 shrink-0">
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label={t('qa.title')}
            className="tap shadow-fab bg-gradient-to-br from-primary to-primary-deep absolute -top-3 left-1/2 flex h-14 w-14 -translate-x-1/2 items-center justify-center rounded-full border border-white/20 text-white"
          >
            <Icon name="plus" className="h-6 w-6" />
          </button>
        </div>
        {TABS.slice(2).map(renderTab)}
      </nav>

      <Modal open={menuOpen} onClose={() => setMenuOpen(false)} title={t('qa.title')}>
        <div className="grid grid-cols-3 gap-2">
          {QUICK_ACTIONS.map(({ detail, labelKey, icon, circle, rotate }) => (
            <button
              key={detail}
              type="button"
              onClick={() => quickAdd(detail)}
              className="tap flex flex-col items-center gap-2 rounded-2xl py-2"
            >
              <span className={`flex h-16 w-16 items-center justify-center rounded-full ${circle}`}>
                <Icon name={icon} className={`h-6 w-6 ${rotate ? 'rotate-180' : ''}`} />
              </span>
              <span className="text-xs font-bold text-ink">{t(labelKey)}</span>
            </button>
          ))}
        </div>
      </Modal>
    </>
  )
}
