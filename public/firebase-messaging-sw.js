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
  const { title, body } = payload.notification || {}
  self.registration.showNotification(title || 'Tasques Família', {
    body: body || 'Tens tasques pendents',
    icon: '/icon-192.png',
    badge: '/icon-192.png'
  })
})
