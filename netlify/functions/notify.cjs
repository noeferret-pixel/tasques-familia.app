// Netlify Function: envia notificacions push als usuaris amb tasques pendents.
// Es crida des d'un cron extern (cron-job.org) a les 08:00 / 18:00 / 22:00.
//
// Protecció: cal passar ?token=XXX que coincideixi amb la variable CRON_SECRET.
// Paràmetre slot: 'morning' | 'afternoon' | 'evening'
//   - morning: envia sempre (bon dia + tasques del dia)
//   - afternoon/evening: només si l'usuari té tasques pendents avui
//
// Variables d'entorn necessàries a Netlify:
//   FIREBASE_SERVICE_ACCOUNT  -> JSON del service account (tot en una línia)
//   CRON_SECRET               -> paraula secreta que protegeix la URL

const admin = require('firebase-admin')
const { buildDayTasks, dateKey } = require('./_logic.cjs')

// Inicialització única (Netlify reutilitza la instància entre crides en calent)
function initAdmin() {
  if (admin.apps.length) return
  const svc = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
  admin.initializeApp({ credential: admin.credential.cert(svc) })
}

const MESSAGES = {
  morning:   { title: 'Bon dia! ☀️',          body: 'Aquestes són les teves tasques d\'avui' },
  afternoon: { title: 'Recordatori 🔔',        body: 'Encara tens tasques pendents' },
  evening:   { title: 'Últim recordatori 🌙',  body: 'Revisa les tasques abans d\'anar a dormir' }
}

// Missatge especial del dia 14 de cada mes (slot matí).
// Versió juganera. Si vols la versió original i bèstia, descomenta la línia de sota.
const DAY14_MESSAGE = { title: 'Bon dia! 😏', body: 'Avui esmorza fort... que el dia ho demana 💪' }
// const DAY14_MESSAGE = { title: 'Bon dia! 😏', body: 'Agafa un cagarro i esmorza!' }

exports.handler = async (event) => {
  const params = event.queryStringParameters || {}

  // 1) Comprovació del token secret
  if (params.token !== process.env.CRON_SECRET) {
    return { statusCode: 401, body: 'No autoritzat' }
  }

  const slot = params.slot || 'morning'
  let msg = MESSAGES[slot] || MESSAGES.morning

  // El dia 14 de cada mes, al matí, missatge especial
  if (slot === 'morning' && new Date().getDate() === 14) {
    msg = DAY14_MESSAGE
  }

  try {
    initAdmin()
    const db = admin.firestore()
    const today = new Date()
    const k = dateKey(today)

    // 2) Carregar absències, completions d'avui i tokens
    const [absSnap, compSnap, tokSnap] = await Promise.all([
      db.collection('absences').get(),
      db.collection('completions').where('date', '==', k).get(),
      db.collection('fcm_tokens').get()
    ])

    const absences = absSnap.docs.map(d => d.data())
    const completedKeys = new Set(compSnap.docs.map(d => d.data().key))
    const tokens = tokSnap.docs.map(d => d.data()) // { userId, token }

    // 3) Calcular tasques del dia i quins usuaris tenen pendents
    const dayTasks = buildDayTasks(today, absences)
    const pendingByUser = {}
    for (const t of dayTasks) {
      if (!completedKeys.has(t.key)) {
        pendingByUser[t.assignee] = (pendingByUser[t.assignee] || 0) + 1
      }
    }

    // 4) Decidir a qui notifiquem segons el slot
    const targets = tokens.filter(({ userId }) => {
      if (slot === 'morning') return true
      return (pendingByUser[userId] || 0) > 0
    })

    if (targets.length === 0) {
      return { statusCode: 200, body: JSON.stringify({ sent: 0, reason: 'sense destinataris' }) }
    }

    // 5) Enviar (sendEachForMulticast, API actual)
    const fcmTokens = targets.map(t => t.token)
    const response = await admin.messaging().sendEachForMulticast({
      tokens: fcmTokens,
      notification: { title: msg.title, body: msg.body },
      webpush: { fcmOptions: { link: '/' } }
    })

    // 6) Netejar tokens invàlids
    const dead = []
    response.responses.forEach((r, i) => {
      if (!r.success) {
        const code = r.error && r.error.code
        if (code === 'messaging/registration-token-not-registered' ||
            code === 'messaging/invalid-registration-token') {
          dead.push(fcmTokens[i])
        }
      }
    })
    await Promise.all(dead.map(tk => db.collection('fcm_tokens').doc(tk).delete()))

    return {
      statusCode: 200,
      body: JSON.stringify({ slot, sent: response.successCount, failed: response.failureCount, cleaned: dead.length })
    }
  } catch (e) {
    console.error(e)
    return { statusCode: 500, body: 'Error: ' + e.message }
  }
}
