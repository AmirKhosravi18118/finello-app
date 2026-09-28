# فعال‌سازی اتصال بانکی واقعی — نسخه یک‌کلیکی (چیزی برای «ساخت لینک» لازم نیست)

## فقط ۴ Secret در گیت‌هاب + یک کلیک
1. **کلیدهای رایگان بانک**: ob.nordigen.com → ثبت‌نام → User Secrets → کپی `Secret ID` و `Secret Key`
2. **توکن کلادفلر**: dash.cloudflare.com → My Profile → API Tokens → قالب «Edit Cloudflare Workers» → کپی توکن + `Account ID` (از صفحه Workers)
3. در همین ریپو (finello) → **Settings → Secrets and variables → Actions → New repository secret** — هر ۴ مورد:
   - `GC_SECRET_ID`
   - `GC_SECRET_KEY`
   - `CLOUDFLARE_API_TOKEN`
   - `CLOUDFLARE_ACCOUNT_ID`
4. تب **Actions** → «Deploy bank proxy (Cloudflare Worker)» → **Run workflow**
5. در لاگ، آدرس Worker چاپ می‌شود: `https://finello-bank-proxy.<subdomain>.workers.dev/api/gocardless`
6. **Settings → Secrets and variables → Actions → Variables** → دو Variable:
   - `VITE_BANK_API` = همان آدرس بالا
   - `VITE_GC_ENABLED` = `1`
7. تب Actions → «CI» را دوباره Run کنید (یا push کوچک) — **بانک واقعی لایو می‌شود** ✅

## امنیت
- رازها فقط در Secrets گیت‌هاب/کلادفلر — هرگز در کد اپ نیستند.
- Worker با CORS قفل روی دامنه + Rate-Limit (Daten schützen).
- پرداخت از حساب بانکی‌ات توسط GoCardless انجام می‌شود (PSD2 رسمی).

## اگر کلادفلر را نمی‌خواهی
همان Worker را روی سرور Oracle خودت اجرا کن: `node workers/gocardless-proxy.js` پشت Caddy — متغیرها داخل سند فایل هستند.
