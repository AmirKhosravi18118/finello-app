# WP5 — مرکز اعلان + ویرایش ردیف‌ها + پرداخت نقدی (نیازمندی مالک، ۲۰۲۶-۰۹-۱۹)

## T501 — همه‌در‌یک
Status: done (PR #17) | Files: `app/src/data/{editStore.ts,editStore.test.ts}`, `app/src/components/{NotificationCenter.tsx,EditEntrySheet.tsx}`, `app/src/components/AppShell.tsx`, `app/src/screens/{HomeScreen.tsx,TransactionsScreen.tsx,ExpensesScreen.tsx}`, `app/src/App.tsx`, `app/src/i18n/locales/*`, `docs/CONTRACT.md`
Goal: نوتیف از آیکون زنگ باز شود؛ تپ ردیف تراکنش/خرج → شیت ویرایش؛ ثبت پرداخت نقدی؛ ماندگاری ویرایش‌ها/نقدی‌ها در localStorage.
Spec:
- `editStore.ts` (Storage تزریقی، پیش‌فرض globalThis.localStorage):
  - `finello_edits`: { [id]: {name?,amount?,date?,categoryId?} | 'DELETED' } — getTxEdits/saveTxEdit/deleteTxEntry/applyEdits(list)
  - `finello_cash_tx`: Tx[] (source=manual) — getCashTx/addCashTx/removeCashTx
  - شمارنده بدون‌دسته باید ویرایش‌ها/نقدی‌ها را ببیند → `uncategorizedTotal` به bankConnection می‌ماند اما مقدار = demo null + imported + cash null − ویرایش‌شده به دسته.
- `NotificationCenter.tsx`: شیت پایین از زنگ هدر — ردیف «N بدون دسته» (CTA به تراکنش‌ها)، معوق‌ها، قسط‌های در/N روز آینده (N = finello_notify_days)، حالت all-clear. بنر خانه حذف و prop onNavigate حذف (App یکدست).
- `EditEntrySheet.tsx` (generic): فیلدهای عنوان/مبلغ/تاریخ + چیپ دسته (با گزینه «—» = null) + ذخیره/حذف(اختیاری)/انصراف.
- TransactionsScreen: ادغام demo+imported+cash با applyEdits؛ تپ ردیف → شیت (ذخیره=saveTxEdit، حذف: cash→removeCashTx، غیر آن→tombstone)؛ دکمه «ثبت پرداخت نقدی» (btn-primary + hand) → شیت افزودن (categoryId اختیاری).
- ExpensesScreen: تپ ردیف → همان شیت → ویرایش در finello_edits.
- کلیدهای جدید: notif.{title,allGood,dueIn,overdueN} | cash.{add,title} | common.{edit,delete,title} | tx.{edit,name,date} | exp.edit
Verify: نردبان کامل + تست editStore (شیم Map، ادغام ویرایش/حذف/نقدی).
Out of scope: ویرایش قسط‌های تقویم (WP6)، نوتیف سیستمی، خروجی CSV.
