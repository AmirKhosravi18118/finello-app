# فعال‌سازی Push واقعی (نوتیف وقتی اپ بسته است) — WP29

## چه چیزی ساخته شد
- `server/push-server.js` — سرور Push کوچک (Node + web-push، بدون دیتابیس) روی سرور Oracle خودتان
- سرویس‌ورکر اپ حالا `push` را می‌گیرد؛ کلیک → باز شدن Finello
- تنظیمات ▸ اعلان‌ها: دکمه فعال‌سازی → subscribe + ثبت یادآورها؛ هوم خودش لیست پرداخت‌های ۳۰روز آینده را به سرور می‌دهد (فقط عنوان + روز — GDPR-minimal)

## فعال‌سازی (۳۰ دقیقه، یک‌بار)

### ۱) کلیدهای VAPID (روی همین سیستم ساخته شده — دوباره بسازید و امن نگه دارید)
```bash
cd D:/Z.Ai/RatenReminder && npx web-push generate-vapid-keys
```
دو مقدار Public/Private را ذخیره کنید (در git نیستند).

### ۲) سرور Push روی Oracle VPS
```bash
mkdir -p /opt/finello-push && cd /opt/finello-push
# دو فایل server/push-server.js و server/package.json را آپلود کنید
npm install --omit=dev
VAPID_PUBLIC_KEY=<Public> VAPID_PRIVATE_KEY=<Private> \
ADMIN_TOKEN=<یک رمز دلخواه> PORT=8787 \
nohup node push-server.js > push.log 2>&1 &
```
(بهتر: systemd unit مثل بانک.)

### ۳) Caddy
```
push.your-domain.de {
  reverse_proxy localhost:8787
}
```

### ۴) اتصال اپ
ریپو finello → Secrets and variables → Actions → **Variable**:
```
VITE_PUSH_API = https://push.your-domain.de
```
Actions → «CI» → Re-run (یا push کوچک) → اپ دوباره دپلوی می‌شود.

### ۵) تست
اپ را باز کنید → تنظیمات ▸ اعلان‌ها → «فعال‌سازی» → اجازه → نوتیف خوش‌آمد می‌آید. اپ را ببندید → «ارسال نوتیف آزمایشی» → نوتیف سیستم می‌آید ✅

## جریان نوتیف‌ها
- قسط/پرداخت نزدیک (پنجره ۱/۳/۷ روز تنظیمات) → سرور روزَش push می‌زند حتی با اپ بسته
- تراکنش جدید بانکی → نوتیف دسته‌بندی (نیازمند بانک لایو — DEPLOY_BANK_LIVE.md)
- بدون ارسال مبلغ/نام بانک به سرور (فقط عنوان و روز — GDPR)
