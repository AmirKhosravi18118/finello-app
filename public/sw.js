/* Finello service worker — notification display + click focus.
   Scheduling itself happens app-side: a daily check on app open (HTTPS keeps
   SW + Notification API available; no push server needed at this stage). */

self.addEventListener('install', () => self.skipWaiting())

// Web Push (WP29): notifications arrive even when the app is closed
self.addEventListener('push', (event) => {
  let data = { title: 'Finello', body: '' }
  try {
    data = event.data ? event.data.json() : data
  } catch (e) {
    data.body = event.data ? event.data.text() : ''
  }
  event.waitUntil(
    self.registration.showNotification(data.title || 'Finello', {
      body: data.body || '',
      icon: 'icon.svg',
      badge: 'icon.svg',
      tag: data.tag || data.title + data.body,
      data: { url: './' },
    }),
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      const existing = clients.find((c) => c.url.includes('finello'))
      if (existing) return existing.focus()
      return self.clients.openWindow('./')
    }),
  )
})

self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()))

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      const existing = clients.find((c) => c.url.includes('finello'))
      if (existing) return existing.focus()
      return self.clients.openWindow('./')
    }),
  )
})
