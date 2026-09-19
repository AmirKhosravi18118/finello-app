import { allPayments } from '../data/paymentsView'

/** Real notification support (WP10): SW-backed display + a once-a-day app-open
 *  check for overdue/upcoming payments inside the user's reminder window. */

const SW_PATH = 'sw.js'
const LAST_CHECK_KEY = 'finello_notified_on'

export function notificationsSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window && 'serviceWorker' in navigator
}

export type PermState = 'granted' | 'denied' | 'default' | 'unsupported'

export function permissionState(): PermState {
  if (!notificationsSupported()) return 'unsupported'
  return Notification.permission
}

export async function registerServiceWorker(): Promise<boolean> {
  if (!notificationsSupported()) return false
  try {
    await navigator.serviceWorker.register(SW_PATH, { scope: './' })
    return true
  } catch {
    return false
  }
}

/** Ask for permission (must be called from a user gesture). */
export async function requestPermission(): Promise<PermState> {
  if (!notificationsSupported()) return 'unsupported'
  try {
    return (await Notification.requestPermission()) as PermState
  } catch {
    return 'denied'
  }
}

async function show(title: string, body: string): Promise<boolean> {
  if (permissionState() !== 'granted') return false
  try {
    const reg = await navigator.serviceWorker.getRegistration()
    if (reg) {
      await reg.showNotification(title, { body, icon: 'icon.svg', badge: 'icon.svg', tag: title + body })
      return true
    }
    new Notification(title, { body, icon: 'icon.svg' })
    return true
  } catch {
    return false
  }
}

export async function sendTestNotification(): Promise<boolean> {
  return show('Finello', '🔔 ' + new Date().toLocaleTimeString())
}

/** Once per calendar day: notify overdue + payments due within `windowDays`.
 *  Returns how many notifications were shown (0 when already run today/blocked). */
export async function runDailyReminders(windowDays: number): Promise<number> {
  if (permissionState() !== 'granted') return 0
  const today = new Date().toISOString().slice(0, 10)
  if (localStorage.getItem(LAST_CHECK_KEY) === today) return 0

  const todayNum = new Date().getDate()
  const relevant = allPayments().filter((p) => {
    const diff = p.dayOfMonth - todayNum
    return p.status === 'overdue' || diff === 0 || (diff > 0 && diff <= windowDays)
  })
  if (relevant.length === 0) {
    localStorage.setItem(LAST_CHECK_KEY, today)
    return 0
  }

  let shown = 0
  for (const p of relevant.slice(0, 3)) {
    const diff = p.dayOfMonth - todayNum
    const when = p.status === 'overdue' ? '⚠️' : diff === 0 ? '📌' : `⏳ ${diff}`
    const ok = await show(`Finello — ${p.title}`, `${when} · ${p.recipient} · ${p.amount} EUR`)
    if (ok) shown++
  }
  localStorage.setItem(LAST_CHECK_KEY, today)
  return shown
}
