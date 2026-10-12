import { useEffect, useState } from 'react'

/** Finello brand mark: "F" with an ascending middle arm and a coin at its tip —
 *  money moving up. Same construction as /icon.svg; keep both in sync. */
export function BrandMark({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 512 512" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="fin-brand-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#10b981" />
          <stop offset="1" stopColor="#047857" />
        </linearGradient>
      </defs>
      <rect width="512" height="512" rx="112" fill="url(#fin-brand-g)" />
      <rect x="168" y="116" width="58" height="280" rx="29" fill="#fff" />
      <rect x="168" y="116" width="182" height="58" rx="29" fill="#fff" />
      <g transform="rotate(-14 197 269)">
        <rect x="168" y="240" width="150" height="58" rx="29" fill="#fff" />
      </g>
      <circle cx="349" cy="231" r="37" fill="#fff" />
      <circle cx="349" cy="231" r="17" fill="url(#fin-brand-g)" />
    </svg>
  )
}

/** Boot splash (v5): mark pops in, indeterminate brand bar, fades out and unmounts.
 *  prefers-reduced-motion → short plain fade, no transforms. */
export function Splash() {
  const [phase, setPhase] = useState<'in' | 'out' | 'gone'>('in')
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const t1 = window.setTimeout(() => setPhase('out'), reduce ? 450 : 1150)
    const t2 = window.setTimeout(() => setPhase('gone'), reduce ? 750 : 1500)
    return () => {
      window.clearTimeout(t1)
      window.clearTimeout(t2)
    }
  }, [])
  if (phase === 'gone') return null
  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center gap-5 bg-canvas transition-opacity duration-300 ${
        phase === 'out' ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div className="fin-splash-mark">
        <BrandMark className="h-24 w-24 rounded-[22%] shadow-card" />
      </div>
      <p className="text-xl font-extrabold tracking-tight text-ink">Finello</p>
      <div className="h-1 w-32 overflow-hidden rounded-full bg-chip">
        <div className="fin-splash-bar h-full w-1/2 rounded-full bg-gradient-to-r from-primary to-primary-deep" />
      </div>
    </div>
  )
}
