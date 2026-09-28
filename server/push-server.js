/**
 * Finello Push Server — runs on the owner's Oracle VPS (or any Node host).
 * Zero-database: subscriptions in a JSON file. GDPR: stores ONLY the push
 * endpoint + Web-Push keys + a random uid — never names, amounts or banks.
 *
 * Setup (VPS):
 *   1) mkdir /opt/finello-push && upload push-server.js package.json
 *   2) cd /opt/finello-push && npm install --omit=dev
 *   3) env: VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, ADMIN_TOKEN, PORT=8787
 *      systemd unit: finello-push.service (Restart=always)
 *   4) Caddy: finello-push.your-domain.de → localhost:8787 (HTTPS required)
 *   5) App env: VITE_PUSH_API=https://finello-push.your-domain.de
 *
 * Endpoints:
 *   POST /subscribe    {uid, subscription}            (uid = random device id)
 *   POST /unsubscribe  {uid, endpoint}
 *   POST /reminders    {uid, items:[{title, body, when}]}   (registered by app)
 *   POST /send         {uid, title, body}             (admin, x-admin-token)
 *   POST /cron         {x-admin-token}                (systemd timer: send due reminders)
 *   GET  /vapid                                      → { publicKey }
 */

const express = require('express')
const webpush = require('web-push')
const fs = require('fs')
const path = require('path')

const PORT = process.env.PORT || 8787
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || ''
const STORE = path.join(__dirname, 'subscriptions.json')

const app = express()
app.use(express.json({ limit: '64kb' }))

if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails('mailto:[kontakt@ihre-domain.de]', process.env.VAPID_PUBLIC_KEY, process.env.VAPID_PRIVATE_KEY)
}

function load() {
  try { return JSON.parse(fs.readFileSync(STORE, 'utf8')) } catch { return {} }
}
function save(db) {
  fs.writeFileSync(STORE, JSON.stringify(db), { mode: 0o600 })
}
const ok = (res, data) => res.json({ ok: true, ...(data ? { data } : {}) })

app.post('/subscribe', (req, res) => {
  const { uid, subscription } = req.body || {}
  if (!uid || !subscription || !subscription.endpoint) return res.status(400).json({ ok: false })
  const db = load()
  db[uid] = db[uid] || {}
  db[uid].subscription = subscription
  db[uid].reminders = db[uid].reminders || []
  save(db)
  ok(res)
})

app.post('/unsubscribe', (req, res) => {
  const { uid, endpoint } = req.body || {}
  const db = load()
  if (db[uid]) {
    if (endpoint) db[uid].reminders = db[uid].reminders || []
    else delete db[uid]
    save(db)
  }
  ok(res)
})

/** App registers upcoming payments (title/day-ISO only — no amounts). */
app.post('/reminders', (req, res) => {
  const { uid, items } = req.body || {}
  const db = load()
  if (!db[uid]) db[uid] = { subscription: db[uid] && db[uid].subscription }
  if (!db[uid]) return res.status(404).json({ ok: false })
  db[uid].reminders = Array.isArray(items) ? items.slice(0, 20) : []
  save(db)
  ok(res)
})

async function pushTo(uid, title, body) {
  const db = load()
  const entry = db[uid]
  if (!entry || !entry.subscription) return false
  try {
    await webpush.sendNotification(entry.subscription, JSON.stringify({ title, body }), { TTL: 86400 })
    return true
  } catch (e) {
    if (e.statusCode === 404 || e.statusCode === 410) {
      delete db[uid]
      save(db)
    }
    return false
  }
}

/** Cron: send due payment reminders + uncategorized nudges. */
app.post('/cron', async (req, res) => {
  if (!ADMIN_TOKEN || req.headers['x-admin-token'] !== ADMIN_TOKEN)
    return res.status(403).json({ ok: false })
  const db = load()
  const today = new Date().toISOString().slice(0, 10)
  let sent = 0
  for (const [uid, entry] of Object.entries(db)) {
    for (const r of entry.reminders || []) {
      if (r.when === today) {
        if (await pushTo(uid, 'Finello — ' + r.title, r.body || r.title)) sent++
      }
    }
  }
  ok(res, { sent })
})

/** Admin/test: push to one uid. */
app.post('/send', async (req, res) => {
  if (req.headers['x-admin-token'] !== ADMIN_TOKEN) return res.status(403).json({ ok: false })
  const { uid, title, body } = req.body || {}
  const sent = uid ? await pushTo(uid, title || 'Finello', body || '') : false
  ok(res, { sent })
})

app.get('/vapid', (req, res) => ok(res, { publicKey: process.env.VAPID_PUBLIC_KEY }))

app.listen(PORT, () => console.log('Finello push server on :' + PORT))
