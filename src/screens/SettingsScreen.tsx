import { useEffect, useState, type ReactNode } from 'react'
import { useI18n, type Lang } from '../i18n/I18nContext'
import { AppHeader, Badge, Card, Icon, IconChip, Modal, Pill, type IconName } from '../components/ui'
import { requestTour } from '../components/Tour'
import { useBankConnection, useLiveBankCatalog, isLive, type BankRef } from '../bank/bankConnection'
import {
  permissionState,
  requestPermission,
  sendTestNotification,
  type PermState,
} from '../notifications/reminders'
import { enablePush } from '../notifications/push'
import { getTheme, setTheme, type Theme } from '../theme/theme'
import { LegalSheet } from '../components/LegalSheet'
import {
  googleConfigured,
  getGoogleSession,
  consumeGoogleRedirect,
  disconnectGoogle,
  backupToDrive,
} from '../integrations/google'
import type { LegalDocKey } from '../legal/legalContent'
import { userProfile, getAccount, saveAccount } from '../auth/account'
import { downloadFile, exportableTransactions, paymentsIcs, transactionsCsv } from '../data/exporters'
import { allPayments } from '../data/paymentsView'
import { googleAuthUrl } from '../integrations/google'

const LANGS: Array<{ id: Lang; label: string }> = [
  { id: 'fa', label: 'فا' },
  { id: 'de', label: 'DE' },
  { id: 'en', label: 'EN' },
]

const NOTIFY_KEY = 'finello_notify_days'
const NOTIFY_OPTIONS = [1, 3, 7]
const DEFAULT_NOTIFY = 3

function GroupHeader({ label }: { label: string }) {
  return <p className="eyebrow mb-1">{label}</p>
}

function IconBubble({ name, danger = false }: { name: IconName; danger?: boolean }) {
  return <IconChip icon={name} tone={danger ? 'danger' : 'neutral'} />
}

function SelectPill({
  active,
  onSelect,
  children,
}: {
  active: boolean
  onSelect: () => void
  children: ReactNode
}) {
  return (
    <Pill active={active} onClick={onSelect}>
      {children}
    </Pill>
  )
}

