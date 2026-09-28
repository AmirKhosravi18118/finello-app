# EXECUTION — تفکیک بسته‌های کاری Finello

قالب اسپک هر تسک (فشرده‌شده طبق CONTRIBUTING؛ در فاز پروتوتایپ اسپک‌ها سکشنِ فایل چتر WP هستند):

```markdown
## T### — <area>: <یک‌خطی>
Status: draft|ready|done | Depends: T### | PR n of WP#
Goal: یک جمله.
Files (create/modify ONLY these): ...
Spec: قرارداد دقیق رفتار/امضا + موارد تست الزامی.
Verify: <دستورات؛ خروجی در PR پیست شود>.
Out of scope: ...
```

## نقشه WP‌ها
- **WP1 بنیان** (پایه‌گذاری: i18n، توکن‌ها، کیت UI، دیتای دمو، شل، آنبوردینگ) — T101, T102, T103
- **WP2 صفحات** (۶ صفحه با دیتای دمو؛ ۳ ایجنت موازی، فایل‌های disjoint) — T201, T202, T203
- **WP3 دانش و کیفیت** (دانش مالیاتی آلمان، بازبینی QA/PM) — T301, T302

## تقسیم فایل‌ها (نقشه تعارض — هم‌پوشانی ممنوع)
| تسک | فایل‌ها |
|---|---|
| T101 | app/src/i18n/{engine.ts,engine.test.ts,I18nContext.tsx}, app/src/i18n/locales/{fa,de,en}.json |
| T102 | app/src/index.css, app/src/components/ui.tsx, app/src/data/demo.ts |
| T103 | app/src/{main.tsx,App.tsx}, app/src/components/{AppShell.tsx,BottomNav.tsx}, app/src/screens/OnboardingScreen.tsx |
| T201 | app/src/screens/{HomeScreen.tsx,CalendarScreen.tsx} |
| T202 | app/src/screens/{ExpensesScreen.tsx,TransactionsScreen.tsx} |
| T203 | app/src/screens/{TaxScreen.tsx,SettingsScreen.tsx} |
| T301 | docs/TAX_KNOWLEDGE_DE.md |
| T302 | docs/QA_REPORT.md (فقط خواندن بقیه) |
