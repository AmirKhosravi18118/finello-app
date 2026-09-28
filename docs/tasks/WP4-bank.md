# WP4 — اتصال بانکی + نوتیف دسته‌بندی (نیازمندی مالک، ۲۰۲۶-۰۹-۱۹)

## T401 — Bank adapter + nudge
Status: done (PR #14) | Files: `app/src/bank/{bankProvider.ts,bankProvider.test.ts,bankConnection.ts}`, `app/src/screens/{SettingsScreen.tsx,TransactionsScreen.tsx,HomeScreen.tsx}`, `app/src/components/AppShell.tsx`, `app/src/App.tsx`, `app/src/i18n/locales/{fa,de,en}.json`, `docs/CONTRACT.md`
Goal: تجربه کامل «هر پرداخت بانکی → تراکنش‌ها» با Provider قابل‌تعویض (الان mock) + بنر/بج «N تراکنش بدون دسته» با پرش مستقیم.
Spec:
- `BankProvider` (adapter): `listBanks()` + `importTransactions(bankId, sinceDays)`؛ پیاده‌سازی mock = ردیف‌های دمو معتبر (مبلغ منفی، ISO date). `activeBankProvider` نقطه تعویض PSD2 واقعی (V2).
- اتصال: localStorage `finello_bank`؛ تراکنش‌های واردشده: `finello_bank_tx` (سقف ۵۰).
- تنظیمات: گروه «بانک» → مودال انتخاب بانک (اسم‌های واقعی DE) + رضایت mock → اتصال/قطع.
- تراکنش‌ها: ادغام ردیف‌های واردشده (source=bank، بدون دسته)؛ دکمه دریافت از بانک؛ خلاصه زنده.
- خانه: بنر هشداری وقتی بدون‌دسته>0 با CTA → تب تراکنش‌ها (prop جدید onNavigate). زنگ هدر: بج تعداد.
- کلیدهای جدید: set.{bankGroup,connectBank,connectedBank,disconnect,bankConsent} | tx.{importBank,importedNew} | home.{uncategorizedNudge,categorizeNow}
Verify: نردبان کامل §7 CONTRACT + تست واحد adapter (شکل ردیف‌ها/سقف/لیست بانک‌ها).
Out of scope: PSD2 واقعی، refresh خودکار زمان‌بندی‌شده، multi-account.
