import { useRef, useState, type ReactNode } from 'react'

/** SwipeRow (WP31): drag a row horizontally to reveal Edit/Delete behind.
 *  Vertical scroll is preserved (gesture claimed only when clearly horizontal).
 *  RTL: drag direction semantics auto-mirror because positions use start/end. */
export function SwipeRow({
  children,
  onEdit,
  onDelete,
}: {
  children: ReactNode
  onEdit: () => void
  onDelete?: () => void
}) {
  const [dx, setDx] = useState(0)
  const [claimed, setClaimed] = useState(false)
  const start = useRef({ x: 0, y: 0 })
  const MAX = 136

  const onDown = (e: React.PointerEvent) => {
    start.current = { x: e.clientX, y: e.clientY }
    setClaimed(false)
  }
  const onMove = (e: React.PointerEvent) => {
    const ddx = e.clientX - start.current.x
    const ddy = e.clientY - start.current.y
    if (!claimed) {
      if (Math.abs(ddx) > Math.abs(ddy) && Math.abs(ddx) > 8) setClaimed(true)
      else return
    }
    setDx(Math.max(-MAX, Math.min(MAX, ddx)))
  }
  const onUp = () => {
    if (claimed) setDx(Math.abs(dx) > 96 ? (dx > 0 ? MAX : -MAX) : 0)
  }

  const open = Math.abs(dx) > 90
  return (
    <div className="relative overflow-hidden rounded-2xl">
      {/* actions behind */}
      <div className="absolute inset-y-0 end-0 flex">
        <button
          type="button"
          onClick={() => {
            onEdit()
            setDx(0)
          }}
          className="tap flex w-[68px] items-center justify-center bg-amber-soft text-amber-800"
          aria-label="edit"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <path d="M17 3l4 4L8 20l-5 1 1-5L17 3z" />
          </svg>
        </button>
        {onDelete && (
          <button
            type="button"
            onClick={() => {
              onDelete()
              setDx(0)
            }}
            className="tap flex w-[68px] items-center justify-center bg-danger-soft text-danger"
            aria-label="delete"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />
            </svg>
          </button>
        )}
      </div>

      {/* front content — slides with the drag */}
      <div
        onPointerDown={onDown}
        onPointerMove={claimed ? onMove : undefined}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        onClick={() => open && setDx(0)}
        style={{ transform: `translateX(${dx}px)`, transition: claimed ? 'none' : 'transform .25s ease' }}
        className="relative bg-surface"
      >
        {children}
      </div>
    </div>
  )
}
