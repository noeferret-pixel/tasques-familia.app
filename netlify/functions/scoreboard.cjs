// Netlify Function: consolida la puntuació de gamificació.
// Es crida un cop al dia (recomanat de nit, ex. 23:30) des del cron extern.
//
// Calcula i desa a la col·lecció `scores` (un doc per usuari):
//   - base:   +10 per cada tasca completada
//   - dia:    +20 per cada dia en què l'usuari va completar TOTES les seves tasques
//   - setmana:+100 per cada setmana (dilluns-diumenge) amb els 7 dies complets
//
// Així el rànquing del frontend pot llegir punts reals en lloc de comptar només +10.
//
// Protecció: ?token=XXX == CRON_SECRET
// Paràmetre opcional: ?days=30 (per defecte 90; quants dies enrere recalcula)

const admin = require('firebase-admin')
const { tasksForUser, dateKey } = require('./_logic.cjs')

function initAdmin() {
  if (admin.apps.length) return
  const svc = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
  admin.initializeApp({ credential: admin.credential.cert(svc) })
}

const USER_IDS = ['noe', 'terry', 'ariadna', 'biel', 'ona', 'bru']

// Clau de setmana ISO aproximada: any + número de setmana (dilluns com a inici).
function weekKey(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const day = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - day)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  const week = Math.ceil((((d - yearStart) / 86400000) + 1) / 7)
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, '0')}`
}

exports.handler = async (event) => {
  const params = event.queryStringParameters || {}
  if (params.token !== process.env.CRON_SECRET) {
    return { statusCode: 401, body: 'No autoritzat' }
  }

  const days = Math.min(parseInt(params.days || '90', 10), 366)

  try {
    initAdmin()
    const db = admin.firestore()

    const to = new Date()
    const from = new Date(); from.setDate(to.getDate() - (days - 1))

    // Carregar absències i totes les completions del rang
    const [absSnap, compSnap] = await Promise.all([
      db.collection('absences').get(),
      db.collection('completions')
        .where('date', '>=', dateKey(from))
        .where('date', '<=', dateKey(to))
        .get()
    ])
    const absences = absSnap.docs.map(d => d.data())
    const comps = compSnap.docs.map(d => d.data())

    // Index de completions per data -> Set de keys
    const doneByDate = {}
    comps.forEach(c => {
      (doneByDate[c.date] = doneByDate[c.date] || new Set()).add(c.key)
    })

    // Acumuladors per usuari
    const score = {}
    USER_IDS.forEach(u => { score[u] = { base: 0, dayBonus: 0, weekBonus: 0, perfectDays: 0 } })

    // Per detectar setmana perfecta: per usuari -> setmana -> {complets, totalDiesAmbTasca}
    const weekTrack = {}
    USER_IDS.forEach(u => { weekTrack[u] = {} })

    const cur = new Date(from)
    while (cur <= to) {
      const k = dateKey(cur)
      const wk = weekKey(cur)
      const doneSet = doneByDate[k] || new Set()

      for (const u of USER_IDS) {
        const mine = tasksForUser(u, new Date(cur), absences)
        const total = mine.length
        const done = mine.filter(t => doneSet.has(t.key)).length

        score[u].base += done * 10

        const wt = (weekTrack[u][wk] = weekTrack[u][wk] || { full: 0, daysWithTasks: 0 })
        if (total > 0) {
          wt.daysWithTasks++
          if (done === total) {
            score[u].dayBonus += 20
            score[u].perfectDays++
            wt.full++
          }
        } else {
          // Dia sense tasques compta com a "complet" per a la setmana perfecta
          wt.full++
        }
      }
      cur.setDate(cur.getDate() + 1)
    }

    // Setmana perfecta: els 7 dies complets (full == 7) i amb almenys 1 dia amb tasca
    for (const u of USER_IDS) {
      for (const wk of Object.keys(weekTrack[u])) {
        const wt = weekTrack[u][wk]
        if (wt.full >= 7 && wt.daysWithTasks > 0) score[u].weekBonus += 100
      }
    }

    // Desar a Firestore
    const batch = db.batch()
    const out = {}
    for (const u of USER_IDS) {
      const s = score[u]
      const total = s.base + s.dayBonus + s.weekBonus
      out[u] = total
      batch.set(db.collection('scores').doc(u), {
        userId: u, total,
        base: s.base, dayBonus: s.dayBonus, weekBonus: s.weekBonus,
        perfectDays: s.perfectDays, updated: Date.now()
      })
    }
    await batch.commit()

    return { statusCode: 200, body: JSON.stringify({ ok: true, days, scores: out }) }
  } catch (e) {
    console.error(e)
    return { statusCode: 500, body: 'Error: ' + e.message }
  }
}
