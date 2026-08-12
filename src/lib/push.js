import { getMessaging, getToken, isSupported } from 'firebase/messaging'
import { app } from './firebase.js'
import { saveFcmToken } from './store.js'

const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY

export async function initMessaging() {
  try {
    if (await isSupported()) return getMessaging(app)
  } catch (e) {
    console.warn('Messaging no suportat', e)
  }
  return null
}

export async function requestNotifications(userId) {
  if (!('Notification' in window)) {
    alert('Aquest navegador no admet notificacions')
    return
  }
  const perm = await Notification.requestPermission()
  if (perm !== 'granted') return
  const messaging = await initMessaging()
  if (!messaging) return
  try {
    const token = await getToken(messaging, { vapidKey: VAPID_KEY })
    if (token) await saveFcmToken(userId, token)
  } catch (e) {
    console.warn('No s\'ha pogut obtenir el token FCM', e)
  }
}
