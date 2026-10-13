import { useEffect, useState } from 'react'
import { useI18n } from '../i18n/I18nContext'
import type { TabId } from '../data/demo'
import { Icon, type IconName } from './ui'

const TABS: Array<{ id: TabId; key: string; icon: IconName }> = [
  { id: 'home', key: 'nav.home', icon: 'home' },
  { id: 'konten', key: 'nav.konten', icon: 'bank' },
  { id: 'analysen', key: 'nav.analysen', icon: 'wallet' },
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
  const [sheetOpen, setSheetOpen] = useState(false)

  /** Smart + (WP16): hide whenever ANY modal/sheet is open anywhere in the app
   *  (auth sheets, edit sheets, wizard, legal, notifications…), spring back on close. */
  useEffect(() => {
    const check = () => setSheetOpen(!!document.querySelector('[role="dialog"]'))
    check()
    const observer = new MutationObserver(check)
    observer.observe(document.body, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [])

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
          className="fixed inset-0 z-40 bg-navy/40 backdrop-blur-[2px]"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* quick menu: anchored speed-dial card above the FAB (DS: surface, 12px gap, stagger) */}
      {menuOpen && (
        <div
          role="menu"
          aria-label={t('qa.title')}
          className="screen-in fixed z-50 w-60 overflow-hidden rounded-[20px] border border-line bg-surface shadow-card"
          style={{
            bottom: '9.875rem',
            insetInlineEnd: 'max(1.25rem, calc(50vw - 13.25rem))',
          }}
        >
          {QUICK_ACTIONS.map(({ detail, labelKey, icon, circle, rotate }, i) => (
            <button
              key={detail}
              type="button"
              role="menuitem"
              onClick={() => quickAdd(detail)}
              className="tap flex min-h-14 w-full items-center gap-3 border-b border-line px-4 text-start last:border-b-0"
              style={{ animationDelay: `${(QUICK_ACTIONS.length - 1 - i) * 50}ms` }}
            >
              <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${circle}`}>
                <Icon name={icon} className={`h-5 w-5 ${rotate ? 'rotate-180' : ''}`} />
              </span>
              <span className="min-w-0 flex-1 text-sm font-bold text-ink">{t(labelKey)}</span>
              <Icon name="plus" className="h-4 w-4 shrink-0 text-ink-soft" />
            </button>
          ))}
        </div>
      )}

      {/* floating + — outside the bar, end edge, above the nav; hides behind sheets */}
      <button
        type="button"
        onClick={() => setMenuOpen((v) => !v)}
        aria-expanded={menuOpen}
        aria-label={t('qa.title')}
        className={`shadow-fab tap fixed bottom-[5.625rem] z-50 flex h-14 w-14 items-center justify-center rounded-full border border-white/25 bg-gradient-to-br from-primary to-primary-deep text-white transition-all duration-300 ${
          menuOpen ? 'rotate-45' : ''
        } ${sheetOpen ? 'pointer-events-none translate-y-8 scale-50' : ''}`}
        style={{
          insetInlineEnd: 'max(1.25rem, calc(50vw - 13.25rem))',
          opacity: sheetOpen ? 0 : 1,
        }}
      >
        <Icon name="plus" className="h-6 w-6" />
      </button>

      {/* scroll fade: content dissolves under the floating nav (both themes) */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 bottom-0 z-30 h-24 bg-gradient-to-t from-canvas via-canvas/75 to-transparent"
      />

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
              <Icon name={icon} className={`h-5 w-5 ${active ? 'text-[#34d399]' : 'text-white/65'}`} />
              <span
                className={`max-w-full truncate text-[10px] leading-none ${
                  active ? 'font-bold text-[#34d399]' : 'font-medium text-white/65'
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
