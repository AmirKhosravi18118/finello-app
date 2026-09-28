# WP2 — صفحات Finello (۳ ایجنت موازی، فایل‌های disjoint)

Status: done | PRs #9 #10 #11 merged (CI green) | نقشه تعارض: docs/EXECUTION.md | مبنا: CONTRACT.md (لوکِیل‌ها و کیت UI **بسته** هستند — فقط مصرف شوند)

## T201 — Home + Calendar (done: PR #9)
Status: done (PR #9) | Files: `app/src/screens/{HomeScreen.tsx,CalendarScreen.tsx}`
Spec: هوم = خوش‌آمد + شمارش معکوس حقوق (demo.salaryDay) + ۳ قسط نزدیک با Badge وضعیت + کارت پس‌انداز با ProgressBar + مودال افزودن قسط (فیلدهای CONTRACT home.*). تقویم = گرید ماه ۷ستونه (شروع هفته: شنبه fa / دوشنبه de-en)، نقطه رنگی روزهای پرداخت، تپ روز → پنل قسط‌های همان روز + نوار افقی انتخاب روز. حالت empty هر دو.
Verify: مشترک CONTRACT §7.
Out of scope: ذخیره‌سازی قسط جدید (فقط UI-state).

## T202 — Expenses + Transactions (done: PR #10)
Status: done (PR #10) | Files: `app/src/screens/{ExpensesScreen.tsx,TransactionsScreen.tsx}`
Spec: خرج‌ها = جمع ماه + چارت میله‌ای SVG بر اساس BY_CATEGORY + چیپ دسته‌ها + لیست ماه + کارت مقایسه با ماه قبل (درصد ± به تفکیک، آیکون up/down). تراکنش‌ها = کارت خلاصه (تعداد/بدون‌دسته/جمع ماه) + لیست با نشان source (bank/manual) + منوی تخصیص دسته برای categoryId=null + دکمه importCsv فقط UI. حالت empty هر دو.
Verify: مشترک §7.
Out of scope: افزودن خرج جدید، ایمپورت واقعی CSV.

## T203 — Tax + Settings (done: PR #11)
Status: done (PR #11) | Files: `app/src/screens/{TaxScreen.tsx,SettingsScreen.tsx}`
Spec: مالیات = چیپ سال (۲۰۲۴/۲۰۲۵/۲۰۲۶) + کارت پروفایل (taxClass/employment) + لیست deductibleهای آن سال + جمع + دکمه افزودن (مودال: category/amount/note/date) + کارت «آماده اظهارنامه: X ردیف، Y€» + Disclaimer (tax.disclaimer). تنظیمات = گروه‌های CONTRACT set.* با آیتم آیکون‌دار + سوییچر زبان فعّال (setLang) + کلیدهای ۱/۳/۷ روز + wipeData با تایید. حالت empty.
Verify: مشترک §7.
Out of scope: ذخیره‌سازی واقعی تنظیمات، تولید فایل اظهارنامه.
