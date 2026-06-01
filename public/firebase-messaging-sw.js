// Service worker dedicat a Firebase Cloud Messaging (notificacions en segon pla).
// Aquest fitxer ha d'estar a l'arrel (public/) i fa servir la versió "compat".
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js')

// IMPORTANT: aquests valors no poden venir de variables d'entorn (el SW no en té accés).
// Substitueix-los manualment pels del teu projecte Firebase abans de desplegar.
firebase.initializeApp({
  apiKey: 'AIzaSyB_lysc0BrQfqY86I5P9KvnXaK1WwY6UKc',
  authDomain: 'tasques-familia.firebaseapp.com',
  projectId: 'tasques-familia',
  storageBucket: 'tasques-familia.firebasestorage.app',
  messagingSenderId: '905343823965',
  appId: '1:905343823965:web:4ebc85e3aab77524adddb4'
})

const messaging = firebase.messaging()

messaging.onBackgroundMessage(payload => {
  const data = payload.notification || payload.data || {}
  self.registration.showNotification(data.title || 'Tasques Família', {
    body: data.body || 'Tens tasques pendents',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: 'tasques-familia',
    renotify: true
  })
})

// En clicar la notificació, obre (o enfoca) l'app
self.addEventListener('notificationclick', event => {
  event.notification.close()
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      for (const c of list) {
        if ('focus' in c) return c.focus()
      }
      if (self.clients.openWindow) return self.clients.openWindow('/')
    })
  )
})
