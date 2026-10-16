import { useEffect, useState, type JSX } from 'react'
import type { TabId } from './data/demo'
import { AppShell } from './components/AppShell'
import { AuthScreen } from './auth/AuthScreen'
import { consumeGoogleRedirect } from './integrations/google'
import { Splash } from './components/Brand'
import { connectLiveBank, importLiveTransactions } from './bank/bankConnection'
import { HomeScreen } from './screens/HomeScreen'
import { CalendarScreen } from './screens/CalendarScreen'
import { AnalysenScreen } from './screens/ExpensesScreen'
import { AccountsScreen } from './screens/AccountsScreen'
import { TransactionsScreen } from './screens/TransactionsScreen'
import { TaxScreen } from './screens/TaxScreen'
import { SettingsScreen } from './screens/SettingsScreen'

const SCREENS: Record<TabId, () => JSX.Element> = {
  home: HomeScreen,
  calendar: CalendarScreen,
  konten: AccountsScreen,
  analysen: AnalysenScreen,
  transactions: TransactionsScreen,
  tax: TaxScreen,
  settings: SettingsScreen,
}

const TAB_KEY = 'finello_tab'
const ONBOARD_KEY = 'finello_onboarded'

export default function App() {
  const [onboarded, setOnboarded] = useState(() => localStorage.getItem(ONBOARD_KEY) === '1')
  const [tab, setTab] = useState<TabId>(() => {
    // showcase support: /?tab=konten deep-links a specific tab (mockups/portfolio)
    const urlTab = new URLSearchParams(location.search).get('tab') as TabId | null
    if (urlTab && urlTab in SCREENS) return urlTab
    const saved = localStorage.getItem(TAB_KEY) as TabId | null
    return saved && saved in SCREENS ? saved : 'home'
  })

  const changeTab = (t: TabId) => {
    localStorage.setItem(TAB_KEY, t)
    setTab(t)
  }

  useEffect(() => {
    const handler = (e: Event) => changeTab((e as CustomEvent<TabId>).detail)
    window.addEventListener('finello:goto', handler)
    return () => window.removeEventListener('finello:goto', handler)
  }, [])

  // Google OAuth redirect (Drive backup) — consumes token if present
  useEffect(() => {
    void consumeGoogleRedirect()
  }, [])

  // PSD2 consent return (?live=1&bank=<id>&name=<display name>) — for every user
  useEffect(() => {
    const p = new URLSearchParams(location.search)
    if (p.get('live') === '1') {
      const id = p.get('bank') ?? 'live'
      connectLiveBank({ id, name: p.get('name') ?? id })
      history.replaceState(null, '', location.pathname)
      // refresh connected-bank lists immediately, then land the first pull
      window.dispatchEvent(new CustomEvent('finello:bank-imported', { detail: 0 }))
      void importLiveTransactions().then((n) =>
        window.dispatchEvent(new CustomEvent('finello:bank-imported', { detail: n })),
      )
    }
  }, [])

  if (!onboarded) {
    return (
      <>
        <AuthScreen
          onDone={() => {
            setOnboarded(true)
          }}
        />
        <Splash />
      </>
    )
  }

  const Screen = SCREENS[tab]
  return (
    <>
      <AppShell tab={tab} onTab={changeTab}>
        <Screen />
      </AppShell>
      <Splash />
    </>
  )
}
