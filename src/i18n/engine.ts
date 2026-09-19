import fa from './locales/fa.json'
import de from './locales/de.json'
import en from './locales/en.json'

export type Lang = 'fa' | 'de' | 'en'
export type Bundle = Record<string, unknown>

export const BUNDLES: Record<Lang, Bundle> = { fa, de, en }

/** Resolve a dot-separated key against a nested bundle; returns undefined when absent. */
export function resolve(bundle: Bundle, key: string): string | undefined {
  let node: unknown = bundle
  for (const part of key.split('.')) {
    if (node && typeof node === 'object' && part in (node as Bundle)) {
      node = (node as Bundle)[part]
    } else {
      return undefined
    }
  }
  return typeof node === 'string' ? node : undefined
}

/** Translate with lang → en → key fallback and `{var}` interpolation. */
export function translate(lang: Lang, key: string, vars?: Record<string, string | number>): string {
  let s = resolve(BUNDLES[lang], key) ?? resolve(BUNDLES.en, key) ?? key
  if (vars) {
    for (const [k, v] of Object.entries(vars)) s = s.replaceAll(`{${k}}`, String(v))
  }
  return s
}

/** Flat set of leaf keys in a bundle (for the three-locale parity test). */
export function leafKeys(bundle: Bundle, prefix = ''): Set<string> {
  const keys = new Set<string>()
  for (const [k, v] of Object.entries(bundle)) {
    const path = prefix ? `${prefix}.${k}` : k
    if (v && typeof v === 'object') union(keys, leafKeys(v as Bundle, path))
    else keys.add(path)
  }
  return keys
}

function union(target: Set<string>, extra: Set<string>) {
  for (const k of extra) target.add(k)
}
