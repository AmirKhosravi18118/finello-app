import { useI18n } from '../i18n/I18nContext'
import { CATEGORIES, type CategoryId } from '../data/demo'
import { INCOME_TYPES, type IncomeType } from '../data/editStore'

/** Structured category/income-type selector (Finanzguru-style): a labeled
 *  3-column grid of tiles — no more loose floating pills. */
export function CategoryGrid({
  value,
  onChange,
}: {
  value: CategoryId | null
  onChange: (v: CategoryId | null) => void
}) {
  const { t } = useI18n()

  return (
    <div className="grid grid-cols-3 gap-2">
      {(Object.keys(CATEGORIES) as CategoryId[]).map((id) => {
        const active = value === id
        const color = CATEGORIES[id].color
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
            <span
              className="flex h-8 w-8 items-center justify-center rounded-xl"
              style={{ backgroundColor: `${color}1f` }}
            >
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
            </span>
            <span className="w-full truncate text-center text-[11px] font-bold leading-tight text-ink">
              {t(`cat.${id}`)}
            </span>
          </button>
        )
      })}
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
            <span className="w-full truncate text-center text-[11px] font-bold leading-tight text-ink">
              {t(`inc.${id}`)}
            </span>
          </button>
        )
      })}
    </div>
  )
}
