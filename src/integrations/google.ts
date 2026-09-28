/** Google/Email connections (WP30): OAuth implicit flow for PWA.
 *  Google Drive backup (appDataFolder — private to the app) + export via email.
 *  Client-ID comes from VITE_GOOGLE_CLIENT_ID (owner sets it in Google Console,
 *  authorized origin = the live domain). Local-first stays: Drive is OPT-IN backup. */

const CLIENT_ID = (import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined) ?? ''
const SCOPES = 'https://www.googleapis.com/auth/drive.appdata'

export function googleConfigured(): boolean {
  return !!CLIENT_ID
}

export function googleAuthUrl(): string {
  const redirect = location.origin + location.pathname
  const nonce = crypto.randomUUID()
  sessionStorage.setItem('g_oauth_nonce', nonce)
  return (
    'https://accounts.google.com/o/oauth2/v2/auth' +
    `?client_id=${encodeURIComponent(CLIENT_ID)}` +
    `&redirect_uri=${encodeURIComponent(redirect)}` +
    '&response_type=token' +
    `&scope=${encodeURIComponent(SCOPES)}` +
    '&include_granted_scopes=true' +
    `&state=${encodeURIComponent(nonce)}`
  )
}

export interface GoogleSession {
  accessToken: string
  expiresAt: number
  email?: string
}

const GS_KEY = 'finello_google_session'

export function getGoogleSession(): GoogleSession | null {
  try {
    const raw = localStorage.getItem(GS_KEY)
    if (!raw) return null
    const s = JSON.parse(raw) as GoogleSession
    return s.expiresAt > Date.now() ? s : null
  } catch {
    return null
  }
}

/** Handle OAuth redirect: #access_token=...&state=... */
export async function consumeGoogleRedirect(): Promise<GoogleSession | null> {
  if (!location.hash.includes('access_token')) return null
  const p = new URLSearchParams(location.hash.slice(1))
  const token = p.get('access_token')
  const state = p.get('state')
  if (!token) return null
  history.replaceState(null, '', location.pathname + location.search)
  if (state && sessionStorage.getItem('g_oauth_nonce') !== state) return null
  sessionStorage.removeItem('g_oauth_nonce')

  let email: string | undefined
  try {
    const r = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (r.ok) email = ((await r.json()) as { email?: string }).email
  } catch {
    // email optional
  }
  const s: GoogleSession = { accessToken: token, expiresAt: Date.now() + 3600_000, email }
  localStorage.setItem(GS_KEY, JSON.stringify(s))
  return s
}

export function disconnectGoogle(): void {
  localStorage.removeItem(GS_KEY)
}

/** Backup the whole local dataset (JSON) to the app's private Drive folder. */
export async function backupToDrive(payload: string): Promise<boolean> {
  const s = getGoogleSession()
  if (!s) return false
  const meta = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${s.accessToken}`,
      'Content-Type': 'multipart/related; boundary=finello',
    },
    body:
      '--finello\r\nContent-Type: application/json\r\n\r\n{"name":"finello-backup.json","parents":["appDataFolder"]}\r\n--finello\r\nContent-Type: application/json\r\n\r\n' +
      payload +
      '\r\n--finello--',
  })
  return meta.ok
}
