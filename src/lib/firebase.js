import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getMessaging, isSupported } from 'firebase/messaging'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
}

export const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)

// Messaging només si el navegador ho suporta (evita errors a iOS antic)
export async function getMessagingIfSupported() {
  try {
    if (await isSupported()) return getMessaging(app)
  } catch (e) {
    console.warn('Messaging no suportat', e)
  }
  return null
}

export const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY
