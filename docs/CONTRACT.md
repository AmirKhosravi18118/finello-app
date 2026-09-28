# CONTRACT — Finello (منجمد پیش از پیاده‌سازی)

ایجنت‌های پیاده‌ساز فقط بر اساس این قرارداد کد می‌زنند؛ شکل/کلید جدید = توقف و پرسیدن روی issue.
تغییر این فایل فقط با PR تأییدشده مالک. نسخه: 1.0

## 1. دیتامدل (`app/src/data/demo.ts` — تنها منبع دیتای دمو)

```ts
export type TabId = 'home' | 'calendar' | 'expenses' | 'transactions' | 'tax' | 'settings'
export type PayStatus = 'upcoming' | 'today' | 'overdue' | 'paid'
export interface Payment  { id: string; title: string; amount: number; dayOfMonth: number; recipient: string; categoryId: CategoryId; status: PayStatus }
export interface Expense  { id: string; title: string; amount: number; date: string /*ISO*/; categoryId: CategoryId }
export interface Tx       { id: string; name: string; amount: number; date: string /*ISO*/; source: 'bank' | 'manual'; categoryId: CategoryId | null }
export type CategoryId = 'rent'|'groceries'|'transport'|'phone'|'insurance'|'subscription'|'leisure'|'study'|'health'|'other'|'income'
export interface Category { id: CategoryId; color: string /*hex*/ }
export interface Savings  { amount: number; goal: number }
export interface TaxItem  { id: string; category: string; amount: number; note: string; date: string; year: number }
export interface DemoData {
  user: { name: string; email: string; status: string }
  salaryDay: number        // 1..31 — روز ماه حقوق
  salaryAmount: number
  payments: Payment[]      // ≥5 شامل حداقل یک overdue و یک today
  expenses: Expense[]      // ≥8 در ماه جاری + ≥8 در ماه قبل (برای مقایسه)
  transactions: Tx[]       // ≥10؛ حداقل 3 مورد categoryId=null
  savings: Savings
  tax: { profile: { taxClass: 1|2|3|4|5|6; employment: string }; items: TaxItem[] } // ≥4 آیتم در سال جاری
}
export const CATEGORIES: Record<CategoryId, Category>
export const demo: DemoData
export const MONTH_TOTAL = (list: Expense[]) => number   // جمع مبالغ
export const BY_CATEGORY = (list: Expense[]) => Array<{ categoryId: CategoryId; total: number }> // نزولی
```

## 2. موتور i18n (`app/src/i18n/`)

```ts
// engine.ts — خالص و تست‌پذیر
export type Lang = 'fa' | 'de' | 'en'
export function translate(lang: Lang, key: string, vars?: Record<string, string | number>): string
// رفتار: resolve نقطه‌ای از باندل → فالبک به en → خودِ key؛ {var} جایگزین شود.
// I18nContext.tsx: useI18n() → { lang, dir, setLang, t, fmt:{currency,date,month,weekday} }
// ارز همیشه EUR با locale زبان. dir: fa→rtl، de/en→ltr. ماندگاری در localStorage کلید 'finello_lang'.
```

## 3. کلیدهای i18n (کامل و بسته — ایجنت‌ها فایل locale را لمس نمی‌زنند)

```
app.name = Finello
nav.{home,calendar,expenses,transactions,tax,settings}
status.{upcoming,today,overdue,paid}
common.{demo,add,cancel,save,close,total,all,empty,seeAll,notifications}
home.{greeting,salaryCountdown,daysToSalary,paydayToday,salaryDayOf,nextPayments,savings,savingsGoal,addPayment,emptyPayments,paymentTitle,amount,dayOfMonth,recipient,uncategorizedNudge,categorizeNow}
notif.{title,allGood,dueIn,overdueN} | cash.{add,title} | common.{edit,delete,title} | tx.{edit,name,date} | exp.edit
cal.{monthTitle,noPayments,paymentsOn}
exp.{monthTotal,byCategory,comparePrev,more,less,noChange,expensesList,emptyExpenses}
tx.{recent,summary,count,uncategorized,thisMonth,bank,manual,assignCategory,importCsv,importBank,importedNew,emptyTx}
tax.{year,profile,taxClass,employment,deductibles,addDeductible,readyForReturn,rows,disclaimer,emptyTax,category,amount,note,date}
set.{title,profileGroup,languageGroup,notifGroup,calendarGroup,bankGroup,connectBank,connectedBank,disconnect,bankConsent,privacyGroup,aboutGroup,name,email,status,notifyDays,syncCalendar,shareIcs,exportData,wipeData,wipeConfirm,version,license,aboutDisclaimer}
onb.{welcome,subtitle,chooseLang,continue}
cat.{rent,groceries,transport,phone,insurance,subscription,leisure,study,health,other,income}
```

