/** Local account store (no backend yet): name/email/PIN on this device only. */

export interface AccountSetup {
  marital: string
  occupation: string
  hours: number
  km: number
}

export interface Account {
  name: string
  email: string
  pin?: string
  createdAt: string
  setup?: AccountSetup
}

const KEY = 'finello_account'

export function getAccount(): Account | null {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as Account) : null
  } catch {
    return null
  }
}

export function saveAccount(a: Account) {
  localStorage.setItem(KEY, JSON.stringify(a))
}

export const ACCOUNT_EVENT = 'finello:account'

/** Profile shown across the app — user's own data first, demo only as fallback. */
export function userProfile(): { name: string; email: string; status: string } {
  const a = getAccount()
  if (a) {
    const status =
      a.setup?.occupation === 'werkstudent'
        ? 'Werkstudent'
        : a.setup?.occupation === 'job'
          ? 'Vollzeit/Teilzeit'
          : a.setup?.occupation === 'student'
            ? 'Student:in'
            : a.setup?.occupation || '—'
    return { name: a.name, email: a.email || '—', status }
  }
  return { name: '👋', email: '—', status: '—' }
}
