import { useState } from 'react'
import { useI18n } from '../i18n/I18nContext'
import { legalDoc, type LegalDocKey } from '../legal/legalContent'

/** Full-screen legal document sheet (Impressum / Datenschutz / AGB). */
export function LegalSheet({ docKey, onClose }: { docKey: LegalDocKey | null; onClose: () => void }) {
  const { lang } = useI18n()
  if (!docKey) return null
  const doc = legalDoc(lang, docKey)

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-navy/50 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
    >
      <div className="flex max-h-[92dvh] w-full max-w-md flex-col overflow-hidden rounded-t-[28px] border border-line bg-surface shadow-card">
        <div className="grabber mt-3" aria-hidden="true" />
        <div className="flex items-center justify-between px-5 py-3">
          <h2 className="min-w-0 text-base font-extrabold text-ink">{doc.title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="close"
            className="tap flex h-11 w-11 items-center justify-center rounded-full bg-chip text-ink-soft"
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
        <div className="overflow-y-auto px-5 py-4">
          {doc.sections.map((sec) => (
            <section key={sec.heading} className="mb-4">
              <h3 className="mb-1.5 text-sm font-extrabold text-ink">{sec.heading}</h3>
              {sec.paragraphs.map((p, i) => (
                <p key={i} className="mb-2 text-[13px] leading-relaxed text-ink-soft" dir="auto">
                  {p}
                </p>
              ))}
            </section>
          ))}
          <p className="mb-2 text-[11px] text-ink-soft">© {new Date().getFullYear()} Finello</p>
        </div>
      </div>
    </div>
  )
}

export function useLegalState() {
  return useState<LegalDocKey | null>(null)
}
