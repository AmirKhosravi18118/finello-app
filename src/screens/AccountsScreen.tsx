import { useState } from 'react'
import { useI18n } from '../i18n/I18nContext'
import {
  AppHeader,
  Card,
  EmptyState,
  Icon,
  IconChip,
  Modal,
  SectionHeader,
  SkeletonCard,
} from '../components/ui'
import { useBankConnection, useLiveBankCatalog, isLive } from '../bank/bankConnection'
import { getImportedTx } from '../bank/bankConnection'
import { getCashTx } from '../data/editStore'

export function AccountsScreen() {
  const { t, fmt } = useI18n()
  const { banks, catalog: mockCatalog, connect, disconnect, importNow } = useBankConnection()
  const liveCatalog = useLiveBankCatalog()
  const catalog = isLive() ? liveCatalog : mockCatalog
  const [connectOpen, setConnectOpen] = useState(false)
  const [pickedBank, setPickedBank] = useState<{ id: string; name: string } | null>(null)
  const [flash, setFlash] = useState(0)
  const [, setVersion] = useState(0)
  const refresh = () => setVersion((v) => v + 1)

  const imported = getImportedTx()
  const bankRows = banks.map((b) => {
    const rows = imported.filter((tx) => tx.bankId === b.id)
    const balance = rows.reduce((s, tx) => s + tx.amount, 0)
    const lastDate = rows.reduce((m, tx) => (tx.date > m ? tx.date : m), '')
    return { bank: b, count: rows.length, balance, lastDate }
  })
  const cashRows = getCashTx()
  const cashBalance = cashRows.reduce((s, tx) => s + tx.amount, 0)
  const total = bankRows.reduce((s, r) => s + r.balance, 0) + cashBalance

  // simulated fetch for skeletons
  const [loaded, setLoaded] = useState(false)
  useState(() => {
    window.setTimeout(() => setLoaded(true), 350)
    return null
  })

  return (
    <div className="anim-stagger flex flex-col gap-5">
      <AppHeader
        overline={t('app.name')}
        title={t('nav.konten')}
        trailing={
          <button
            type="button"
            aria-label={t('knt.fetch')}
            onClick={() => {
              setFlash(importNow())
              refresh()
            }}
            className="tap shadow-card flex h-11 w-11 items-center justify-center rounded-2xl bg-surface text-ink"
          >
            <Icon name="download" className="h-5 w-5" />
          </button>
        }
      />

      {flash > 0 && (
        <p className="num text-xs font-bold text-primary-deep">{t('tx.importedNew', { n: flash })}</p>
      )}

      {/* total hero */}
      {loaded ? (
        <section className="hero-gradient shadow-card screen-in rounded-[24px] p-5 text-white">
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/70">{t('knt.total')}</p>
          <p className="num mt-1 text-[30px] font-extrabold leading-[1.1] tracking-[-0.02em]">
            {fmt.currency(total)}
          </p>
          {(bankRows.length > 0 || cashRows.length > 0) && (
            <p className="num mt-2 text-xs font-medium text-white/70">
              {t('knt.txCount', {
                n: bankRows.reduce((s, r) => s + r.count, 0) + cashRows.length,
              })}
            </p>
          )}
        </section>
      ) : (
        <SkeletonCard />
      )}

      {/* accounts */}
      <section className="flex flex-col gap-3">
        <SectionHeader icon="bank" tone="success" title={t('set.bankGroup')} />

        {bankRows.length === 0 && cashRows.length === 0 ? (
          <Card>
            <EmptyState
              icon="bank"
              text={t('knt.empty')}
              action={
                <button type="button" onClick={() => setConnectOpen(true)} className="btn-primary mt-2">
                  <Icon name="plus" className="h-4 w-4" />
                  {t('knt.connect')}
                </button>
              }
            />
          </Card>
        ) : (
          <>
            {bankRows.map(({ bank, count, balance, lastDate }) => (
              <Card key={bank.id} className="flex items-center gap-3 !p-4">
                <IconChip icon="bank" tone="success" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-extrabold leading-snug text-ink">{bank.name}</p>
                  <p className="num t-caption truncate">
                    {t('knt.txCount', { n: count })}
                    {lastDate ? ` · ${fmt.date(new Date(lastDate))}` : ''}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <span className="num text-sm font-extrabold leading-[1.1] text-ink">
                    {fmt.currency(balance)}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      disconnect(bank.id)
                      refresh()
                    }}
                    className="tap text-[11px] font-bold text-danger"
                  >
                    {t('set.disconnect')}
                  </button>
                </div>
                <Icon name="chevron" className="h-4 w-4 shrink-0 text-ink-soft" />
              </Card>
            ))}

            {cashRows.length > 0 && (
              <Card className="flex items-center gap-3 !p-4">
                <IconChip icon="hand" tone="warn" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-extrabold leading-snug text-ink">{t('knt.cash')}</p>
                  <p className="num t-caption truncate">{t('knt.txCount', { n: cashRows.length })}</p>
                </div>
                <span className="num shrink-0 text-sm font-extrabold leading-[1.1] text-ink">
                  {fmt.currency(cashBalance)}
                </span>
              </Card>
            )}
          </>
        )}

        <button type="button" onClick={() => setConnectOpen(true)} className="tap w-full text-start">
          <Card className="flex min-h-14 items-center gap-3 !p-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-chip text-ink">
              <Icon name="plus" className="h-5 w-5" />
            </span>
            <span className="min-w-0 flex-1 text-sm font-bold text-ink">{t('knt.connect')}</span>
            <Icon name="chevron" className="h-4 w-4 shrink-0 text-ink-soft" />
          </Card>
        </button>
      </section>

      {/* connect modal */}
      <Modal open={connectOpen} onClose={() => setConnectOpen(false)} title={t('set.connectBank')}>
        <div className="flex flex-col gap-2">
          <p className="text-[11px] font-bold text-ink-soft">
            {isLive() ? t('auth.liveBadge') : t('auth.demoBadge')}
          </p>
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
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-chip text-ink-soft">
                    <Icon name="bank" className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1 text-sm font-bold text-ink">{b.name}</span>
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
                setConnectOpen(false)
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
                setConnectOpen(false)
                refresh()
              }}
              className="btn-primary flex-1 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {t('set.connectBank')}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
