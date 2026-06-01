# 🏠 Tasques Família (PWA)

Aplicació web instal·lable per gestionar les tasques de casa entre 6 membres de la família.
React + Vite + TailwindCSS + Firebase (Firestore + Cloud Messaging), desplegable gratis a Netlify.

---

## ✨ Què fa

- **Login amb PIN** (sense correu ni registre).
- **Tasques rotatives** automàtiques segons el dia de la setmana (les 8 del quadrant).
- **Tasques fixes** de Noe i Terry cada dia.
- **Robot piscina** que alterna posar/treure automàticament cada dia.
- **Absències**: quan algú es marca absent, TOTES les seves tasques passen a Noe i es mostra l'avís "X tasques reassignades a Noe".
- **Dashboard personal** amb barra de progrés i checkbox.
- **Vista família** (només Noe i Terry) amb estats 🟢🟡🔴.
- **Tasques setmanals extra** editables pels admins.
- **Historial** (7 / 30 / 365 dies) amb % de compliment.
- **Gamificació** amb punts i rànquing.
- **Notificacions push** (08:00 / 18:00 / 22:00) via Firebase Cloud Messaging.
- **PWA instal·lable** a Android i iPhone, amb mode offline bàsic.

---

## 🚀 Posada en marxa (resum)

1. Crear projecte Firebase (gratis).
2. Configurar les claus al fitxer `.env`.
3. Pujar el codi a GitHub.
4. Desplegar a Netlify.
5. (Opcional) Activar les notificacions programades amb Cloud Functions.

Tot el conjunt funciona dins dels plans **gratuïts** de Firebase (Spark) i Netlify.

---

## 1. Firebase

1. Vés a https://console.firebase.google.com i crea un projecte nou.
2. Dins el projecte → **Build → Firestore Database** → *Create database* → mode **producció** → tria una regió (ex. `eur3`).
3. A **Firestore → Rules**, enganxa aquestes regles senzilles (família de confiança, sense auth real):

   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read, write: if true;
       }
     }
   }
   ```

   > ⚠️ Això deixa la base de dades oberta. Per a ús familiar privat és acceptable, però no comparteixis la URL públicament. Si vols més seguretat, demana-m'ho i t'afegeixo App Check.

4. **Project settings (⚙️) → General → Your apps → Web (</>)**. Registra una app web i copia l'objecte `firebaseConfig`.
5. **Project settings → Cloud Messaging** → a *Web configuration* genera un **parell de claus VAPID** i copia la clau pública.

---

## 2. Configurar `.env`

Copia `.env.example` a `.env` i omple els valors amb la teva config de Firebase:

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_FIREBASE_VAPID_KEY=...
```

A més, edita manualment `public/firebase-messaging-sw.js` i substitueix els valors
`EL_TEU_...` per la teva config (el service worker no pot llegir variables d'entorn).

---

## 3. Provar en local

```bash
npm install
npm run dev
```

Obre http://localhost:5173. PINs de prova:

| Usuari  | PIN  |
| ------- | ---- |
| Noe     | 1111 |
| Terry   | 2222 |
| Ariadna | 3333 |
| Biel    | 4444 |
| Ona     | 5555 |
| Bru     | 6666 |

---

## 4. Desplegar a Netlify (gratis)

1. Puja aquest projecte a un repositori de GitHub.
2. A https://app.netlify.com → **Add new site → Import from Git** → tria el repo.
3. Configuració de build:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
4. **Site settings → Environment variables**: afegeix totes les variables `VITE_...` del teu `.env`.
5. Deploy. Tindràs una URL tipus `https://tasques-familia.netlify.app`.
6. (Opcional) **Domain settings** → afegeix un subdomini propi, ex. `tasques.niucoop.cat`.

El fitxer `public/_redirects` ja gestiona el routing SPA perquè no doni 404 en recarregar.

---

## 5. Instal·lar com a app

- **Android (Chrome):** menú → "Afegir a la pantalla d'inici".
- **iPhone (Safari, iOS 16.4+):** botó compartir → "Afegir a la pantalla d'inici".
  ⚠️ A iPhone les **notificacions push només funcionen amb l'app instal·lada** a la pantalla d'inici. Al navegador no.

---

## 6. Notificacions programades (gratis, sense pla Blaze)

Aquesta versió fa servir una **Netlify Function** (gratuïta, 125.000 crides/mes) que
s'activa des d'un **cron extern gratuït**. No cal el pla Blaze de Firebase ni cap servidor propi.

Com funciona:
- La funció `netlify/functions/notify.cjs` mira qui té tasques pendents avui i envia les push.
- Un servei cron gratuït la crida 3 cops al dia (08:00 / 18:00 / 22:00).
- La URL està protegida amb un token secret perquè ningú més la pugui disparar.
- Al matí envia sempre; a la tarda i nit, només a qui té pendents.

### 6.1 Obtenir el service account de Firebase

1. Firebase Console → ⚙️ **Project settings → Service accounts**.
2. **Generate new private key** → es descarrega un fitxer JSON.
3. Obre el JSON i copia'n **tot el contingut en una sola línia**.

### 6.2 Configurar variables a Netlify

A **Site settings → Environment variables**, afegeix:

| Variable                    | Valor                                                  |
| --------------------------- | ------------------------------------------------------ |
| `FIREBASE_SERVICE_ACCOUNT`  | El JSON del service account, tot en una línia          |
| `CRON_SECRET`               | Una paraula secreta llarga que t'inventis              |

> Aquestes NO porten prefix `VITE_` (són del servidor, no del navegador).

Torna a desplegar perquè agafin les variables noves.

### 6.3 Comprovar que la funció va

Obre al navegador (substituint el teu domini i el teu secret):

```
https://tasques-familia.netlify.app/.netlify/functions/notify?token=EL_TEU_SECRET&slot=morning
```

Si tot va bé, retorna un JSON tipus `{"slot":"morning","sent":3,"failed":0}`.
Si retorna `401`, el token no coincideix.

### 6.4 Programar el cron gratuït (cron-job.org)

1. Crea un compte gratuït a https://cron-job.org.
2. Crea **3 cronjobs**, un per cada horari, tots amb mètode **GET**:

   | Horari | URL                                                                              |
   | ------ | -------------------------------------------------------------------------------- |
   | 08:00  | `https://.../.netlify/functions/notify?token=SECRET&slot=morning`                |
   | 18:00  | `https://.../.netlify/functions/notify?token=SECRET&slot=afternoon`              |
   | 22:00  | `https://.../.netlify/functions/notify?token=SECRET&slot=evening`                |

3. A cada cronjob, posa la zona horària **Europe/Madrid** i l'hora corresponent.
4. Desa. Llestos: rebràs les notificacions automàticament cada dia.

> ⚠️ Recorda: a **iPhone** les notificacions només arriben si has instal·lat
> l'app a la pantalla d'inici (iOS 16.4+). A Android funcionen sempre.

### Important sobre `_logic.cjs`

El fitxer `netlify/functions/_logic.cjs` conté una **còpia** de les rotacions de tasques
(perquè el servidor no pot importar el codi del frontend directament). Si algun dia
canvies les rotacions a `src/lib/data.js`, replica el canvi també a `_logic.cjs`.

---

## 7. Consolidació de punts (gamificació real)

El rànquing mostra punts reals consolidats, no només els +10 per tasca:

- **+10** per cada tasca completada
- **+20** per cada dia en què completes TOTES les teves tasques
- **+100** per cada setmana (dilluns–diumenge) amb els 7 dies complets

La funció `netlify/functions/scoreboard.cjs` fa aquest càlcul i el desa a la col·lecció
`scores` de Firestore. El rànquing del frontend llegeix d'allà (i si encara no s'ha
consolidat mai, fa un càlcul de reserva amb els +10 base).

