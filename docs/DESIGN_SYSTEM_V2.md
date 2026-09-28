# DESIGN SYSTEM 2.0 — Finello «Edition Pro» (WP12)

زبان طراحی: فین‌تک موبایل کلاس جهانی (الهام از الگوهای Revolut/N26/Gradient — ریتم عمودی، هدرهای به‌جا، سلسله‌مراتب سه‌لول، شیشه‌ای ظریف). این سند قرارداد اجرای ایجنت UI/UX است.

## 1) توکن‌های پایه (index.css)
- **رادیوس**: کارت 28px (rounded-[28px])، بلوک داخلی 20px، اینپوت 20px، چیپ full.
- **سایه‌ها (دولایه)**: `shadow-[0_1px_2px_rgba(16,23,38,0.04),0_16px_40px_-16px_rgba(16,23,38,0.16)]` برای کارت‌ها؛ FAB: `0_12px_28px_-8px_rgba(16,185,129,0.55)`.
- **گرادیان هویت**: `linear-gradient(135deg,#0E1B2C 0%,#123B2F 60%,#0F5132 100%)` — فقط کارت هیرو و آنبوردینگ.
- **تینت‌های وضعیت**: success/warn/danger با 12% تینت سطح + متن تیره/روشن هر تم (توکن‌های soft موجود).
- **اسپیسینگ**: صفحه `px-5 pt-2`، فاصله سکشن‌ها `gap-5`، داخل کارت `p-5`، ردیف‌ها `py-3`، آیکون‌چیپ 40px (rounded-2xl).
- **تایپوگرافی**: display 28px/extrabold/-0.02em (فقط هیرو)؛ title 20px/extrabold؛ section 13px/bold + overline 10px uppercase tracking-[0.12em] text-ink-soft؛ body 14px؛ caption 12px؛ اعداد `.num`.
- **موشن**: ورود سکشن‌ها `screen-in` (موجود)؛ skeleton shimmer 1.6s؛ press `active:scale-[0.97]`؛ duration 200–300ms ease-out. reduced-motion: انیمیشن‌ها خاموش.

## 2) کامپوننت‌های جدید کیت (ui.tsx)
- `AppHeader({ overline, title, subtitle?, trailing? })` — هدر چسبان هر صفحه (استیکی، backdrop-blur، بج دمو فقط خانه): overline کوچک بالای title، trailing اکشن متنی/آیکونی. لوگوی برند فقط در Home (هدر برند فعلی می‌ماند) و آنبوردینگ.
- `Skeleton({ className })` — `animate-pulse rounded-2xl bg-chip`؛ ترکیب `SkeletonCard` برای لیست‌ها و `SkeletonStats` برای آمار.
- `SectionHeader({ icon, title, action? })` — آیکون‌چیپ تینت‌شده + عنوان 13px bold + اکشن.
- `StatTile({ label, value, tone, icon })` — کاشی آمار با آیکون‌چیپ و مقدار بزرگ؛ نسخه گرید ۲تایی.
- `ProgressRing({ value, size })` — حلقه پس‌انداز SVG (جایگزین نوار در کارت پس‌انداز خانه).
- `EmptyState` (موجود) — ارتقا: تینت چرخه‌ای + دکمه اکشن اختیاری.

## 3) چیدمان صفحه‌به‌صفحه
- **Home**: هدر برند (موجود، پالیش) → **هیرو گرادیان** (سلام + تراز ماه بزرگ سفید + دو چیپ درآمد/خرج نیمه‌شفاف سفید 14% + دکمه + درآمد) → ردیف ۲ StatTile (حقوق شمارش با ProgressRing کوچک، پس‌انداز با ProgressRing) → پرداخت‌های نزدیک (SectionHeader + ردیف‌ها با آیکون‌چیپ دسته) → دکمه اکشن‌ها (افزودن قسط/درآمد). FAB حذف می‌شود (اکشن‌ها در هیرو/سکشن‌ها).
- **Calendar**: AppHeader(overline: ماه، title: تقویم، trailing: دکمه +) → نوار روز (کارت چسبان، اسکرول) → گرید (کارت) → پنل روز → خالی‌ها با EmptyState.
- **Expenses**: AppHeader(title: خرج‌ها، trailing: دکمه +) → هیرو عددی (جمع ماه با caption مقایسه) → کارت چارت (SectionHeader + legend) → چیپ‌ها → مقایسه ماه قبل (ردیف‌های delta) → لیست.
- **Transactions**: AppHeader(title: تراکنش‌ها، trailing: فیلتر آیکونی) → فیلتر بانک (چیپ‌ها) → ۳ StatTile گرید → دو دکمه درآمد/خرج + دریافت بانک → لیست با بج بانک.
- **Tax**: AppHeader(title: مالیات، trailing: دکمه ویزارد) → کارت ویزارد/خلاصه → چیپ سال → پروفایل → قابل‌کذرها → readiness.
- **Settings**: AppHeader(title: تنظیمات) → گروه‌ها (موجود) + گروه نمایش/تور (نمایش دوباره تور).
- **Onboarding**: هیرو گرادیان تمام‌عرض بالا (لوگو + عنوان)، کارت‌های زبان با فلگ متنی، انیمیشن ورود پله‌ای.

## 4) قواعد سفت
- فقط کلاس‌های توکنی (surface/line/chip/ink/…) — dark mode باید بدون استثنا کار کند. RTL منطقی. متن فقط با t(). بدون وابستگی جدید. لیست فایل‌های مجاز: index.css، ui.tsx، هر ۷+۱ صفحه، AddPaymentFab/AddMoneySheet/EditPaymentSheet/EditEntrySheet/NotificationCenter/BottomNav/AppShell/TaxWizard. locales و editStore/bankConnection دست‌نخورده.
- Verify: `cd app && npm run format:check && npm run lint && npm run typecheck && npm run test && npm run build`

## 5) افزوده مالک (وسط اجرا — الزامی)
- **Calendar day-strip**: نوار روز → نوار ۷روزه متمرکز روی روزِ انتخابی (پیش‌فرض امروز): ۳ روز قبل + روز انتخابی وسط + ۳ روز بعد؛ هر خانه = نام روز کوچک (fmt.weekday) بالای عدد بزرگ؛ خانه مرکزی هیرو (گرادیان hero-gradient، متن سفید، سایه) در هر دو تم؛ تپ روی روز → بازمرکزش + پنل پایین عوض می‌شود.
- **BottomNav Pro**: دکمه + مرکزی برجسته (دایره گرادیانی primary + سایه سبز، کمی بالاتر از نوار) → منوی دراپ‌آپ پایین (Modal): سه اکشن آیکون‌گرد — qa.expense (→ تب تراکنش‌ها + AddMoneySheet خرج)، qa.payment (→ خانه + شیت قسط)، qa.income (→ تراکنش‌ها + AddMoneySheet درآمد)؛ کلیدهای qa.* آماده‌اند. آیتم‌های دیگر ناوبری: اندیکاتور فعال = قرص تینت primary/15 + آیکون primary؛ فاصله‌ها/ارتفاع حرفه‌ای؛ blur موجود.
- **+ FAB صفحه‌ای حذف** (اکشن از منوی مرکزی) — منطق مودال AddPaymentFab در Home می‌ماند.
