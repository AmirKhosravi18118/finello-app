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

export function BottomNav({ tab, onTab }: { tab: TabId; onTab: (t: TabId) => void }) {
  const { t } = useI18n()
  return (
    <nav className="pill-nav flex items-center justify-between gap-1 px-2 py-2">
      {TABS.map(({ id, key, icon }) => {
        const active = tab === id
        return (
          <button
            key={id}
            type="button"
            onClick={() => onTab(id)}
            aria-current={active ? 'page' : undefined}
            className={`tap flex min-h-11 min-w-11 flex-1 flex-col items-center gap-0.5 rounded-2xl px-1 py-1.5 ${
              active ? 'bg-surface/15 text-white' : 'text-white/55'
            }`}
          >
            <Icon name={icon} className={`h-5 w-5 ${active ? 'text-primary' : ''}`} />
            <span className="max-w-full truncate text-[9px] font-bold leading-none">{t(key)}</span>
          </button>
        )
      })}
    </nav>
  )
}
