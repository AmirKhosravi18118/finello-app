/* Finello service worker — notification display + click focus.
   Scheduling itself happens app-side: a daily check on app open (HTTPS keeps
   SW + Notification API available; no push server needed at this stage). */

self.addEventListener('install', () => self.skipWaiting())

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
