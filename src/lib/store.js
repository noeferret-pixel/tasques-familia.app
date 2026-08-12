import {
  collection, doc, setDoc, addDoc, updateDoc, deleteDoc,
  onSnapshot, query, where, getDocs
} from 'firebase/firestore'
import { db } from './firebase.js'
import { dateKey } from './data.js'

// ---- COMPLETIONS ----
export function subscribeCompletions(date, cb) {
  const q = query(collection(db, 'completions'), where('date', '==', dateKey(date)))
  return onSnapshot(q, snap => cb(snap.docs.map(d => d.data())))
}

export async function completeTask(task, userId, date) {
  await setDoc(doc(db, 'completions', task.key), {
    key: task.key,
    taskId: task.id,
    userId,
    date: dateKey(date),
    points: 10,
    ts: Date.now()
  })
}

export async function uncompleteTask(task) {
  await deleteDoc(doc(db, 'completions', task.key))
}

export async function fetchCompletionsRange(fromDate, toDate) {
  const q = query(
    collection(db, 'completions'),
    where('date', '>=', dateKey(fromDate)),
    where('date', '<=', dateKey(toDate))
  )
  return (await getDocs(q)).docs.map(d => d.data())
}

// ---- ABSENCES ----
export function subscribeAbsences(cb) {
  return onSnapshot(collection(db, 'absences'), snap =>
    cb(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  )
}
export async function addAbsence(userId, from, to) {
  await addDoc(collection(db, 'absences'), { userId, from, to })
}
export async function removeAbsence(id) {
  await deleteDoc(doc(db, 'absences', id))
}

// ---- WEEKLY EXTRA TASKS ----
export function subscribeWeeklyTasks(cb) {
  return onSnapshot(collection(db, 'weekly_tasks'), snap =>
    cb(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  )
}
export async function addWeeklyTask(name, assignee) {
  await addDoc(collection(db, 'weekly_tasks'), { name, assignee, done: false, ts: Date.now() })
}
export async function setWeeklyTaskDone(id, done) {
  await updateDoc(doc(db, 'weekly_tasks', id), { done })
}
export async function removeWeeklyTask(id) {
  await deleteDoc(doc(db, 'weekly_tasks', id))
}

// ---- SCORES (consolidats per scoreboard.cjs) ----
export async function fetchScores() {
  const snap = await getDocs(collection(db, 'scores'))
  const map = {}
  snap.docs.forEach(d => { map[d.id] = d.data() })
  return map
}

// ---- FCM TOKENS ----
export async function saveFcmToken(userId, token) {
  await setDoc(doc(db, 'fcm_tokens', token), { userId, token, ts: Date.now() })
}
