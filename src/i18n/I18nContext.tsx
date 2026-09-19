import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { translate, type Lang } from './engine'

// fa keeps Persian digits/wording but a Gregorian calendar so formatted month/day
// labels always match the Gregorian grid rendered by the calendar screen.
const LOCALES: Record<Lang, string> = { fa: 'fa-IR-u-ca-gregory', de: 'de-DE', en: 'en-GB' }
const STORAGE_KEY = 'finello_lang'

type Vars = Record<string, string | number>

interface I18n {
  lang: Lang
  dir: 'rtl' | 'ltr'
  setLang: (l: Lang) => void
  t: (key: string, vars?: Vars) => string
  fmt: {
    currency: (n: number) => string
    date: (d: Date) => string
    month: (d: Date) => string
    weekday: (d: Date) => string
    /** Locale digits (Persian numerals for fa) — use for every visible bare number. */
    num: (n: number | string) => string
  }
}

const I18nContext = createContext<I18n | null>(null)

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as Lang | null
    return saved && saved in LOCALES ? saved : 'fa'
  })

  const setLang = (l: Lang) => {
    localStorage.setItem(STORAGE_KEY, l)
    setLangState(l)
  }

  const dir = lang === 'fa' ? 'rtl' : 'ltr'

  useEffect(() => {
    document.documentElement.lang = lang
    document.documentElement.dir = dir
  }, [lang, dir])

  const value = useMemo<I18n>(() => {
    const locale = LOCALES[lang]
    return {
      lang,
      dir,
      setLang,
      t: (key, vars) => translate(lang, key, vars),
      fmt: {
        currency: (n) =>
          new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: 'EUR',
            maximumFractionDigits: 0,
          }).format(n),
        date: (d) => new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short' }).format(d),
        month: (d) => new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(d),
        weekday: (d) => new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(d),
        num: (n) => new Intl.NumberFormat(locale, { useGrouping: false }).format(Number(n)),
      },
    }
  }, [lang, dir])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components -- canonical context+hook pair; splitting would disable fast refresh for every consumer
export function useI18n(): I18n {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used inside I18nProvider')
  return ctx
}

export type { Lang }
