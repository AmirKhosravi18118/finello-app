import { useEffect, useState } from 'react'
import { useI18n } from '../i18n/I18nContext'
import { CATEGORIES, type CategoryId } from '../data/demo'
import { getUserCats, addUserCat, removeUserCat } from '../data/userCats'
import { INCOME_TYPES, type IncomeType } from '../data/editStore'

interface CatDef {
  id: string
  label: string
  color: string
  custom?: boolean
}

function useAllCats() {
  const { t } = useI18n()
  // 'income' is a tx-category (demo income rows), not a selectable expense category
  const builtins: CatDef[] = (Object.keys(CATEGORIES) as CategoryId[])
    .filter((id) => id !== 'income')
    .map((id) => ({
      id,
      label: t(`cat.${id}`),
      color: CATEGORIES[id].color,
    }))
  const customs: CatDef[] = getUserCats().map((c) => ({
    id: c.id,
    label: c.label,
    color: c.color,
    custom: true,
  }))
  return [...builtins, ...customs]
}

/** Category selector v1.2: builtins + user-defined categories.
 *  Add via dashed + tile, custom tiles have delete ×, selected ring. */
export function CategoryGrid({
  value,
  onChange,
}: {
  value: CategoryId | null
  onChange: (v: CategoryId | null) => void
}) {
  const { t } = useI18n()
  const cats = useAllCats()
  const [adding, setAdding] = useState(false)
  const [, setTick] = useState(0)
  useEffect(() => {
    const h = () => setTick((v) => v + 1)
    window.addEventListener('finello:cats-changed', h)
    return () => window.removeEventListener('finello:cats-changed', h)
  }, [])
  const [newLabel, setNewLabel] = useState('')

  const addCat = () => {
    if (newLabel.trim().length < 2) return
    addUserCat(newLabel)
    setNewLabel('')
    setAdding(false)
    // force parent remount via storage event (simplest reliable refresh)
    window.dispatchEvent(new Event('finello:cats-changed'))
  }

  return (
    <div className="grid grid-cols-3 gap-2">
      {cats.map((c) => {
        const isCustom = c.id.startsWith('uc-')
        return (
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
            {isCustom && (
              <button
                type="button"
                aria-label={t('common.delete')}
                onClick={(e) => {
                  e.stopPropagation()
                  removeUserCat(c.id)
                  window.dispatchEvent(new Event('finello:cats-changed'))
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
        )
      })}
      <button
        type="button"
        onClick={() => setAdding(true)}
        aria-label={t('cat.addCat')}
        className="tap flex min-h-16 flex-col items-center justify-center gap-1 rounded-2xl border border-dashed border-line p-2 text-ink-soft"
      >
        <span className="text-xl leading-none">+</span>
        <span className="w-full text-center text-[10px] font-bold leading-tight">{t('cat.addCat')}</span>
      </button>
      {adding && (
        <div className="col-span-3 flex gap-2">
          <input
            autoFocus
            className="field flex-1"
            placeholder={t('cat.newName')}
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addCat()}
          />
          <button type="button" className="btn-primary" onClick={addCat}>
            {t('common.add')}
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
