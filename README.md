# Toss Community Exchange Platform

Money-free community exchange: **post an item to browse**. 1 post = 1 borrow. 3-month renewable commitment. Items circulate (never back to the same person). Item biography shows every holder. Institution email (e.g. @sfu.ca). Card on file (Stripe) for accountability; charged only if an item isn’t passed on.


## Tech stack


| Layer      | Tech |
|-----------|------|
| Frontend  | React + TypeScript, Vite, React Router |
| Backend   | Node.js + Express (TypeScript), PostgreSQL |
| Auth      | Firebase Auth (placeholder: dev token) |
| Payments  | Stripe (card on file, charge on breach) |
| Moderation| Google Gemini API (optional) |
| Maps      | Google Maps API (neighbourhoods) |
| Deploy    | Frontend: **Vercel** · Backend: **Railway** |

## Project layout

```
TOSS/
├── web/                 # React frontend (Vercel)
│   ├── src/
│   │   ├── pages/       # Landing, Browse, Post, Item detail (biography), Profile, Wishlist, Sign in/up
│   │   ├── api.ts      # API client
│   │   ├── auth.tsx    # Auth context (token, user)
│   │   └── App.tsx
│   └── package.json
│
├── backend/             # Express API (Railway)
│   ├── src/
│   │   ├── db/         # PostgreSQL schema, seed
│   │   ├── routes/     # items, users, categories, wishlists
│   │   ├── auth.ts     # requireAuth (Firebase placeholder)
│   │   ├── rules.ts    # post/borrow counts, canBrowse, canRequest, suspensions
│   │   └── server.ts
│   ├── scripts/
│   │   └── init-db.js  # Run schema + seed
│   └── package.json
│
└── README.md
```

## Where to edit each feature

Use this as a map: **feature → file(s) to edit**.

| Feature | Where to edit |
|--------|----------------|
| **Landing page text** (tagline, rules blurb, buttons) | `web/src/pages/Landing.tsx` |
| **Sign in / Sign up form** (fields, labels, validation message) | `web/src/pages/SignIn.tsx`, `web/src/pages/SignUp.tsx` |
| **Allowed sign-up email domains** (e.g. only @sfu.ca) | `backend/.env` → `ALLOWED_EMAIL_DOMAINS` · Check logic in `backend/src/routes/users.ts` (signup handler) |
| **Browse page** (layout, filters, how items are listed) | `web/src/pages/Browse.tsx` |
| **Post-item form** (fields, labels, what gets sent to API) | `web/src/pages/PostItem.tsx` · API handler: `backend/src/routes/items.ts` → `POST /` (post new item) |
| **Item detail page** (single item view, request button, biography block) | `web/src/pages/ItemDetail.tsx` |
| **Item biography** (who held it, dates) | Backend: `backend/src/routes/items.ts` → `GET /:id` (returns `biography`). DB: `backend/src/db/schema.sql` → `item_holders` table. |
| **Profile page** (counts, commitment, card on file text) | `web/src/pages/Profile.tsx` · Data from `backend/src/routes/users.ts` → `GET /me` |
| **Wishlist** (add/view wishlist items) | Frontend: `web/src/pages/Wishlist.tsx` · Backend: `backend/src/routes/wishlists.ts` |
| **Categories** (list of categories for post/browse) | Backend: `backend/scripts/init-db.js` (seed) and `backend/src/db/schema.sql` → `categories` table. API: `backend/src/routes/categories.ts`. |
| **Rules: “post before browse”** (block browse if post count = 0) | `backend/src/rules.ts` → `canBrowse()` |
| **Rules: “1 post = 1 borrow”** (block request if borrow ≥ post count) | `backend/src/rules.ts` → `canRequestItem()` |
| **Rules: 3-month commitment** (check and set commitment end) | `backend/src/rules.ts` → `isCommitmentValid()` · Set commitment on signup: `backend/src/routes/users.ts` (signup). |
| **Rules: 30-day suspension / ban + charge** (offence when item not passed on) | `backend/src/rules.ts` → `recordCirculationOffence()`, `flagStaleHolders()` |
| **Auth** (who is logged in, token) | Frontend: `web/src/auth.tsx` (context, token storage). Backend: `backend/src/auth.ts` (requireAuth, verify token / Firebase). |
| **API base URL** (frontend calling backend) | `web/vite.config.ts` → proxy `target` (dev). Production: `web/.env` → `VITE_API_URL`. |
| **Database schema** (tables, columns) | `backend/src/db/schema.sql` · After editing, re-run `backend/scripts/init-db.js` or run the new SQL. |
| **Item moderation** (e.g. AI before item goes live) | `backend/src/routes/items.ts` → `POST /` (new item). Where `status = 'pending_review'` or `'live'` is set; add Gemini (or other) call there. |
| **Stripe card on file / charge on ban** | Backend: add Stripe in `recordCirculationOffence()` in `backend/src/rules.ts` (charge on 2nd offence). User’s `stripe_customer_id`: `backend/src/db/schema.sql` → `users` table; save it when user adds card (new route or in `users.ts`). |
| **Top navigation links** | `web/src/Layout.tsx` (nav and links). |
| **Global styles** (colors, fonts, buttons) | `web/src/index.css` |

