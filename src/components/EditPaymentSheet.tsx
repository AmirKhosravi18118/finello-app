import { useEffect, useState } from 'react'
import { useI18n } from '../i18n/I18nContext'
import { Icon, Modal } from './ui'
import type { Payment } from '../data/demo'
import { removeUserPayment, savePaymentEdit, tombstoneTx } from '../data/editStore'

export interface PaymentDraft {
  title: string
  amount: number
  dayOfMonth: number
  recipient: string
}

/** Edit sheet for an existing payment (demo rows tombstoned, user rows removed). */
export function EditPaymentSheet({
  open,
  onClose,
  payment,
  onSaved,
}: {
  open: boolean
  onClose: () => void
  payment: Payment | null
  onSaved: () => void
}) {
  const { t } = useI18n()
  const [draft, setDraft] = useState<PaymentDraft>({ title: '', amount: 0, dayOfMonth: 1, recipient: '' })

  useEffect(() => {
    if (open && payment) {
      setDraft({
        title: payment.title,
        amount: payment.amount,
        dayOfMonth: payment.dayOfMonth,
        recipient: payment.recipient,
      })
    }
  }, [open, payment])

  const valid =
    draft.title.trim() !== '' && draft.amount > 0 && draft.dayOfMonth >= 1 && draft.dayOfMonth <= 31

  const set = (patch: Partial<PaymentDraft>) => setDraft((d) => ({ ...d, ...patch }))

  const del = () => {
    if (!payment) return
    if (payment.id.startsWith('pay-')) removeUserPayment(payment.id)
    else tombstoneTx(payment.id)
    onSaved()
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title={t('home.addPayment')}>
      <div className="flex flex-col gap-3">
        <div>
          <label htmlFor="fin-pay-edit-title" className="mb-1 block ps-1 text-xs font-bold text-ink-soft">
            {t('home.paymentTitle')}
          </label>
          <input
            id="fin-pay-edit-title"
            type="text"
            className="field"
            value={draft.title}
            onChange={(e) => set({ title: e.target.value })}
          />
        </div>
        <div className="flex gap-3">
          <div className="flex-1">
            <label htmlFor="fin-pay-edit-amount" className="mb-1 block ps-1 text-xs font-bold text-ink-soft">
              {t('home.amount')}
            </label>
            <input
              id="fin-pay-edit-amount"
              type="number"
              min={0}
              className="field num"
              value={draft.amount === 0 ? '' : draft.amount}
              onChange={(e) => set({ amount: Number(e.target.value) })}
            />
          </div>
          <div className="flex-1">
            <label htmlFor="fin-pay-edit-day" className="mb-1 block ps-1 text-xs font-bold text-ink-soft">
              {t('home.dayOfMonth')}
            </label>
            <input
              id="fin-pay-edit-day"
              type="number"
              min={1}
              max={31}
              className="field num"
              value={draft.dayOfMonth}
              onChange={(e) => set({ dayOfMonth: Number(e.target.value) })}
            />
          </div>
        </div>
        <div>
          <label htmlFor="fin-pay-edit-recipient" className="mb-1 block ps-1 text-xs font-bold text-ink-soft">
            {t('home.recipient')}
          </label>
          <input
            id="fin-pay-edit-recipient"
            type="text"
            className="field"
            value={draft.recipient}
            onChange={(e) => set({ recipient: e.target.value })}
          />
        </div>
        <div className="mt-2 flex gap-3">
          <button type="button" className="btn-ghost flex-1" onClick={onClose}>
            {t('common.cancel')}
          </button>
          <button
            type="button"
            disabled={!valid}
            className="btn-primary flex-1 disabled:cursor-not-allowed disabled:opacity-40"
            onClick={() => {
              if (payment && valid) {
                savePaymentEdit(payment.id, {
                  title: draft.title.trim(),
                  amount: draft.amount,
                  dayOfMonth: draft.dayOfMonth,
                  recipient: draft.recipient.trim(),
                })
                onSaved()
                onClose()
              }
            }}
          >
            {t('common.save')}
          </button>
        </div>
        <button
          type="button"
          onClick={del}
          className="tap -mb-1 mt-1 flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl text-sm font-bold text-danger"
        >
          <Icon name="trash" className="h-4 w-4" />
          {t('common.delete')}
        </button>
      </div>
    </Modal>
  )
}
