import { useState, type ReactNode } from 'react'
import { useI18n } from '../i18n/I18nContext'
import type { TabId } from '../data/demo'
import { BottomNav } from './BottomNav'
import { Badge, Icon, Modal } from './ui'
import { Tour } from './Tour'
import { uncategorizedTotal } from '../bank/bankConnection'
import { NotificationCenter } from './NotificationCenter'

/** App shell: brand header (logo + demo badge on Home only), global bell/settings,
 *  page canvas on the DS2.0 rhythm (px-5 pt-2) and the pill bottom nav. */
export function AppShell({
  tab,
  onTab,
  children,
}: {
  tab: TabId
  onTab: (t: TabId) => void
  children: ReactNode
}) {
  const { t, fmt } = useI18n()
  const [notifOpen, setNotifOpen] = useState(false)
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-5 pt-2">
      <header className="flex items-center justify-between gap-2 pb-2 pt-2">
        {tab === 'home' ? (
          <div className="flex min-w-0 items-center gap-2">
            <div className="hero-gradient shadow-card flex h-9 w-9 items-center justify-center rounded-2xl text-base font-extrabold text-primary">
              F
            </div>
            <span className="truncate text-lg font-extrabold tracking-tight text-ink">{t('app.name')}</span>
            <Badge tone="warn">{t('common.demo')}</Badge>
          </div>
        ) : (
          <span className="flex-1" />
        )}
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => setNotifOpen(true)}
            className="tap relative rounded-2xl border border-line bg-surface p-3 text-ink-soft"
            aria-label={t('common.notifications')}
          >
            <Icon name="bell" className="h-5 w-5" />
            {uncategorizedTotal() > 0 && (
              <span className="num absolute -end-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-extrabold leading-none text-white">
                {fmt.num(uncategorizedTotal())}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => onTab('settings')}
            aria-current={tab === 'settings' ? 'page' : undefined}
            aria-label={t('nav.settings')}
            className={`tap rounded-2xl border p-3 ${
              tab === 'settings'
                ? 'border-primary bg-primary-soft text-primary-deep'
                : 'border-line bg-surface text-ink-soft'
            }`}
          >
            <Icon name="settings" className="h-5 w-5" />
          </button>
        </div>
      </header>

      <main key={tab} className="screen-in pb-36">
        {children}
      </main>

      <BottomNav tab={tab} onTab={onTab} />

      <Modal open={notifOpen} onClose={() => setNotifOpen(false)} title={t('notif.title')}>
        <NotificationCenter
          onGo={(target) => {
            setNotifOpen(false)
            onTab(target)
          }}
        />
      </Modal>

      {/* guided tour: first run + Settings replay (requestTour) */}
      <Tour />
    </div>
  )
}
