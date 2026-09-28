# گزارش QA — نمونه اولیه Finello

- **تاریخ:** 2026-09-19 — **داور:** T302 (QA/PM)
- **دامنه:** بازبینی محلی بدون کامیت/PR. قرارداد (§3 کلیدها، §6 دیزاین) + هر ۷ اسکرین + `ui/AppShell/BottomNav` + موتور i18n و هر ۳ locale + `App.tsx` و `demo.ts`. فقط خواندنی.

## خلاصه
شدت‌ها (۱=بحرانی، ۲=مهم، ۳=جزئی): **بحرانی ۰ | مهم ۳ | جزئی ۹ — جمع ۱۲ یافته**

تأیید سالم: هیچ کلید استفاده‌شده‌ای در هیچ locale غایب نیست؛ خلاف RTL صفر (grep روی ml/mr/pl/pr/left/right خالی؛ فقط کلاس‌های منطقی ms/me/ps/pe/start/end)؛ `toLocaleString` خام صفر؛ همه مبالغ با `fmt.currency` + `.num` و تاریخ‌ها با `fmt.*`؛ حالت خالی هر ۵ لیست (payments، expenses، transactions، آیتم مالیاتی، روز انتخابی تقویم) موجود؛ FAB و تاگل تنظیمات دارای `aria-label`.

## یافته‌ها

| فایل | مشکل | شدت | راه‌حل پیشنهادی |
|---|---|---|---|
| `components/ui.tsx:242` | دکمه بستن مودال فقط‌آیکونی بدون `aria-label` (کلید `common.close` موجود ولی بلااستفاده) و هدف لمسی ۳۲px (`p-2` + آیکون `h-4 w-4`) | ۲ | `aria-label` + `p-2.5` و آیکون `h-5 w-5` تا ≥44px شود |
| `SettingsScreen.tsx:44`، `TaxScreen.tsx:55`، `TransactionsScreen.tsx:92` | `onClick` روی `div/span` غیرتعاملی (`<div className="tap py-1.5" onClick=...>`) دور `Pill` که خودش `button` بی‌handler است → با کیبورد/ScreenReader غیرقابل فعال‌سازی | ۲ | انتقال `onClick` به خود `Pill` (افزودن prop به کیت) یا `role="button"` + `tabIndex={0}` + `onKeyDown` |
| `CalendarScreen.tsx:50,129` | در fa خروجی `fmt.month/fmt.date` با locale `fa-IR` به‌طور پیش‌فرض تقویم جلالی است ولی شبکه روزها میلادی است → عنوان ماه و «پرداخت‌های {date}» با شماره روزی که کاربر تپ کرده هم‌خوان نیست (خطای حدود ۸-۱۲ روز) | ۲ | در `I18nContext.tsx` برای fa از `fa-IR-u-ca-gregory` استفاده شود یا شبکه به جلالی تبدیل شود |
| `AppShell.tsx:31` | `aria-label="notifications"` رشته انگلیسی هاردکد، خارج از t() | ۳ | افزودن کلید (مثل `common.notifications`) به سه locale و استفاده از t() |
| `AppShell.tsx:30,40` | دکمه‌های bell/settings: `p-2.5` + آیکون `h-4.5` = ۳۸px < 44px | ۳ | `p-3` + آیکون `h-5 w-5` |
| `SettingsScreen.tsx:170` | دکمه shareIcs: `p-3` + آیکون `h-4 w-4` = ۴۰px < 44px | ۳ | `p-3.5` یا آیکون `h-5 w-5` |
| `components/ui.tsx:62-75` | `ProgressBar` دارای `role`/`aria-valuenow` ولی بدون `aria-valuemin/max` و نام دسترس‌پذیر | ۳ | افزودن `aria-valuemin={0} aria-valuemax={100}` + `aria-label` (مثلاً عنوان بخش پس‌انداز) |
| locales (fa/de/en) | ۹ کلید مرده: `common.close`، `common.all`، `common.seeAll`، `home.daysToSalary` (فقط در engine.test.ts)، `tx.summary`، `tx.bank`، `tx.manual`، `tax.year`، `tax.profile` — در UI صفر استفاده | ۳ | حذف از هر سه فایل یا اتصال به UI (close→مودال، bank/manual→برچسب منبع تراکنش) |
| `HomeScreen.tsx:32`، `SettingsScreen.tsx:100`، `TaxScreen.tsx:73` | رشته خام آلمانی دمو بدون t(): `{demo.user.status}` (Werkstudent) و `{demo.tax.profile.employment}` (Werkstudent 18h/Woche) در همه زبان‌ها | ۳ | ذخیره به‌صورت کلید i18n یا مقدار خنثی در `demo.ts` |
| `ExpensesScreen.tsx:62` | نمودار SVG با `aria-hidden="true"` و بدون جایگزین متنی؛ مقدار هر دسته فقط بصری در دسترس است | ۳ | `role="img"` + `aria-label` شامل جمع ماه، یا جدول sr-only |
| `CalendarScreen.tsx` | برخلاف قرارداد §5، FAB «افزودن سریع قسط» فقط در home هست (HomeScreen:86) و در تب calendar نیست | ۳ | انتقال FAB به AppShell مشروط به `tab === 'home' \|\| 'calendar'` |
| `ExpensesScreen.tsx:100-113` | `Pill` (چیپ «قابل انتخاب» طبق §4) بدون هیچ `onClick` رندر می‌شود؛ ظاهر تپ‌شدنی ولی بی‌اثر | ۳ | حذف ردیف چیپ‌های تکراری (legend همان اطلاعات را می‌دهد) یا فعال‌کردن فیلتر دسته |

## جمع‌بندی
**ارسال‌پذیر به‌عنوان نمونه اولیه؛ بدون بلاکر بحرانی** — اما ۳ یافته مهم (دسترسی کیبوری Pillها، دکمه بستن مودال، ناهماهنگی جلالی/میلادی در fa که زبان پیش‌فرض است) بهتر است پیش از دموی کاربردی رفع شوند.
