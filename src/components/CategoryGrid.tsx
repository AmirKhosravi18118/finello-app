import { useState } from 'react'
import { useI18n } from '../i18n/I18nContext'
import { CATEGORIES, type CategoryId } from '../data/demo'
import {
  addCustomCat,
  getCustomCats,
  removeCustomCat,
  INCOME_TYPES,
  type IncomeType,
} from '../data/editStore'

interface CatDef {
  id: string
  label: string
  color: string
  custom?: boolean
}

function useAllCats() {
  const { t } = useI18n()
  const builtins: CatDef[] = (Object.keys(CATEGORIES) as CategoryId[]).map((id) => ({
    id,
    label: t(`cat.${id}`),
    color: CATEGORIES[id].color,
  }))
  const customs: CatDef[] = getCustomCats().map((c) => ({
    id: c.id,
    label: c.label,
    color: '#8b5cf6',
    custom: true,
  }))
  return { cats: [...builtins, ...customs], rerender: () => undefined }
}

/** Structured category selector with user-defined categories (WP31):
 *  add via the dashed + tile, custom tiles carry a delete badge. */
export function CategoryGrid({
  value,
  onChange,
}: {
  value: CategoryId | null
  onChange: (v: CategoryId | null) => void
}) {
  const { cats, rerender } = useAllCats()
  const [adding, setAdding] = useState(false)
  const [newLabel, setNewLabel] = useState('')

  const addCat = () => {
    if (newLabel.trim().length < 2) return
    addCustomCat(newLabel)
    setNewLabel('')
    setAdding(false)
    rerender()
  }

  return (
    <div className="grid grid-cols-3 gap-2">
      {cats.map((c) => (
        <div key={c.id} className="relative">
          <button
            type="button"
            onClick={() => onChange(c.id as CategoryId)}
            aria-pressed={value === c.id}
            className={`tap flex min-h-16 w-full flex-col items-center justify-center gap-1 rounded-2xl border p-2 ${
              value === c.id
                ? 'border-primary bg-primary-soft/40 ring-2 ring-primary/30'
                : 'border-line bg-surface'
            }`}
          >
            <span
              className="flex h-8 w-8 items-center justify-center rounded-xl"
              style={{ backgroundColor: `${c.color}1f` }}
            >
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: c.color }} />
            </span>
            <span className="w-full text-center text-[11px] font-bold leading-tight text-ink [overflow-wrap:break-word]">
              {c.label}
            </span>
          </button>
          {c.custom && (
            <button
              type="button"
              aria-label="delete"
              onClick={(e) => {
                e.stopPropagation()
                removeCustomCat(c.id)
                rerender()
              }}
              className="tap absolute -top-1.5 -end-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-danger text-white"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-3 w-3"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
              >
                <path d="M6 6l12 12M18 6 6 18" />
              </svg>
            </button>
          )}
        </div>
      ))}
      <button
        type="button"
        onClick={() => setAdding(true)}
        aria-label="add category"
        className="tap flex min-h-16 flex-col items-center justify-center gap-1 rounded-2xl border border-dashed border-line p-2 text-ink-soft"
      >
        <span className="text-xl leading-none">+</span>
        <span className="text-[10px] font-bold">+</span>
      </button>
      {adding && (
        <div className="col-span-3 flex gap-2">
          <input
            autoFocus
            className="field flex-1"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addCat()}
          />
          <button type="button" className="btn-primary" onClick={addCat}>
            OK
          </button>
        </div>
      )}
    </div>
  )
}

/** Income-type grid variant (separate so types stay typed). */
export function IncomeTypeGrid({
  value,
  onChange,
}: {
  value: IncomeType | null
  onChange: (v: IncomeType) => void
}) {
  const { t } = useI18n()
  return (
    <div className="grid grid-cols-3 gap-2">
      {INCOME_TYPES.map((id) => {
        const active = value === id
        return (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            aria-pressed={active}
            className={`tap flex min-h-16 flex-col items-center justify-center gap-1 rounded-2xl border p-2 ${
              active ? 'border-primary bg-primary-soft/40 ring-2 ring-primary/30' : 'border-line bg-surface'
            }`}
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary-soft">
              <span className="h-2.5 w-2.5 rounded-full bg-primary" />
            </span>
            <span className="w-full text-center text-[11px] font-bold leading-tight text-ink [overflow-wrap:break-word]">
              {t(`inc.${id}`)}
            </span>
          </button>
        )
      })}
    </div>
  )
}
