# WP1 — بنیان Finello

Status: done | delivered in bootstrap commit (CI green, run 35440348780) | ایجنت مرکزی

## T101 — i18n: موتور سه‌زبانه + RTL
Status: done | Files: `app/src/i18n/{engine.ts,engine.test.ts,I18nContext.tsx}`, `app/src/i18n/locales/{fa,de,en}.json`
Spec: طبق CONTRACT §2–§3. resolve نقطه‌ای، فالبک fa→en→key، interpolate `{var}`. تست الزامی: resolve عمیق، فالبک، interpolate، کلید غایب، هر سه locale دارای مجموعه کلید یکسان (تست هم‌ارزی کلیدهای fa/de/en با en).
Verify: `cd app && npm run test && npm run typecheck && npm run build`
Out of scope:localeهای بعدی (ar/tr/…)، ICU plural.

## T102 — UI: توکن‌ها + کیت UI + دیتای دمو
Status: done | Files: `app/src/index.css`, `app/src/components/ui.tsx`, `app/src/data/demo.ts`
Spec: CONTRACT §1، §4، §6. دیتای دمو الزامات شمارشی CONTRACT (overdue≥1، today≥1، tx بدون دسته≥3، خرج ماه قبل≥8…). آیکون‌ها SVG اینلاین فقط از لیست IconName.
Verify: مشترک §7.
Out of scope: تم تاریک، انیمیشن پیچیده.

## T103 — شل: ناوبری، هدر، آنبوردینگ
Status: done | Files: `app/src/{main.tsx,App.tsx}`, `app/src/components/{AppShell.tsx,BottomNav.tsx}`, `app/src/screens/OnboardingScreen.tsx`
Spec: CONTRACT §5. آنبوردینگ فقط بار اول (localStorage `finello_onboarded`) = انتخاب زبان ۳ کارت + دکمه ادامه. صفحه settings از هدر قابل دسترس؛ تب فعلی به‌همراه زبان در localStorage ماندگار (`finello_tab`).
Verify: مشترک §7.
Out of scope: مسیریابی URL (react-router در MVP).
