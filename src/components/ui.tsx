import type { HTMLAttributes, ReactNode } from 'react'
import { useI18n } from '../i18n/I18nContext'

/* ---------- layout primitives ---------- */

export function Card(props: HTMLAttributes<HTMLDivElement>) {
  const { className = '', ...rest } = props
  return <div className={`card p-5 ${className}`} {...rest} />
}

/* ---------- atoms ---------- */

export type Tone = 'success' | 'warn' | 'danger' | 'neutral'

const TONE_CLASS: Record<Tone, string> = {
  success: 'bg-primary-soft text-primary-deep',
  warn: 'bg-amber-soft text-amber-600',
  danger: 'bg-danger-soft text-danger',
  neutral: 'bg-chip text-ink-soft',
}

export function Badge({ tone, children }: { tone: Tone; children: ReactNode }) {
  return <span className={`badge ${TONE_CLASS[tone]}`}>{children}</span>
}

/** Tinted 40px icon chip (DESIGN_SYSTEM_V2 §1 spacing scale). */
export function IconChip({ icon, tone = 'neutral' }: { icon: IconName; tone?: Tone }) {
  return (
    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${TONE_CLASS[tone]}`}>
      <Icon name={icon} className="h-5 w-5" />
    </span>
  )
}

/* ---------- sticky page header (v3 §4: bottom hairline, optional below-row) ---------- */

/** Sticky blurred page header: small overline above the 20px title, optional
 *  subtitle, trailing text/icon action, optional demo badge (home only) and an
 *  optional `below` row (e.g. sticky filter chips) inside the hairline frame.
 *  t()-free by design — callers pass ready strings. */
export function AppHeader({
  overline,
  title,
  subtitle,
  trailing,
  badge,
  below,
}: {
  overline: string
  title: string
  subtitle?: string
  trailing?: ReactNode
  badge?: string
  below?: ReactNode
}) {
  return (
    <div className="sticky top-0 z-30 -mx-5 border-b border-line bg-canvas/85 px-5 pb-3 pt-2 backdrop-blur-md">
      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="eyebrow">{overline}</p>
          <div className="mt-0.5 flex items-center gap-2">
            <h1 className="text-[20px] font-extrabold leading-tight text-ink">{title}</h1>
            {badge && <Badge tone="warn">{badge}</Badge>}
          </div>
          {subtitle && <p className="t-caption mt-0.5">{subtitle}</p>}
        </div>
        {trailing && <div className="flex shrink-0 items-center gap-2">{trailing}</div>}
      </div>
      {below && <div className="mt-3">{below}</div>}
    </div>
  )
}

/* ---------- skeletons (DESIGN_SYSTEM_V2 §2) ---------- */

export function Skeleton({ className = '' }: { className?: string }) {
  return <div aria-hidden="true" className={`skeleton rounded-2xl ${className}`} />
}

/** List-row placeholder: icon chip + two lines + trailing amount. */
export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`card p-5 ${className}`}>
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10" />
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <Skeleton className="h-3.5 w-2/5" />
          <Skeleton className="h-3 w-1/4" />
        </div>
        <Skeleton className="h-4 w-14" />
      </div>
    </div>
  )
}

/** Two-tile stats placeholder for the 2-column StatTile grid. */
export function SkeletonStats() {
  return (
    <div className="grid grid-cols-2 gap-3">
      <Skeleton className="h-32 rounded-[24px]" />
      <Skeleton className="h-32 rounded-[24px]" />
    </div>
  )
}

/* ---------- section header (v3 §1: 15px/700 section titles) ---------- */

export function SectionHeader({
  icon,
  title,
  action,
  tone = 'neutral',
}: {
  icon: IconName
  title: string
  action?: ReactNode
  tone?: Tone
}) {
  return (
    <div className="mb-2 flex items-center justify-between gap-2">
      <div className="flex min-w-0 items-center gap-2.5">
        <IconChip icon={icon} tone={tone} />
        <h2 className="t-section min-w-0 text-ink">{title}</h2>
      </div>
      {action}
    </div>
  )
}

/* ---------- progress ring (DESIGN_SYSTEM_V2 §2) ---------- */

export function ProgressRing({ value, size = 44, label }: { value: number; size?: number; label?: string }) {
  const pct = Math.min(1, Math.max(0, value))
  const r = (size - 6) / 2
  const c = 2 * Math.PI * r
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      role="progressbar"
      aria-valuenow={Math.round(pct * 100)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      className="-rotate-90"
    >
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth="5" className="stroke-chip" />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        strokeWidth="5"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={c * (1 - pct)}
        className="stroke-primary transition-[stroke-dashoffset] duration-500"
      />
    </svg>
  )
}

/* ---------- stat tile (v3 §4: icon chip top, big value, delta arrow) ---------- */

export interface StatDelta {
  dir: 'up' | 'down'
  text: string
  tone?: 'success' | 'danger' | 'neutral'
}

export function StatTile({
  label,
  value,
  sub,
  tone = 'default',
  icon,
  progress,
  progressLabel,
  delta,
  className = '',
}: {
  label: string
  value: string
  sub?: string
  tone?: 'default' | 'success' | 'warn' | 'danger'
  icon: IconName
  /** 0..1 — renders a small ProgressRing next to the icon chip. */
  progress?: number
  progressLabel?: string
  /** Optional comparison row with a direction arrow under the value. */
  delta?: StatDelta
  className?: string
}) {
  const valueColor =
    tone === 'success'
      ? 'text-primary-deep'
      : tone === 'warn'
        ? 'text-amber-600'
        : tone === 'danger'
          ? 'text-danger'
          : 'text-ink'
  const chipTone: Tone = tone === 'default' ? 'neutral' : tone
  const deltaColor =
    delta?.tone === 'danger'
      ? 'text-danger'
      : delta?.tone === 'success'
        ? 'text-primary-deep'
        : 'text-ink-soft'
  return (
    <div className={`card flex flex-col gap-3 p-4 ${className}`}>
      <div className="flex items-center justify-between gap-2">
        <IconChip icon={icon} tone={chipTone} />
        {progress !== undefined && <ProgressRing value={progress} size={40} label={progressLabel ?? label} />}
      </div>
      <div className="min-w-0">
        <p className="t-caption">{label}</p>
        <p className={`num mt-0.5 text-[20px] font-extrabold leading-[1.1] ${valueColor}`}>{value}</p>
        {delta && (
          <p className={`mt-1 flex items-center gap-1 text-[11px] font-bold ${deltaColor}`}>
            <Icon name={delta.dir} className="h-3 w-3" />
            <span className="min-w-0">{delta.text}</span>
          </p>
        )}
        {sub && <p className="t-caption mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

export function ProgressBar({ value, label }: { value: number; label?: string }) {
  const pct = Math.round(Math.min(1, Math.max(0, value)) * 100)
  return (
    <div
      className="h-2 w-full overflow-hidden rounded-full bg-chip"
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

/** Selectable chip (v3 §4: min 48px height for primary selectors). */
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
      className={`tap flex min-h-12 shrink-0 items-center justify-center rounded-full px-4 py-2 text-xs font-bold ${
        active ? 'bg-navy text-white shadow-md' : 'border border-line bg-surface text-ink-soft'
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

/* ---------- empty state (v3 §4: stacked icon + title + hint) ---------- */

export function EmptyState({
  icon,
  text,
  hint,
  tone = 'neutral',
  action,
}: {
  icon: IconName
  text: string
  hint?: string
  tone?: Tone
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center gap-2 py-8 text-center">
      <span className={`flex h-14 w-14 items-center justify-center rounded-3xl p-3.5 ${TONE_CLASS[tone]}`}>
        <Icon name={icon} className="h-full w-full" />
      </span>
      <p className="text-sm font-bold text-ink">{text}</p>
      {hint && <p className="t-caption max-w-64">{hint}</p>}
      {action}
    </div>
  )
}

/* ---------- donut chart (v3 §4: 18px ring, rounded caps, center stack) ---------- */

export function DonutChart({
  segments,
  size = 160,
  centerLabel,
  centerValue,
}: {
  segments: Array<{ color: string; value: number }>
  size?: number
  centerLabel?: string
  centerValue?: string
}) {
  const total = segments.reduce((s, x) => s + x.value, 0) || 1
  const r = size / 2 - 12
  const c = 2 * Math.PI * r
  let offset = 0
  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--color-chip)" strokeWidth="18" />
        {segments.map((seg, i) => {
          const len = (seg.value / total) * c
          const el = (
            <circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke={seg.color}
              strokeWidth="18"
              strokeDasharray={`${Math.max(0, len - 2)} ${c - Math.max(0, len - 2)}`}
              strokeDashoffset={-offset}
              strokeLinecap="round"
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
            />
          )
          offset += len
          return el
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        {centerValue && (
          <p className="num text-[15px] font-extrabold leading-[1.1] text-ink">{centerValue}</p>
        )}
        {centerLabel && (
          <p className="mt-0.5 max-w-20 text-[10px] font-bold uppercase tracking-[0.08em] text-ink-soft">
            {centerLabel}
          </p>
        )}
      </div>
    </div>
  )
}

/* ---------- modal / bottom sheet (v3 §5: rounded-t-[28px] + grabber handle) ---------- */

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
      className="backdrop-in fixed inset-0 z-50 flex items-end justify-center bg-navy/40 backdrop-blur-[2px] sm:items-center"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="sheet-in w-full max-w-md rounded-t-[28px] border border-line bg-surface p-5 pb-6 shadow-card sm:rounded-[24px]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="grabber mb-3 sm:hidden" aria-hidden="true" />
        <div className="mb-3 flex items-center justify-between">
          <h3 className="min-w-0 text-base font-extrabold text-ink">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('common.close')}
            className="tap rounded-full bg-chip p-3 text-ink-soft"
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
