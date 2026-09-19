/** Light/dark theme (WP11). Class-based: html.dark flips token overrides in index.css. */

export type Theme = 'light' | 'dark'

const KEY = 'finello_theme'

export function getTheme(): Theme {
  return localStorage.getItem(KEY) === 'dark' ? 'dark' : 'light'
}

export function applyTheme(t: Theme) {
  document.documentElement.classList.toggle('dark', t === 'dark')
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', t === 'dark' ? '#0b111d' : '#101726')
}

export function setTheme(t: Theme) {
  localStorage.setItem(KEY, t)
  applyTheme(t)
}

/** Apply persisted theme before first paint (called from main.tsx). */
export function initTheme() {
  applyTheme(getTheme())
}
