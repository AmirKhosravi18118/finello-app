import { useState, type JSX } from 'react'
import type { TabId } from './data/demo'
import { AppShell } from './components/AppShell'
import { OnboardingScreen } from './screens/OnboardingScreen'
import { HomeScreen } from './screens/HomeScreen'
import { CalendarScreen } from './screens/CalendarScreen'
import { ExpensesScreen } from './screens/ExpensesScreen'
import { TransactionsScreen } from './screens/TransactionsScreen'
import { TaxScreen } from './screens/TaxScreen'
import { SettingsScreen } from './screens/SettingsScreen'

const SCREENS: Record<TabId, () => JSX.Element> = {
  home: HomeScreen,
  calendar: CalendarScreen,
  expenses: ExpensesScreen,
  transactions: TransactionsScreen,
  tax: TaxScreen,
  settings: SettingsScreen,
}

const ONBOARD_KEY = 'finello_onboarded'
const TAB_KEY = 'finello_tab'

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

  if (!onboarded) {
    return (
      <OnboardingScreen
        onDone={() => {
          localStorage.setItem(ONBOARD_KEY, '1')
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
