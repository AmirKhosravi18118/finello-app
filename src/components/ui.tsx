import type { HTMLAttributes, ReactNode } from 'react'
import { useI18n } from '../i18n/I18nContext'

/* ---------- layout primitives ---------- */

export function Card(props: HTMLAttributes<HTMLDivElement>) {
  const { className = '', ...rest } = props
  return <div className={`card p-4 ${className}`} {...rest} />
}

export function SectionTitle({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="mb-2 flex items-center justify-between gap-2">
      <h2 className="text-[15px] font-extrabold text-ink">{title}</h2>
      {action}
    </div>
  )
}

/* ---------- atoms ---------- */

export type Tone = 'success' | 'warn' | 'danger' | 'neutral'

const TONE_CLASS: Record<Tone, string> = {
  success: 'bg-primary-soft text-primary-deep',
  warn: 'bg-amber-soft text-amber-600',
  danger: 'bg-danger-soft text-danger',
  neutral: 'bg-slate-100 text-slate-600',
}

export function Badge({ tone, children }: { tone: Tone; children: ReactNode }) {
  return <span className={`badge ${TONE_CLASS[tone]}`}>{children}</span>
}

export function StatCard({
  label,
  value,
  sub,
  tone = 'default',
}: {
  label: string
  value: string
  sub?: string
  tone?: 'default' | 'success' | 'warn' | 'danger'
}) {
  const valueColor =
    tone === 'success'
      ? 'text-primary-deep'
      : tone === 'warn'
        ? 'text-amber-600'
        : tone === 'danger'
          ? 'text-danger'
          : 'text-ink'
  return (
    <Card className="min-w-[140px] flex-1">
      <p className="text-[11px] font-bold uppercase tracking-wide text-ink-soft">{label}</p>
      <p className={`num mt-1 text-xl font-extrabold ${valueColor}`}>{value}</p>
      {sub && <p className="mt-0.5 text-[11px] font-medium text-ink-soft">{sub}</p>}
    </Card>
  )
}

export function ProgressBar({ value, label }: { value: number; label?: string }) {
  const pct = Math.round(Math.min(1, Math.max(0, value)) * 100)
  return (
    <div
      className="h-2 w-full overflow-hidden rounded-full bg-slate-100"
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <div
        className="h-full rounded-full bg-gradient-to-r from-primary to-primary-deep transition-[width] duration-500"
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

export function Pill({
  active,
  onClick,
  children,
}: {
  active?: boolean
  onClick?: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`tap shrink-0 rounded-full px-4 py-2 text-xs font-bold ${
        active ? 'bg-navy text-white shadow-md' : 'border border-slate-200 bg-white text-ink-soft'
      }`}
    >
      {children}
    </button>
  )
}

/* ---------- icons (inline SVG, stroke style) ---------- */

export type IconName =
  | 'home'
  | 'calendar'
  | 'wallet'
  | 'receipt'
  | 'tax'
  | 'settings'
  | 'plus'
  | 'chevron'
  | 'bell'
  | 'user'
  | 'up'
  | 'down'
  | 'bank'
  | 'hand'
  | 'trash'
  | 'download'
  | 'globe'
  | 'check'

const PATHS: Record<IconName, ReactNode> = {
  home: (
    <>
      <path d="M3 11 12 3l9 8" />
      <path d="M5 10v10h14V10" />
    </>
  ),
  calendar: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="3" />
      <path d="M8 3v4M16 3v4M3 10h18" />
    </>
  ),
  wallet: (
    <>
      <path d="M3 7a2 2 0 0 1 2-2h12a1 1 0 0 1 1 1v2" />
      <path d="M3 7v11a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1V9a1 1 0 0 0-1-1H5a2 2 0 0 1-2-2z" />
      <path d="M16.5 13.5h.01" />
    </>
  ),
  receipt: (
    <>
      <path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3z" />
      <path d="M9 8h6M9 12h6" />
    </>
  ),
  tax: (
    <>
      <path d="M19 5 5 19" />
      <circle cx="6.5" cy="6.5" r="2.5" />
      <circle cx="17.5" cy="17.5" r="2.5" />
    </>
  ),
  settings: (
    <>
      <path d="M4 6h16M4 12h16M4 18h16" />
      <circle cx="9" cy="6" r="2" />
      <circle cx="15" cy="12" r="2" />
      <circle cx="8" cy="18" r="2" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  chevron: <path d="m9 6 6 6-6 6" />,
  bell: (
    <>
      <path d="M6 8a6 6 0 0 1 12 0c0 7 2 8 2 8H4s2-1 2-8" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 3.6-6 8-6s8 2 8 6" />
    </>
  ),
  up: <path d="M12 19V5m-7 7 7-7 7 7" />,
  down: <path d="M12 5v14m7-7-7 7-7-7" />,
  bank: (
    <>
      <path d="M4 10 12 4l8 6" />
      <path d="M8 10v6M12 10v6M16 10v6" />
      <path d="M4 20h16" />
    </>
  ),
  hand: <path d="M4 20l4-1L19 8a2 2 0 0 0-3-3L5 16l-1 4z" />,
  trash: (
    <>
      <path d="M4 7h16M9 7V5h6v2" />
      <path d="M6 7l1 13h10l1-13" />
      <path d="M10 11v5M14 11v5" />
    </>
  ),
  download: (
    <>
      <path d="M12 3v12m-5-5 5 5 5-5" />
      <path d="M4 21h16" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3c2.5 2.5 4 5.5 4 9s-1.5 6.5-4 9c-2.5-2.5-4-5.5-4-9s1.5-6.5 4-9z" />
    </>
  ),
  check: <path d="m5 13 4 4L19 7" />,
}

export function Icon({ name, className = 'h-5 w-5' }: { name: IconName; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`${className} shrink-0 ${name === 'chevron' ? 'rtl:rotate-180' : ''}`}
      aria-hidden="true"
    >
      {PATHS[name]}
    </svg>
  )
}

/* ---------- empty state ---------- */

export function EmptyState({ icon, text }: { icon: IconName; text: string }) {
  return (
    <div className="flex flex-col items-center gap-2 py-8 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-3xl bg-slate-100 p-3.5 text-ink-soft/70">
        <Icon name={icon} className="h-full w-full" />
      </span>
      <p className="text-sm font-bold text-ink-soft">{text}</p>
    </div>
  )
}

/* ---------- modal ---------- */

export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
}) {
  const { t } = useI18n()
  if (!open) return null
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-navy/40 backdrop-blur-[2px] sm:items-center"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div className="card w-full max-w-md p-5 pb-6" onClick={(e) => e.stopPropagation()}>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-base font-extrabold text-ink">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('common.close')}
            className="tap rounded-full bg-slate-100 p-3 text-ink-soft"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