## 4. کیت UI (`app/src/components/ui.tsx` — تنها صادرشده‌ها)

```ts
Card: (props: React.HTMLAttributes<HTMLDivElement>) => JSX      // کلاس .card
SectionTitle: { title: string; action?: ReactNode }
Badge: { tone: 'success'|'warn'|'danger'|'neutral'; children }
StatCard: { label: string; value: string; sub?: string; tone?: 'default'|'success'|'warn'|'danger' }
ProgressBar: { value: number /*0..1*/ }
Pill: { active?: boolean; children }                            // چیپ قابل انتخاب
Icon: { name: IconName; className?: string }
IconName = 'home'|'calendar'|'wallet'|'receipt'|'tax'|'settings'|'plus'|'chevron'|'bell'|'user'|'up'|'down'|'bank'|'hand'|'trash'|'download'|'globe'|'check'
Modal: { open: boolean; onClose: () => void; title: string; children }
```

## 5. شل و ناوبری (`app/src/components/AppShell.tsx`, `BottomNav.tsx`)

```ts
// BottomNav: pill تیره شناور (کلاس .pill-nav)، ۵ آیتم: home/calendar/expenses/transactions/tax
// + دکمه settings از آیکون چرخ‌دنده در هدر AppShell (سمت مخالف جهت خواندن).
// AppShell props: { tab: TabId; onTab: (t: TabId) => void; children }
// هدر: لوگوی متنی «Finello» + بج Demo (common.demo) + آیکون bell + آیکون settings.
// FAB شناور + (فقط در تب home/calendar) برای افزودن سریع قسط.
```

## 6. دیزاین‌توکن‌ها (منجمد — `app/src/index.css`)
- رنگ‌ها: `--color-primary #10B981`، `primary-deep #059669`، `ink #0E1B2C`، `ink-soft`، `navy #101726`، `danger #EF4444`، canvas گرادیان روشن.
- کارت: `rounded-3xl` سفید ۸۵٪ + blur + سایه نرم. فونت: Inter (de/en) / Vazirmatn (fa). اعداد همیشه `.num` (LTR embed).
- RTL: فقط کلاس‌های منطقی Tailwind (`ms- me- ps- pe- text-start`).

## 7. Verify مشترک همه تسک‌های کدی
```
cd app && npm run format:check && npm run lint && npm run typecheck && npm run test && npm run build
```
هر تسک خروجی واقعی این دستورات را در بدنه PR می‌آورد.

## 8. آداپتر بانکی (افزوده WP4 — `app/src/bank/`)
```ts
// bankProvider.ts — نقطه تعویض PSD2 واقعی در V2
BankProvider = { id: string; listBanks(): {id,name}[]; importTransactions(bankId, sinceDays): {id,name,amount,date}[] }
activeBankProvider: BankProvider  // فعلاً mockBankProvider
// bankConnection.ts — وضعیت مشترک
getConnectedBank/setConnectedBank (finello_bank) | getImportedTx/addImportedTx (finello_bank_tx، سقف ۵۰)
uncategorizedTotal(): number  // دمو null + واردشده‌ها
useBankConnection(): { connected, banks, imported, connect, disconnect, importNow(): number }
```
قاعده: صفحه‌ها هرگز مستقیم با بانک حرف نمی‌زنند؛ فقط از activeBankProvider/useBankConnection.

## 9. لایه ویرایش/نقدی (WP5 — `app/src/data/editStore.ts`)
```ts
EntryEdit = { name?, amount?, date?, categoryId? } — overlay روی ردیف‌های demo/imported (tombstone='DELETED')
getTxEdits/saveTxEdit/tombstoneTx/clearTxEdit/applyEdits<Tx>/applyExpenseEdits (name↔title)
getCashTx/addCashTx/removeCashTx (finello_cash_tx, source=manual)
uncategorizedCount(allTx) — با لحاظ ویرایش‌ها
```
UI: زنگ هدر → NotificationCenter (Modal)؛ تپ ردیف تراکنش/خرج → EditEntrySheet (generic).
