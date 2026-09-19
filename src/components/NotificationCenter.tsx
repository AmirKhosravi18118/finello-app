import { useI18n } from '../i18n/I18nContext'
import { Badge, Card, Icon, type Tone } from './ui'
import type { Payment, PayStatus, TabId } from '../data/demo'
import { uncategorizedTotal } from '../bank/bankConnection'
import { allPayments } from '../data/paymentsView'

const NOTIFY_KEY = 'finello_notify_days'

const STATUS_TONE: Record<PayStatus, Tone> = {
  today: 'warn',
  overdue: 'danger',
  upcoming: 'neutral',
  paid: 'success',
}

function notifyDays(): number {
  const saved = Number(localStorage.getItem(NOTIFY_KEY))
  return [1, 3, 7].includes(saved) ? saved : 3
}

/** Bottom sheet opened from the header bell: uncategorized nudge, overdue, upcoming. */
export function NotificationCenter({ onGo }: { onGo: (tab: TabId) => void }) {
  const { t, fmt } = useI18n()
  const uncategorized = uncategorizedTotal()

  const today = new Date().getDate()
  const window = notifyDays()
  const relevant = allPayments().filter((p) => {
    const diff = p.dayOfMonth - today
    return p.status === 'overdue' || diff === 0 || (diff > 0 && diff <= window)
  })
  const overdues = relevant.filter((p) => p.status === 'overdue').length
  const upcoming: Payment[] = relevant.filter((p) => p.status !== 'overdue')

  return (
    <div className="flex flex-col gap-3">
      {uncategorized > 0 && (
        <button type="button" onClick={() => onGo('transactions')} className="tap w-full text-start">
          <Card className="flex min-h-16 items-center gap-3 !border-amber-200 !bg-amber-50/90">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-soft text-amber-600">
              <Icon name="bell" className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="num text-sm font-extrabold text-ink">
                {t('home.uncategorizedNudge', { n: fmt.num(uncategorized) })}
              </p>
              <p className="text-xs font-bold text-primary-deep">{t('home.categorizeNow')} →</p>
            </div>
          </Card>
        </button>
      )}

      {overdues > 0 && (
        <button type="button" onClick={() => onGo('home')} className="tap w-full text-start">
          <Card className="flex min-h-16 items-center gap-3 !border-red-200 !bg-red-50/80">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-danger-soft text-danger">
              <Icon name="receipt" className="h-5 w-5" />
            </span>
            <p className="num flex-1 text-sm font-extrabold text-ink">
              {t('notif.overdueN', { n: fmt.num(overdues) })}
            </p>
            <Icon name="chevron" className="h-4 w-4 shrink-0 text-ink-soft" />
          </Card>
        </button>
      )}

      {upcoming.length > 0 ? (
        <Card>
          <div className="flex flex-col">
            {upcoming.map((p) => {
              const diff = p.dayOfMonth - today
              return (
                <div
                  key={p.id}
                  className="flex items-center justify-between gap-3 border-t border-line py-2.5 first:border-t-0"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-ink">{p.title}</p>
                    <p className="num text-xs font-medium text-ink-soft">
                      {diff === 0 ? t('status.today') : t('notif.dueIn', { n: fmt.num(diff) })}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <span className="num text-sm font-extrabold text-ink">{fmt.currency(p.amount)}</span>
                    <Badge tone={STATUS_TONE[p.status]}>{t(`status.${p.status}`)}</Badge>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      ) : uncategorized === 0 && overdues === 0 ? (
        <Card className="flex min-h-20 items-center justify-center gap-2">
          <Icon name="check" className="h-5 w-5 text-primary-deep" />
          <p className="text-sm font-bold text-ink-soft">{t('notif.allGood')}</p>
        </Card>
      ) : null}
    </div>
  )
}
