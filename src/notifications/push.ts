/** Web Push client (WP29): subscribes to the owner's push server so reminders
 *  arrive even when the app is CLOSED. Requires VITE_PUSH_API (HTTPS server).
 *  Local-first: only a random uid + browser push keys leave the device —
 *  never names, amounts or banks. */

const PUSH_API = (import.meta.env.VITE_PUSH_API as string | undefined) ?? ''
const UID_KEY = 'finello_push_uid'

function urlB64ToUint8Array(b64: string): Uint8Array {
  const pad = '='.repeat((4 - (b64.length % 4)) % 4)
  const base64 = (b64 + pad).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(base64)
  return Uint8Array.from(raw, (c) => c.charCodeAt(0))
}

export function pushConfigured(): boolean {
  return !!PUSH_API
}

function uid(): string {
  let id = localStorage.getItem(UID_KEY)
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem(UID_KEY, id)
  }
  return id
}

/** Ask permission + subscribe + register on the push server. Returns the
 *  Notification permission result. Throws on network errors (caller informs). */
export async function enablePush(): Promise<'granted' | 'denied' | 'default' | 'unsupported'> {
  if (!('Notification' in window) || !('serviceWorker' in navigator)) return 'unsupported'
  const permission = (await Notification.requestPermission()) as NotificationPermission
  if (permission !== 'granted') return permission
  const reg = await navigator.serviceWorker.getRegistration()
  if (!reg) return 'default'
  const sub = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlB64ToUint8Array(await getVapidPublicKey()),
  })
  await fetch(`${PUSH_API}/subscribe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ uid: uid(), subscription: sub.toJSON() }),
  })
  return 'granted'
}

/** Register the upcoming payments (title + due date only) with the server so
 *  its daily cron can wake the user even when the app is closed. */
export async function registerReminders(
  items: Array<{ title: string; body: string; when: string }>,
): Promise<void> {
  if (!pushConfigured()) return
  try {
    await fetch(`${PUSH_API}/reminders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uid: uid(), items }),
    })
  } catch {
    // offline: retried next enable/save
  }
}

export async function unsubscribePush(): Promise<void> {
  if (!pushConfigured()) return
  try {
    const reg = await navigator.serviceWorker.getRegistration()
    await reg?.pushManager.getSubscription()
    await fetch(`${PUSH_API}/unsubscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uid: uid() }),
    })
  } catch {
    // best-effort
  }
}

async function getVapidPublicKey(): Promise<string> {
  const res = await fetch(`${PUSH_API}/vapid`)
  const data = (await res.json()) as { publicKey: string }
  return data.publicKey
}