## Rules (backend `rules.ts`)

- **Browse:** Allowed only if `post_count > 0`.
- **Request item:** Allowed only if `borrow_count < post_count`.
- **Commitment:** 3-month renewable; checked on post and request.
- **Suspension:** User doesn’t pass item on within 30 days → 1st: 30-day suspension; 2nd: permanent ban + Stripe charge.
- **Min 1 post per month:** Enforced by cron/job (see `flagStaleHolders`).

## Run locally

### 1. PostgreSQL

Create a database and set:

```bash
export DATABASE_URL=postgresql://user:password@localhost:5432/toss
```

### 2. Backend

```bash
cd backend
cp .env.example .env
# Edit .env: set DATABASE_URL, optionally SKIP_MODERATION=1
npm install
node scripts/init-db.js   # schema + seed categories
npm run dev               # http://localhost:3001
```

### 3. Frontend

```bash
cd web
npm install
npm run dev               # http://localhost:5173
```

Use **Sign up** with an email like `you@sfu.ca` (allowed domains in `ALLOWED_EMAIL_DOMAINS`). Dev mode uses a fake token; no Firebase yet.

## Deploy

### Backend (Railway)

1. New project → Deploy from GitHub (backend folder or monorepo).
2. Add PostgreSQL plugin or external `DATABASE_URL`.
3. Variables: `DATABASE_URL`, `FRONTEND_URL` (Vercel URL), `ALLOWED_EMAIL_DOMAINS`, and optionally Stripe, Firebase, Gemini, Maps keys.
4. Build: `npm install && npm run build` · Start: `npm start`.

### Frontend (Vercel)

1. Import repo → Root or set **Root Directory** to `web`.
2. Build: `npm run build` · Output: `dist`.
3. Env: `VITE_API_URL` = Railway API URL (e.g. `https://your-app.railway.app`).

## Integrations (how to wire them)

### Firebase Auth

- **Frontend:** Install `firebase`, init app, `signInWithEmailAndPassword` / `createUserWithEmailAndPassword`. On sign-in, get `idToken` and send to backend (e.g. store in state and send as `Authorization: Bearer <idToken>`).
- **Backend:** Install `firebase-admin`, init with service account. In `auth.ts`, replace dev-token logic with `admin.auth().verifyIdToken(token)` and use `decoded.uid` as `firebase_uid`. Keep signup flow: create/update user by `firebase_uid` and email (institution domain check stays).

### Stripe (card on file)

- **Frontend:** Stripe.js / Elements; create PaymentMethod or SetupIntent; send payment method ID to your backend.
- **Backend:** `stripe.customers.create` (or use existing), `stripe.paymentMethods.attach`, set default. Save `stripe_customer_id` on user. On “second offence” (ban), call `stripe.paymentIntents.create` (or Charges) to charge the saved payment method. Use webhooks for `payment_intent.succeeded` if needed.

### Google Gemini (moderation)

- When an item is posted (backend `POST /api/items`), before setting `status = 'live'`, call Gemini with the item title + description; interpret response (e.g. safe/unsafe). If safe, set `status = 'live'`; else `status = 'pending_review'` or reject. Same for wishlist matching: periodic job that matches wishlist titles to new items via Gemini and notifies users.

### Google Maps (neighbourhoods)

- **Frontend:** Load Maps JS API; geocode or use Places for neighbourhood/city; send `lat`, `lng`, `neighbourhood` when posting an item. Browse filters already support `neighbourhood` query param.

## Old simple stack (EJS + SQLite)

The previous version (HTML/CSS + Node/Express + SQLite) is in the **`frontend/`** and **`backend/`** folders that contain `.ejs` and `db.js`/`server.js`. This new stack is **`web/`** (React) and **`backend/`** (TypeScript + PostgreSQL). If you want to keep the old app, rename the current `backend` to `backend-simple` and keep the new API in `backend`; or remove the old files and keep only `web/` + new `backend/`.
