import { useEffect, useState, type JSX } from 'react'
import type { TabId } from './data/demo'
import { AppShell } from './components/AppShell'
import { AuthScreen } from './auth/AuthScreen'
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

  if (!onboarded) {
    return (
      <AuthScreen
        onDone={() => {
          setOnboarded(true)
        }}
      />
    )
  }

  const Screen = SCREENS[tab]
  return (
    <AppShell tab={tab} onTab={changeTab}>
      <Screen />
    </AppShell>
  )
}
