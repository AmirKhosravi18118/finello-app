# AUDIT_DESIGN — بازرسی کامل طراحی فینلو (T2801)

هدف: لایو `amirkhosravi18118.github.io/finello-app` + سورس `app/src` — ویوپورت ۳۹۰×۸۴۴ (بررسی ۳۶۰ و ۷۶۸).
روش: grep سورس‌سطح (سایز فونت/رادیوس/رنگ) + محاسبه عددی کنتراست WCAG از توکن‌های واقعی + تأیید تطابق باندل لایو (assets/index-DQqIt7BZ.js و index-BGsCCoN0.css شامل همان کلاس‌ها/توکن‌ها).
⚠️ اتوماسیون مرورگر در دسترس نبود (۲ تلاش: «Browser is not available in subagent») → ممیزی سورس‌سطح + باندل لایو؛ اعداد کنتراست از مقادیر hex واقعی توکن‌ها محاسبه شده‌اند.

## امتیاز کل: ۶۷/۱۰۰
| بُعد | امتیاز |
|---|---|
| تایپوگرافی | ۱۶/۲۵ |
| رنگ/کنتراست | ۱۴/۲۵ |
| دکمه‌ها/لمس | ۱۹/۲۵ |
| چیدمان/سازگاری | ۱۸/۲۵ |

نقاط قوت: دارک‌تم کاملاً منطبق AA (تمام جفت‌های اندازه‌گیری‌شده ۵٫۶۹–۱۳٫۵۱)، مقیاس t-* منظم، tabular-nums روی همه مبالغ، ریتم px-5/gap-5/p-5، رادیوس ۲۴px کارت و ۲۸px شیت، تارگت‌های ناوبری ۴۴px+.

## یافته‌های اندازه‌گیری‌شده

