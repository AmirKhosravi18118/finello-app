import { useEffect, useState } from 'react'
import { useI18n } from '../i18n/I18nContext'
import { Modal } from './ui'
import type { CategoryId } from '../data/demo'
import { addUserPayment } from '../data/editStore'

/** Add-payment sheet (CONTRACT §5 / DS2.0 §5): controlled modal — opened from the
 *  Home section actions, the Calendar header "+" or the nav quick-add menu
 *  (window event `finello:quick-add` with detail 'payment', listened to in HomeScreen).
 *  Saving persists a real user payment (WP6) — screens refresh via onAdded. */
export function AddPaymentSheet({
  open,
  onClose,
  onAdded,
}: {
  open: boolean
  onClose: () => void
  onAdded?: () => void
}) {
  const { t } = useI18n()
  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [day, setDay] = useState('')
  const [recipient, setRecipient] = useState('')

  const valid = title.trim() !== '' && Number(amount) > 0 && Number(day) >= 1 && Number(day) <= 31

  useEffect(() => {
    if (!open) {
      setTitle('')
      setAmount('')
      setDay('')
      setRecipient('')
    }
  }, [open])

  const save = () => {
    if (!valid) return
    addUserPayment({
      title: title.trim(),
      amount: Number(amount),
      dayOfMonth: Number(day),
      recipient: recipient.trim() || '—',
      categoryId: 'other' as CategoryId,
    })
    onAdded?.()
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title={t('home.addPayment')}>
      <div className="flex flex-col gap-3">
        <div>
          <label htmlFor="fin-payment-title" className="mb-1 block ps-1 text-xs font-bold text-ink-soft">
            {t('home.paymentTitle')}
          </label>
          <input
            id="fin-payment-title"
            type="text"
            className="field"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div className="flex gap-3">
          <div className="flex-1">
            <label htmlFor="fin-payment-amount" className="mb-1 block ps-1 text-xs font-bold text-ink-soft">
              {t('home.amount')}
            </label>
            <input
              id="fin-payment-amount"
              type="number"
              min={0}
              className="field num"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <div className="flex-1">
            <label htmlFor="fin-payment-day" className="mb-1 block ps-1 text-xs font-bold text-ink-soft">
              {t('home.dayOfMonth')}
            </label>
            <input
              id="fin-payment-day"
              type="number"
              min={1}
              max={31}
              className="field num"
              value={day}
              onChange={(e) => setDay(e.target.value)}
            />
          </div>
        </div>
        <div>
          <label htmlFor="fin-payment-recipient" className="mb-1 block ps-1 text-xs font-bold text-ink-soft">
            {t('home.recipient')}
          </label>
          <input
            id="fin-payment-recipient"
            type="text"
            className="field"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
          />
        </div>
        <div className="mt-2 flex gap-3">
          <button type="button" className="btn-ghost flex-1" onClick={onClose}>
            {t('common.cancel')}
          </button>
          <button
            type="button"
            disabled={!valid}
            onClick={save}
            className="btn-primary flex-1 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {t('common.save')}
          </button>
        </div>
      </div>
    </Modal>
  )
}
