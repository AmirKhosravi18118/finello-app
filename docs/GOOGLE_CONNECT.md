# Google Connections — فعال‌سازی (مالک، ۱۰ دقیقه)

اپ حالا «اتصال گوگل» + بکاپ خصوصی Drive + خروجی ایمیلی دارد. برای روشن شدن فقط یک Client-ID لازم است:

## مراحل
1. https://console.cloud.google.com → پروژه جدید (مثلاً finello)
2. **APIs & Services → Library** → «Google Drive API» → Enable
3. **OAuth consent screen**: External → نام Finello + ایمیل → Save (Publishing: Testing کافی است)
4. **Credentials → Create OAuth client ID → Web application**:
   - Authorized JavaScript origins:
     - `https://finello.nelurio.com`
     - `https://amirkhosravi18118.github.io`
   - Authorized redirect URIs:
     - `https://finello.nelurio.com/` (بدون مسیر اضافه)
     - `https://amirkhosravi18118.github.io/finello-app/`
5. Client ID را کپی → ریپو finello → Secrets and variables → Actions → **Variable**:
   - `VITE_GOOGLE_CLIENT_ID` = `<CLIENT_ID>`
6. Actions → «CI» → Re-run (یا push کوچک) → **اتصال گوگل لایو می‌شود** ✅

## چیزی که کاربر می‌بیند
تنظیمات ▸ Verbindungen ▸ «Mit Google verbinden» → پنجره گوگل → اجازه → بج «متصل: email». دکمه «Jetzt sichern» → بکاپ JSON خصوصی در پوشه appDataFolder درایو (فقط خود اپ به آن دسترسی دارد). داده مالی هرگز به سرور ما نمی‌رود — مستقیم به درایو کاربر.

## ایمیل
دکمه «Export per E-Mail» خروجی کامل تراکنش‌ها را با mailto: به خود کاربر می‌دهد (بدون سرور).
