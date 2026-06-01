import { getMessagingIfSupported, VAPID_KEY } from './firebase'
import { getToken, onMessage } from 'firebase/messaging'
import { saveToken } from './store'

// Demana permís i registra el token FCM per a l'usuari actual.
export async function requestNotificationPermission() {
  try {
    if (!('Notification' in window)) {
      alert('Aquest navegador no suporta notificacions.')
      return
    }
    const messaging = await getMessagingIfSupported()
    if (!messaging) {
      alert('A iPhone cal instal·lar primer l\'app a la pantalla d\'inici (iOS 16.4+).')
      return
    }
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') return

    const reg = await navigator.serviceWorker.ready
    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: reg
    })
    if (token) {
      const userId = localStorage.getItem('tf_user')
      if (userId) await saveToken(userId, token)
      alert('Notificacions activades! 🔔')
    }
  } catch (e) {
    console.error(e)
    alert('No s\'han pogut activar les notificacions.')
  }
}

// Notificacions en primer pla
export async function listenForeground() {
  const messaging = await getMessagingIfSupported()
  if (!messaging) return
  onMessage(messaging, payload => {
    const { title, body } = payload.notification || {}
    if (title) new Notification(title, { body, icon: '/icon-192.png' })
  })
}