### Programar la consolidació

Afegeix un **4t cronjob** a cron-job.org, a la nit (ex. 23:30), zona Europe/Madrid:

```
https://.../.netlify/functions/scoreboard?token=EL_TEU_SECRET
```

Pots provar-lo manualment al navegador; retorna un JSON amb els punts de cada persona.
Per recalcular un rang concret: afegeix `&days=30` (per defecte recalcula 90 dies).

---

## 8. Missatge especial del dia 14 😏

El **dia 14 de cada mes**, la notificació del matí canvia per un missatge especial.
Pots editar-lo (o posar el que vulguis) a `netlify/functions/notify.cjs`, a la constant
`DAY14_MESSAGE`. Hi ha una versió alternativa comentada just a sota per si la vols activar.

---

## 🗂️ Estructura del projecte

```
tasques-familia/
├─ netlify/
│  └─ functions/
│     ├─ notify.cjs      ← envia push (cridada pel cron)
│     ├─ scoreboard.cjs  ← consolida punts cada nit
│     └─ _logic.cjs      ← còpia de rotacions per al servidor
├─ public/
│  ├─ firebase-messaging-sw.js   ← SW de notificacions (editar config!)
│  ├─ icon-192.png / icon-512.png
│  ├─ favicon.svg
│  └─ _redirects                 ← routing SPA per Netlify
├─ src/
│  ├─ lib/
│  │  ├─ data.js     ← usuaris, rotacions, tasques fixes, robot
│  │  ├─ tasks.js    ← motor: genera tasques del dia + absències
│  │  ├─ firebase.js ← inicialització Firebase
│  │  ├─ store.js    ← lectura/escriptura Firestore
│  │  ├─ auth.jsx    ← login amb PIN
│  │  └─ push.js     ← gestió notificacions FCM
│  ├─ components/UI.jsx
│  ├─ pages/         ← Login, Dashboard, Familia, Setmanals, Historial, Ranquing
│  ├─ App.jsx
│  ├─ main.jsx
│  └─ index.css
├─ package.json
├─ vite.config.js
├─ tailwind.config.js
└─ README.md
```

---

## 🔧 Personalitzar

- **Canviar rotacions, PINs o tasques fixes:** edita `src/lib/data.js`.
- **Canviar colors:** `tailwind.config.js` i `COLOR_HEX` a `data.js`.
- **Responsable del robot piscina:** camp `assignee` a la funció `robotTask` de `data.js`.

---

## 🗄️ Col·leccions de Firestore

| Col·lecció      | Contingut                                      |
| --------------- | ---------------------------------------------- |
| `completions`   | tasques completades (id = key tasca + data)    |
| `absences`      | absències { userId, from, to }                 |
| `weekly_tasks`  | tasques setmanals extra                        |
| `fcm_tokens`    | tokens de notificació per dispositiu           |
| `scores`        | punts consolidats per usuari (gamificació)     |

Es creen soles quan es fa servir l'app; no cal crear-les a mà.

---

Fet amb ❤️ — *Compartir és estimar.*
