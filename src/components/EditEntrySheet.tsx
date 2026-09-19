import { useEffect, useState } from 'react'
import { useI18n } from '../i18n/I18nContext'
import { Icon, Modal, Pill } from './ui'
import { CATEGORIES, type CategoryId } from '../data/demo'
import { INCOME_TYPES, type IncomeType } from '../data/editStore'

const CATEGORY_IDS = Object.keys(CATEGORIES) as CategoryId[]

export interface EntryDraft {
  name: string
  amount: number
  date: string
  categoryId: CategoryId | null
  incomeType?: IncomeType
}

/** Generic detail/edit sheet for transactions, expenses and cash entries (WP5).
 *  Positive (inflow) rows edit their income type instead of an expense category. */
export function EditEntrySheet({
  open,
  onClose,
  title,
  initial,
  allowCategoryClear = true,
  showDelete = false,
  inflow = false,
  onSave,
  onDelete,
  saveLabel,
}: {
  open: boolean
  onClose: () => void
  title: string
  initial: EntryDraft
  allowCategoryClear?: boolean
  showDelete?: boolean
  inflow?: boolean
  onSave: (draft: EntryDraft) => void
  onDelete?: () => void
  saveLabel?: string
}) {
  const { t } = useI18n()
  const [draft, setDraft] = useState<EntryDraft>(initial)

  useEffect(() => {
    if (open) setDraft(initial)
  }, [open, initial])

  const set = (patch: Partial<EntryDraft>) => setDraft((d) => ({ ...d, ...patch }))

  return (
    <Modal open={open} onClose={onClose} title={title}>
      <div className="flex flex-col gap-3">
        <div>
          <label htmlFor="fin-entry-name" className="mb-1 block ps-1 text-xs font-bold text-ink-soft">
            {t('tx.name')}
          </label>
          <input
            id="fin-entry-name"
            type="text"
            className="field"
            value={draft.name}
            onChange={(e) => set({ name: e.target.value })}
          />
        </div>
        <div className="flex gap-3">
          <div className="flex-1">
            <label htmlFor="fin-entry-amount" className="mb-1 block ps-1 text-xs font-bold text-ink-soft">
              {t('home.amount')}
            </label>
            <input
              id="fin-entry-amount"
              type="number"
              step="0.01"
              className="field num"
              value={draft.amount === 0 ? '' : draft.amount}
              onChange={(e) => set({ amount: Number(e.target.value) })}
            />
          </div>
          <div className="flex-1">
            <label htmlFor="fin-entry-date" className="mb-1 block ps-1 text-xs font-bold text-ink-soft">
              {t('tx.date')}
            </label>
            <input
              id="fin-entry-date"
              type="date"
              className="field num"
              value={draft.date}
              onChange={(e) => set({ date: e.target.value })}
            />
          </div>
        </div>
        {inflow ? (
          <div>
            <p className="mb-1.5 ps-1 text-xs font-bold text-ink-soft">{t('cash.incomeType')}</p>
            <div className="flex max-h-36 flex-wrap gap-2 overflow-y-auto">
              {INCOME_TYPES.map((id) => (
                <Pill key={id} active={draft.incomeType === id} onClick={() => set({ incomeType: id })}>
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-primary" />
                    {t(`inc.${id}`)}
                  </span>
                </Pill>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <p className="mb-1.5 ps-1 text-xs font-bold text-ink-soft">{t('tx.assignCategory')}</p>
            <div className="flex max-h-36 flex-wrap gap-2 overflow-y-auto">
              {allowCategoryClear && (
                <Pill active={draft.categoryId === null} onClick={() => set({ categoryId: null })}>
                  —
                </Pill>
              )}
              {CATEGORY_IDS.map((id) => (
                <Pill key={id} active={draft.categoryId === id} onClick={() => set({ categoryId: id })}>
                  <span className="flex items-center gap-1.5">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: CATEGORIES[id].color }}
                    />
                    {t(`cat.${id}`)}
                  </span>
                </Pill>
              ))}
            </div>
          </div>
        )}

        <div className="mt-2 flex gap-3">
          <button type="button" className="btn-ghost flex-1" onClick={onClose}>
            {t('common.cancel')}
          </button>
          <button
            type="button"
            className="btn-primary flex-1"
            onClick={() => {
              onSave(draft)
              onClose()
            }}
          >
            {saveLabel ?? t('common.save')}
          </button>
        </div>

        {showDelete && onDelete && (
          <button
            type="button"
            onClick={() => {
              onDelete()
              onClose()
            }}
            className="tap -mb-1 mt-1 flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl text-sm font-bold text-danger"
          >
            <Icon name="trash" className="h-4 w-4" />
            {t('common.delete')}
          </button>
        )}
      </div>
    </Modal>
  )
}
