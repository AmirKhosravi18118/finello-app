import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { I18nProvider } from './i18n/I18nContext'
import App from './App'
import './index.css'
import { registerServiceWorker } from './notifications/reminders'
import { initTheme } from './theme/theme'

initTheme()

/** ZERO-KILOMETER migration (v2026-10): run once per install — purge every
 *  legacy fake/demo dataset so every existing user lands on a clean slate. */
try {
  if (localStorage.getItem('finello_zero_km') !== '1') {
    for (const key of ['finello_demo_data', 'finello_banks', 'finello_bank', 'finello_bank_tx']) {
      localStorage.removeItem(key)
    }
    localStorage.setItem('finello_zero_km', '1')
  }
} catch {
  // storage unavailable — nothing to purge
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <I18nProvider>
      <App />
    </I18nProvider>
  </StrictMode>,
)

// PWA: service worker for notifications (+ future offline caching)
void registerServiceWorker()
