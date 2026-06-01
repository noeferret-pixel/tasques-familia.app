import { db } from './firebase'
import {
  collection, doc, setDoc, deleteDoc, onSnapshot,
  query, addDoc, getDocs, where, orderBy
} from 'firebase/firestore'
import { dateKey } from './data'

// ---- COMPLETIONS ----
// Document per cada tasca completada: id = key de la tasca.
// { key, userId, date, points, ts }

export function listenCompletions(date, cb) {
  const k = dateKey(date)
  const q = query(collection(db, 'completions'), where('date', '==', k))
  return onSnapshot(q, snap => {
    cb(snap.docs.map(d => d.data()))
  })
}

export async function completeTask(task, userId, date) {
  const k = dateKey(date)
  await setDoc(doc(db, 'completions', task.key), {
    key: task.key, taskId: task.taskId, userId, date: k,
    points: 10, ts: Date.now()
  })
}

export async function uncompleteTask(task) {
  await deleteDoc(doc(db, 'completions', task.key))
}

// ---- ABSÈNCIES ----
// { userId, from, to }

export function listenAbsences(cb) {
  return onSnapshot(collection(db, 'absences'), snap => {
    cb(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  })
}

export async function addAbsence(userId, from, to) {
  await addDoc(collection(db, 'absences'), { userId, from, to })
}

export async function removeAbsence(id) {
  await deleteDoc(doc(db, 'absences', id))
}

// ---- TASQUES SETMANALS (extra, editables per admins) ----
// { name, assignee, week (YYYY-WW), done }

export function listenWeeklyTasks(cb) {
  return onSnapshot(collection(db, 'weekly_tasks'), snap => {
    cb(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  })
}

export async function addWeeklyTask(name, assignee) {
  await addDoc(collection(db, 'weekly_tasks'), {
    name, assignee, done: false, ts: Date.now()
  })
}

export async function toggleWeeklyTask(id, done) {
  await setDoc(doc(db, 'weekly_tasks', id), { done }, { merge: true })
}

export async function removeWeeklyTask(id) {
  await deleteDoc(doc(db, 'weekly_tasks', id))
}

// ---- HISTORIAL / SCORES ----
// Llegim completions d'un rang per calcular estadístiques i rànquing.

export async function getCompletionsRange(fromKey, toKey) {
  const q = query(
    collection(db, 'completions'),
    where('date', '>=', fromKey),
    where('date', '<=', toKey)
  )
  const snap = await getDocs(q)
  return snap.docs.map(d => d.data())
}

// ---- TOKENS FCM ----
export async function saveToken(userId, token) {
  await setDoc(doc(db, 'fcm_tokens', token), { userId, token, ts: Date.now() })
}