| # | صفحه/مؤلفه | تم/زبان | نوع | شرح (اندازه/نسبت) | شدت | فیکس دقیق |
|---|---|---|---|---|---|---|
| 1 | BottomNav.tsx:136-140 | لایت/همه | کنتراست | لیبل فعال 10px + آیکون `text-primary` #10b981 روی canvas #f2f4f9 = **2.31:1** (نیاز 4.5/3.0) — ناوبری اصلی! | CRIT | `text-[#047857]` برای لیبل/آیکون فعال (کنتراست 5.3:1) |
| 2 | HomeScreen.tsx:119 | لایت/همه | کنتراست | بج کسری بودجه `text-danger` #dc2626 روی white/12 روی گرادیان #132e29 ≈ **2.07:1** | CRIT | روی هیرو از `text-[#fecaca]` استفاده شود |
| 3 | ui.tsx:17 (Badge warn) | لایت/همه | کنتراست | متن بج 10px `text-amber-600` #d97706 روی `bg-amber-soft` #fef3c7 = **2.86:1** | CRIT | `text-amber-800` #92400e (7.4:1) |
| 4 | Settings:192، Transactions:336/233، Auth:334 | لایت/همه | کنتراست | لینک‌ها/مبلغ ورودی `text-primary-deep` #059669 روی canvas = **3.42:1** و روی سطح سفید 3.77:1 (متن 12-14px) | HIGH | توکن جدید `--color-link: #047857` |
| 5 | index.css:119 (btn-primary) | لایت/همه | کنتراست | متن سفید 14px بولد روی گرادیان #059669 = **3.77:1** — CTA اصلی | HIGH | گرادیان `#047857→#065f46` (5.3:1) |
| 6 | HomeScreen.tsx:119 | لایت/همه | کنتراست | بج مازاد `text-primary` #10b981 روی white/12/گرادیان = **3.94:1** (متن 10px) | HIGH | `text-[#6ee7b7]` روی هیرو |
| 7 | ExpensesScreen.tsx:328 | هر دو/همه | تایپ | لیبل ماه SVG `text-[9px]` — زیر کف 10px مقیاس | HIGH | `text-[10px]` |
| 8 | ui.tsx:90 `.eyebrow` + Home:104/108 | فا | تایپ | `uppercase tracking-[0.12em]` روی متن فارسی (نام ماه، سلام، «فینلو») → فاصله‌گذاری اتصال حروف فارسی را می‌شکند | HIGH | `html[lang=fa] .eyebrow{letter-spacing:0}` و حذف tracking بج‌ها در فا |
| 9 | TaxScreen.tsx:187 | هر دو/همه | لمس | دکمه حذف 36×36px (`h-9 w-9`) < 44px | HIGH | `h-11 w-11` |
| 10 | AccountsScreen.tsx:139 | هر دو/همه | لمس | دکمه «قطع اتصال» فقط-متن 11px بدون padding/min-h ≈ 15px ارتفاع لمس | HIGH | `inline-flex min-h-11 items-center px-3` |
| 11 | AppShell + BottomNav | 768px | چیدمان | `pill-nav` با `inset-x-5` تمام‌عرض ویوپورت و FAB لبه صفحه، ولی محتوا `max-w-md` وسط‌چین → ناهم‌ترازی نوار/FAB با ستون محتوا | HIGH | nav را در کانتینر `mx-auto max-w-md` بپیچان (`inset-x-0 mx-auto w-full max-w-md`) |
| 12 | ۲۲ مورد: Home/Accounts/Settings/BottomNav/CategoryGrid/ui | هر دو/همه | تایپ | `text-[11px]` ×۲۲ — خارج از مقیاس مجاز (10/12/14/15)؛ پراکندگی واقعی مقیاس | MED | یکدست به `text-xs` (12px) یا `text-[10px]` |
| 13 | AuthScreen.tsx:332 | هر دو/همه | لمس | لینک «حساب دارید؟» بدون min-h ≈ 20px | MED | `inline-flex min-h-11 items-center` |
| 14 | ۱۰ مورد: CategoryGrid:32/70، Accounts:195، Tax:187، Calendar:173، Settings:221، Transactions:336/385 | هر دو/همه | رادیوس | `rounded-xl` (12px) مخلوط با سیستم 16px داخلی (`rounded-2xl`) | MED | یکدست `rounded-2xl` |
| 15 | AccountsScreen:195، TaxScreen:187 | هر دو/همه | آیکون‌چیپ | چیپ 36px (`h-9 w-9`) در برابر استاندارد IconChip 40px | MED | `h-10 w-10 rounded-2xl` با IconChip |
| 16 | LegalSheet.tsx:44 | هر دو/همه | تایپ | بدن حقوقی `text-[13px]` — سایز سرگردان | LOW | `text-sm` (14px) |
| 17 | Home:115، Accounts:85، Auth:87 | هر دو/همه | تایپ | اعداد هیرو `text-[30px]` و تیتر Auth `text-[24px]` — ناهم‌خوان با توکن `.t-display` (28px) | LOW | استفاده از `.t-display` |
| 18 | Settings ردیف‌ها `!p-4`/`min-h-14` | هر دو/همه | ریتم | کارت‌های تنظیمات p-4 در برابر استاندارد p-5 کارت | LOW | حفظ min-h-14 قابل قبول؛ مستند به‌عنوان استثنا |

## شمارش: CRIT=۳ | HIGH=۸ | MED=۴ | LOW=۳ (۱۸ ردیف اندازه‌گیری‌شده)

## سه فیکس اولویت‌دار
۱. سبزِ لایت‌تم: همه متن‌های `text-primary`/`text-primary-deep` (ناوبری فعال، لینک‌ها، مبالغ ورودی) → `#047857`؛ گرادیان btn-primary → `#047857→#065f46`.
۲. بج‌ها: warn → `text-amber-800` روی amber-soft؛ بج‌های هیرو → `#6ee7b7` (مازاد) / `#fecaca` (کسری).
۳. لمس و فا: `h-11 w-11` حذف Tax، `min-h-11` دکمه‌های متنی Accounts/Auth، و `letter-spacing:0` برای `.eyebrow`/`.badge` در `html[lang=fa]`.
