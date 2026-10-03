import { useRef, useState, type ReactNode } from 'react'
import { Icon, type IconName } from './ui'

export interface SwipeAction {
  icon: IconName
  label: string
  tone: 'danger' | 'primary' | 'success'
  onTrigger: () => void
}

/** SwipeRow v2 (Atria spec): RTL-aware snap thresholds, direction lock,
 *  full-width tone actions with icon+label, vertical-scroll safe. */
export function SwipeRow({
  children,
  leadingAction,
  trailingAction,
  onClick,
  className = '',
  onEdit,
  editLabel,
  onDelete,
  deleteLabel,
}: {
  children: ReactNode
  leadingAction?: SwipeAction
  trailingAction?: SwipeAction
  onClick?: () => void
  className?: string
  onEdit?: () => void
  editLabel?: string
  onDelete?: () => void
  deleteLabel?: string
}) {
  const lead: SwipeAction | undefined =
    leadingAction ??
    (onEdit ? { icon: 'check', label: editLabel ?? 'OK', tone: 'success', onTrigger: onEdit } : undefined)
  const trail: SwipeAction | undefined =
    trailingAction ??
    (onDelete ? { icon: 'trash', label: deleteLabel ?? '✕', tone: 'danger', onTrigger: onDelete } : undefined)
  const [tx, setTx] = useState(0)
  const [dragging, setDragging] = useState(false)
  const start = useRef({ x: 0, y: 0 })
  const lockDir = useRef<'h' | 'v' | null>(null)
  const isRTL = document.documentElement.dir === 'rtl'

  const onPointerDown = (e: React.PointerEvent) => {
    start.current = { x: e.clientX, y: e.clientY }
    lockDir.current = null
    setDragging(true)
  }

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging) return
    const dx = e.clientX - start.current.x
    const dy = e.clientY - start.current.y
    if (lockDir.current === null) {
      if (Math.abs(dx) > 8 || Math.abs(dy) > 8) {
        lockDir.current = Math.abs(dx) > Math.abs(dy) ? 'h' : 'v'
      } else return
    }
    if (lockDir.current === 'v') return
    e.preventDefault()
    const max = 120
    setTx(Math.abs(dx) > max ? Math.sign(dx) * max : dx)
  }

  const trigger = (a: SwipeAction) => {
    setTx(0)
    a.onTrigger()
  }

  const onPointerUp = () => {
    if (!dragging) return
    setDragging(false)
    const th = 60
    if ((tx <= -th && !isRTL) || (tx >= th && isRTL)) {
      if (trailingAction) trigger(trailingAction)
      else setTx(0)
    } else if ((tx >= th && !isRTL) || (tx <= -th && isRTL)) {
      if (leadingAction) trigger(leadingAction)
      else setTx(0)
    } else {
      setTx(0)
    }
  }

  const actionBtn = (a: SwipeAction, side: 'start' | 'end') => (
    <div
      className={`absolute inset-y-0 ${side}-0 flex w-full items-center justify-center ${
        a.tone === 'danger' ? 'bg-danger' : a.tone === 'success' ? 'bg-primary' : 'bg-chip'
      }`}
    >
      <button
        type="button"
        aria-label={a.label}
        onClick={() => trigger(a)}
        className={`flex h-full w-full items-center justify-center gap-2 ${
          a.tone === 'danger' || a.tone === 'success' ? 'text-white' : 'text-ink'
        }`}
      >
        <Icon name={a.icon} className="h-5 w-5" />
        <span className="text-xs font-bold">{a.label}</span>
      </button>
    </div>
  )

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {trail && actionBtn(trail, 'end')}
      {lead && actionBtn(lead, 'start')}
      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        onClick={onClick}
        className="relative z-10 bg-surface"
        style={{
          transform: `translateX(${tx}px)`,
          transition: dragging ? 'none' : 'transform 200ms cubic-bezier(0.22, 1, 0.36, 1)',
          touchAction: 'pan-y',
        }}
      >
        {children}
      </div>
    </div>
  )
}
