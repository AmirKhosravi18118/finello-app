# WP12/15 WIRING CHECKLIST — پس از بازگشت ایجنت UI (ترتیب الزامی)

## الف) سیم‌کشی من (فایل‌های می‌ after-agent)
1. **App.tsx**: گیت اکانت — اگر `getAccount()===null && !onboarded` → `<AuthScreen onDone/>` جای OnboardingScreen (زبان داخل Auth انتخاب می‌شود)؛ رندر `<Tour />` در ریشه AppShell.
2. **SettingsScreen**: گروه «نمایش»: ردیف «نمایش دوباره تور» → `requestTour()`؛ گروه «داده نمونه»: SelectPill روشن/خاموش → `localStorage finello_demo_data` + `location.reload()`؛ گروه «درباره»: نمایش وِرژن/لایسنس موجود بماند.
3. **SettingsScreen بانک**: اگر `isLive()` → از `useLiveBankCatalog()` برای catalog + دکمه دریافت از بانک → `importLiveTransactions()` (async؛ ردیف‌ها بعد از fetch ظاهر می‌شوند) + بج live/demo کنار عنوان گروه بانک.
4. **AuthScreen**: گام بانک در حالت live → `gocardlessProvider.startConsent(bankId, location.origin+location.pathname+'?live=1&bank='+bankId)` → باز شدن لینک رضایت بانک؛ redirect-back handler موجود است (`?live=1`).
5. برنده Demo badge در تنظیمات فقط وقتی mock فعال است.

## ب) گیت‌ها و انتشار
- `cd app && npm run format:check && lint && typecheck && test && build` → سبز
- برنچ `feat/wp12-edition-pro` (همه: ریدیزاین + ادندم + Auth + تور + دمو + گوکاردلس) → PR #37 → CI → مرج
- سینک آینه → دپلوی → curl 200 + sw.js

## ج) تست بصری (مرورگر، هر دو تم)
- Auth کامل (ساخت→۴سؤال→بانک→ورود با PIN)؛ تور ۶مرحله + نمایش دوباره؛ نوار ۷روزه تقویم (امروز وسط/گرادیان/نام روز)؛ منوی + دراپ‌آپ (۳اکشن→تب درست)؛ اسکلتون‌ها؛ دارک/لایت؛ ۳ زبان؛ عکس برای مالک.

## د) سپس WP13 (ایجنت QA موبایل با ۵ پرسونا از PERSONAS.md) → رفع → WP14 گزارش نهایی + کاتالوگ.
