/** Real notification support (WP10): SW-backed display + a once-a-day app-open
 *  check for overdue/upcoming payments inside the user's reminder window. */

const SW_PATH = 'sw.js'
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

/** Notify about newly imported bank transactions (fires right after an import). */
export async function notifyNewTransactions(
  count: number,
  bankName: string,
  title: string,
  body: string,
): Promise<boolean> {
  if (count <= 0) return false
  return show(title, body.replace('{n}', String(count)).replace('{bank}', bankName))
}

export async function sendTestNotification(): Promise<boolean> {
  return show('Finello', '🔔 ' + new Date().toLocaleTimeString())
}