export function SettingsScreen() {
  const { t, fmt, lang, setLang } = useI18n()
  const { banks, catalog: mockCatalog, connect, disconnect } = useBankConnection()
  const liveCatalog = useLiveBankCatalog()
  const catalog = isLive() ? liveCatalog : mockCatalog
  const profile = userProfile()
  const [theme, setThemeState] = useState<Theme>(() => getTheme())
  const [, setVersion] = useState(0)
  const [profileOpen, setProfileOpen] = useState(false)
  const [legalDocKey, setLegalDoc] = useState<LegalDocKey | null>(null)
  const [gSession, setGSession] = useState(() => getGoogleSession())
  useEffect(() => {
    void consumeGoogleRedirect().then((s) => {
      if (s) setGSession(s)
    })
  }, [])
  const [backupOk, setBackupOk] = useState(false)

  const connectGoogle = () => {
    location.href = googleAuthUrl()
  }
  const emailExport = async () => {
    // export via user's mail client — data never touches a server
    const body = encodeURIComponent(JSON.stringify(exportableTransactions()))
    location.href = `mailto:?subject=Finello%20Export&body=${body}`
  }
  const backupNow = async () => {
    const payload = JSON.stringify({
      exportedAt: new Date().toISOString(),
      payments: allPayments(),
      transactions: exportableTransactions(),
    })
    const ok = await backupToDrive(payload)
    if (ok) setBackupOk(true)
  }
  const [pName, setPName] = useState(() => profile.name)
  const [pEmail, setPEmail] = useState(() => profile.email)
  const selectTheme = (v: Theme) => {
    setTheme(v)
    setThemeState(v)
  }
  const [perm, setPerm] = useState<PermState>(() => permissionState())
  const [flash, setFlash] = useState('')
  const [notifyDays, setNotifyDays] = useState<number>(() => {
    const saved = Number(localStorage.getItem(NOTIFY_KEY))
    return NOTIFY_OPTIONS.includes(saved) ? saved : DEFAULT_NOTIFY
  })
  const [wipeOpen, setWipeOpen] = useState(false)
  const [bankOpen, setBankOpen] = useState(() => localStorage.getItem('finello_open_bank') === '1')
  // consume the auth "connect bank now" deep-link flag outside render
  useEffect(() => {
    if (localStorage.getItem('finello_open_bank') === '1') {
      localStorage.removeItem('finello_open_bank')
      setBankOpen(true)
    }
  }, [])
  const [pickedBank, setPickedBank] = useState<BankRef | null>(null)

  const selectNotify = (d: number) => {
    localStorage.setItem(NOTIFY_KEY, String(d))
    setNotifyDays(d)
  }

  const wipeAll = () => {
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith('finello_')) localStorage.removeItem(key)
    }
    window.location.reload()
  }

  return (
    <div className="anim-stagger flex flex-col gap-5">
      <AppHeader overline={t('app.name')} title={t('set.title')} />

      {/* display-orig */}
      <section>
        <GroupHeader label={t('set.themeGroup')} />
        <div className="flex flex-col gap-3">
          <Card className="flex min-h-14 items-center gap-3 !p-4">
            <IconBubble name="globe" />
            <span className="min-w-0 flex-1 text-sm font-bold text-ink">{t('set.themeGroup')}</span>
            <div className="flex shrink-0 items-center gap-1.5">
              <SelectPill active={theme === 'light'} onSelect={() => selectTheme('light')}>
                {t('set.themeLight')}
              </SelectPill>
              <SelectPill active={theme === 'dark'} onSelect={() => selectTheme('dark')}>
                {t('set.themeDark')}
              </SelectPill>
            </div>
          </Card>
          <button type="button" className="tap w-full text-start" onClick={requestTour}>
            <Card className="flex min-h-14 items-center gap-3 !p-4">
              <IconBubble name="home" />
              <span className="min-w-0 flex-1 text-sm font-bold text-ink">{t('tour.title')}</span>
              <Icon name="chevron" className="h-4 w-4 shrink-0 text-ink-soft" />
            </Card>
          </button>
        </div>
      </section>

      {/* profile (editable) */}
      <section>
        <GroupHeader label={t('set.profileGroup')} />
        <div className="flex flex-col gap-3">
          <button type="button" className="tap w-full text-start" onClick={() => setProfileOpen(true)}>
            <Card className="flex min-h-14 items-center gap-3 !p-4">
              <IconBubble name="user" />
              <span className="flex-1 text-sm font-bold text-ink">{t('set.name')}</span>
              <span className="max-w-[55%] text-end text-sm font-medium text-ink-soft">
                {profile.name || '—'}
              </span>
              <Icon name="chevron" className="h-4 w-4 shrink-0 text-ink-soft" />
            </Card>
          </button>
          <button type="button" className="tap w-full text-start" onClick={() => setProfileOpen(true)}>
            <Card className="flex min-h-14 items-center gap-3 !p-4">
              <IconBubble name="receipt" />
              <span className="flex-1 text-sm font-bold text-ink">{t('set.email')}</span>
              <span className="max-w-[55%] text-end text-sm font-medium text-ink-soft">
                {profile.email || '—'}
              </span>
              <Icon name="chevron" className="h-4 w-4 shrink-0 text-ink-soft" />
            </Card>
          </button>
          <Card className="flex min-h-14 items-center gap-3 !p-4">
            <IconBubble name="check" />
            <span className="flex-1 text-sm font-bold text-ink">{t('set.status')}</span>
            <span className="max-w-[55%] text-end text-sm font-medium text-ink-soft">{profile.status}</span>
          </Card>
        </div>
      </section>

      {/* language */}
      <section>
        <GroupHeader label={t('set.languageGroup')} />
        <Card className="flex min-h-14 items-center gap-3 !p-4">
          <IconBubble name="globe" />
          <div className="ms-auto flex items-center gap-1.5">
            {LANGS.map((l) => (
              <SelectPill key={l.id} active={lang === l.id} onSelect={() => setLang(l.id)}>
                {l.label}
              </SelectPill>
            ))}
          </div>
        </Card>
      </section>

      {/* notifications */}
      <section>
        <GroupHeader label={t('set.notifGroup')} />
        <Card className="flex flex-col gap-3 !p-4">
          <div className="flex min-h-11 items-center gap-3">
            <span className="min-w-0 flex-1 text-sm font-bold text-ink">{t('notif.reminders')}</span>
            {perm === 'granted' ? (
              <Badge tone="success">
                <Icon name="check" className="h-3 w-3" />
                {t('notif.enabled')}
              </Badge>
            ) : perm === 'denied' ? (
              <Badge tone="danger">{t('notif.blocked')}</Badge>
            ) : (
              <button
                type="button"
                className="tap flex min-h-11 shrink-0 items-center rounded-2xl px-3 text-xs font-bold text-primary-deep"
                onClick={async () => {
                  const p = await requestPermission()
                  setPerm(p)
                  if (p === 'granted') {
                    await enablePush()
                    await sendTestNotification()
                  }
                }}
              >
                {t('notif.enable')}
              </button>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <p className="text-xs font-bold text-ink-soft">{t('set.notifyDays')}</p>
            <div className="flex items-center gap-1.5">
              {NOTIFY_OPTIONS.map((d) => (
                <SelectPill key={d} active={notifyDays === d} onSelect={() => selectNotify(d)}>
                  <span className="num">{fmt.num(d)}</span>
                </SelectPill>
              ))}
            </div>
          </div>
          {perm === 'granted' && (
            <div className="flex items-center justify-between gap-2">
              <p className="text-[11px] leading-relaxed text-ink-soft">{t('notif.dailyNote')}</p>
              <button
                type="button"
                className="tap shrink-0 rounded-2xl border border-line px-2.5 py-2 text-[11px] font-bold text-ink-soft"
                onClick={async () => {
                  const ok = await sendTestNotification()
                  if (ok) setFlash(t('notif.testSent'))
                }}
              >
                {t('notif.test')}
              </button>
            </div>
          )}
          {flash && <p className="text-[11px] font-bold text-primary-deep">{flash}</p>}
        </Card>
      </section>

      {/* calendar */}
      <section>
        <GroupHeader label={t('set.calendarGroup')} />
        <div className="flex flex-col gap-3">
          <Card className="flex min-h-14 items-center gap-3 !p-4">
            <IconBubble name="calendar" />
            <span className="min-w-0 flex-1 text-sm font-bold text-ink">{t('set.shareIcs')}</span>
            <button
              type="button"
              aria-label={t('set.shareIcs')}
              onClick={() =>
                downloadFile(
                  'finello-payments.ics',
                  paymentsIcs(allPayments(), t('app.name')),
                  'text/calendar;charset=utf-8',
                )
              }
              className="tap -me-3 flex shrink-0 items-center justify-center rounded-2xl border border-line bg-surface p-3 text-ink-soft"
            >
              <Icon name="download" className="h-5 w-5" />
            </button>
          </Card>
        </div>
      </section>

      {/* bank (multi) */}
      <section>
        <GroupHeader label={t('set.bankGroup')} />
        <div className="flex flex-col gap-3">
          {banks.map((b) => (
            <Card key={b.id} className="flex min-h-14 items-center gap-3 !p-4">
              <IconBubble name="bank" />
              <span className="min-w-0 flex-1 text-sm font-bold text-ink">
                {t('set.connectedBank', { bank: b.name })}
              </span>
              <button
                type="button"
                onClick={() => disconnect(b.id)}
                aria-label={t('set.disconnect')}
                className="tap flex min-h-11 shrink-0 items-center gap-1.5 rounded-2xl px-2 text-xs font-bold text-danger"
              >
                <Icon name="trash" className="h-4 w-4" />
                {t('set.disconnect')}
              </button>
            </Card>
          ))}
          <button type="button" onClick={() => setBankOpen(true)} className="tap w-full text-start">
            <Card className="flex min-h-14 items-center gap-3 !p-4">
              <IconBubble name="plus" />
              <span className="min-w-0 flex-1 text-sm font-bold text-ink">{t('set.connectBank')}</span>
              <Icon name="chevron" className="h-4 w-4 shrink-0 text-ink-soft" />
            </Card>
          </button>
        </div>
      </section>

      {/* privacy */}
      <section>
        <GroupHeader label={t('set.privacyGroup')} />
        <div className="flex flex-col gap-3">
          <button
            type="button"
            className="tap w-full text-start"
            onClick={() =>
              downloadFile(
                'finello-transactions.csv',
                transactionsCsv(exportableTransactions()),
                'text/csv;charset=utf-8',
              )
            }
          >
            <Card className="flex min-h-14 items-center gap-3 !p-4">
              <IconBubble name="up" />
              <span className="min-w-0 flex-1 text-sm font-bold text-ink">{t('set.exportData')}</span>
              <Icon name="download" className="h-4 w-4 shrink-0 text-ink-soft" />
            </Card>
          </button>
          <button type="button" onClick={() => setWipeOpen(true)} className="tap w-full text-start">
            <Card className="flex min-h-14 items-center gap-3 !p-4">
              <IconBubble name="trash" danger />
              <span className="min-w-0 flex-1 text-sm font-bold text-danger">{t('set.wipeData')}</span>
              <Icon name="chevron" className="h-4 w-4 shrink-0 text-danger" />
            </Card>
          </button>
        </div>
      </section>

      {/* about */}
      <section>
        <GroupHeader label={t('int.group')} />
        <div className="flex flex-col gap-3">
          <Card className="flex min-h-14 flex-col gap-2 !p-4">
            <div className="flex items-center gap-3">
              <IconBubble name="globe" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-ink">{t('int.google')}</p>
                <p className="truncate text-xs text-ink-soft">
                  {gSession?.email ? t('int.connected', { email: gSession.email }) : t('int.googleDesc')}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              {gSession ? (
                <>
                  <button type="button" className="btn-primary flex-1" onClick={backupNow}>
                    {t('int.backupNow')}
                  </button>
                  <button type="button" className="btn-ghost" onClick={disconnectGoogle}>
                    {t('int.disconnect')}
                  </button>
                </>
              ) : googleConfigured() ? (
                <button type="button" className="btn-primary w-full" onClick={connectGoogle}>
                  {t('int.connect')}
                </button>
              ) : (
                <p className="text-[11px] font-bold text-ink-soft">{t('int.notConfigured')}</p>
              )}
            </div>
            {backupOk && <p className="text-xs font-bold text-primary-deep">{t('int.backupOk')}</p>}
          </Card>
          <button type="button" className="tap w-full text-start" onClick={emailExport}>
            <Card className="flex min-h-14 items-center gap-3 !p-4">
              <IconBubble name="receipt" />
              <span className="min-w-0 flex-1 text-sm font-bold text-ink">{t('int.emailExport')}</span>
              <Icon name="chevron" className="h-4 w-4 shrink-0 text-ink-soft" />
            </Card>
          </button>
        </div>
      </section>

      <section>
        <GroupHeader label={t('set.legalGroup')} />
        <div className="flex flex-col gap-3">
          {(['impressum', 'privacy', 'terms'] as const).map((k) => (
            <button key={k} type="button" className="tap w-full text-start" onClick={() => setLegalDoc(k)}>
              <Card className="flex min-h-14 items-center gap-3 !p-4">
                <IconBubble name="check" />
                <span className="min-w-0 flex-1 text-sm font-bold text-ink">{t(`set.${k}`)}</span>
                <Icon name="chevron" className="h-4 w-4 shrink-0 text-ink-soft" />
              </Card>
            </button>
          ))}
        </div>
      </section>

      {/* about */}
      <section>
        <GroupHeader label={t('set.aboutGroup')} />
        <div className="flex flex-col gap-3">
          {/* plan display only — nelurio.com is the only sales channel (no in-app purchase) */}
          <Card className="flex min-h-14 flex-col justify-center gap-1.5 !p-4">
            <div className="flex items-center gap-3">
              <span className="flex-1 text-sm font-bold text-ink">{t('set.plan')}</span>
              <Badge tone="success">{t('set.planFree')}</Badge>
            </div>
            <a
              href="https://nelurio.com/#p-finello"
              target="_blank"
              rel="noopener noreferrer"
              className="tap -ms-1 flex items-center gap-1 self-start rounded-2xl px-1 py-0.5 text-xs font-bold text-primary-deep"
            >
              {t('set.planUpgrade')}
              <span dir="ltr" className="font-medium text-ink-soft">
                nelurio.com
              </span>
              <Icon name="chevron" className="h-3 w-3" />
            </a>
          </Card>
          <Card className="flex min-h-14 items-center gap-3 !p-4">
            <span className="flex-1 text-sm font-bold text-ink">{t('set.version')}</span>
            <span className="num text-sm font-medium text-ink-soft">0.1.0</span>
          </Card>
          <Card className="flex min-h-14 items-center gap-3 !p-4">
            <span className="flex-1 text-sm font-bold text-ink">{t('set.license')}</span>
            <span className="num text-sm font-medium text-ink-soft">MIT</span>
          </Card>
          <Card className="flex min-h-14 items-center !p-4">
            <p className="text-[11px] leading-relaxed text-ink-soft">{t('set.aboutDisclaimer')}</p>
          </Card>
        </div>
      </section>

      {/* bank connect */}
      <Modal open={bankOpen} onClose={() => setBankOpen(false)} title={t('set.connectBank')}>
        <div className="flex flex-col gap-3">
          {catalog.map((b) => {
            const isConnected = banks.some((x) => x.id === b.id)
            return (
              <button
                key={b.id}
                type="button"
                disabled={isConnected}
                onClick={() => setPickedBank(b)}
                className={`tap w-full text-start ${isConnected ? 'opacity-50' : ''}`}
              >
                <Card
                  className={`flex min-h-14 items-center gap-3 !p-3 ${
                    pickedBank?.id === b.id ? 'ring-2 ring-primary' : ''
                  }`}
                >
                  <IconBubble name="bank" />
                  <span className="flex-1 text-sm font-bold text-ink">{b.name}</span>
                  {isConnected ? (
                    <Icon name="check" className="h-5 w-5 shrink-0 text-primary-deep" />
                  ) : (
                    <span
                      className={`h-5 w-5 shrink-0 rounded-full border-2 ${
                        pickedBank?.id === b.id ? 'border-primary bg-primary' : 'border-line'
                      }`}
                    />
                  )}
                </Card>
              </button>
            )
          })}
          <p className="mt-1 text-[11px] leading-relaxed text-ink-soft">{t('set.bankConsent')}</p>
          <div className="mt-2 flex gap-3">
            <button
              type="button"
              className="btn-ghost flex-1"
              onClick={() => {
                setPickedBank(null)
                setBankOpen(false)
              }}
            >
              {t('common.cancel')}
            </button>
            <button
              type="button"
              disabled={!pickedBank}
              onClick={() => {
                if (pickedBank) connect(pickedBank)
                setPickedBank(null)
                setBankOpen(false)
              }}
              className="btn-primary flex-1 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {t('set.connectBank')}
            </button>
          </div>
        </div>
      </Modal>

      {/* wipe confirmation */}
      <Modal open={wipeOpen} onClose={() => setWipeOpen(false)} title={t('set.wipeData')}>
        <p className="text-sm font-medium text-ink-soft">{t('set.wipeConfirm')}</p>
        <div className="mt-4 flex gap-2">
          <button type="button" onClick={() => setWipeOpen(false)} className="btn-ghost flex-1">
            {t('common.cancel')}
          </button>
          <button
            type="button"
            onClick={wipeAll}
            className="inline-flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-2xl bg-danger px-5 py-3 text-sm font-bold text-white shadow transition active:scale-[0.97]"
          >
            <Icon name="trash" className="h-4 w-4" />
            {t('set.wipeData')}
          </button>
        </div>
      </Modal>

      {/* profile edit */}
      <Modal open={profileOpen} onClose={() => setProfileOpen(false)} title={t('set.profileGroup')}>
        <div className="flex flex-col gap-3">
          <div>
            <label htmlFor="fin-prof-name" className="mb-1 block ps-1 text-xs font-bold text-ink-soft">
              {t('set.name')}
            </label>
            <input
              id="fin-prof-name"
              type="text"
              className="field"
              value={pName}
              onChange={(e) => setPName(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="fin-prof-email" className="mb-1 block ps-1 text-xs font-bold text-ink-soft">
              {t('set.email')}
            </label>
            <input
              id="fin-prof-email"
              type="email"
              className="field"
              value={pEmail}
              onChange={(e) => setPEmail(e.target.value)}
            />
          </div>
          <div className="mt-2 flex gap-3">
            <button type="button" className="btn-ghost flex-1" onClick={() => setProfileOpen(false)}>
              {t('common.cancel')}
            </button>
            <button
              type="button"
              className="btn-primary flex-1"
              onClick={() => {
                const a = getAccount()
                if (a) {
                  saveAccount({ ...a, name: pName.trim() || a.name, email: pEmail.trim() || a.email })
                } else {
                  saveAccount({
                    name: pName.trim() || 'Friend',
                    email: pEmail.trim(),
                    createdAt: new Date().toISOString(),
                  })
                }
                setProfileOpen(false)
                setVersion((v) => v + 1)
              }}
            >
              {t('common.save')}
            </button>
          </div>
        </div>
      </Modal>

      <LegalSheet docKey={legalDocKey} onClose={() => setLegalDoc(null)} />

      {/* product tour is mounted app-wide in AppShell; requestTour() replays it */}
    </div>
  )
}
