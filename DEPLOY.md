# Deploy TOSS (Option 2: Always-on live link)

Deploy the **backend** to Railway (with Postgres) and the **frontend** to Vercel. You’ll get a permanent frontend URL (e.g. `https://toss-xxx.vercel.app`) and backend URL (e.g. `https://toss-api.railway.app`).

---

## 1. Backend on Railway

### 1.1 Create project and Postgres

1. Go to [railway.app](https://railway.app) and sign in (e.g. with GitHub).
2. **New Project** → **Deploy from GitHub repo** → choose your TOSS repo.
3. When asked what to deploy, choose **“Add a service”** and add **PostgreSQL** first (from “Database” or “New” → “Database” → “PostgreSQL”).
4. Open the Postgres service → **Variables** (or **Connect**) and copy **`DATABASE_URL`** (or the connection string). You’ll use it in the next step.

### 1.2 Deploy the backend app

1. In the same project, **Add service** again → **GitHub Repo** → same TOSS repo.
2. Open the new service (the one that’s not Postgres).
3. **Settings** (or **Variables**):
   - **Root Directory:** `backend`
   - **Build Command:** `npm run build`
   - **Start Command:** `npm start`
   - **Variables:** add:
     - `DATABASE_URL` = (paste the Postgres URL from step 1.1; Railway can also link it via “Add variable” → “Reference” from the Postgres service).
     - `NODE_ENV` = `production`
     - `FRONTEND_URL` = leave empty for now; you’ll set it after deploying the frontend (e.g. `https://your-app.vercel.app`).
4. **Deploy.** Wait until the build and start succeed.
5. Open **Settings** → **Networking** → **Generate domain**. Copy the public URL (e.g. `https://toss-api-production-xxx.up.railway.app`). This is your **backend URL**.

### 1.3 Create tables (one-time)

Run the database setup once so the backend has tables and seed data:

1. In the **backend** service on Railway, open **Settings** → **One-off command** (or use **“Run command”** / **“Deploy”** with a custom command if available).
2. If Railway supports running a command in the same environment:
   - Command: `npm run db:init`
   - This uses the same `DATABASE_URL` and creates tables + categories/circles.
3. If there’s no one-off command UI:
   - Install Railway CLI: `npm i -g @railway/cli` then `railway login`.
   - In your repo: `cd backend` then `railway link` (select the project and backend service).
   - Run: `railway run npm run db:init`.
4. After it runs once, you don’t need to run it again unless you reset the database.

### 1.4 Set frontend URL (after step 2)

Once the frontend is deployed, in the **backend** service on Railway add or update:

- `FRONTEND_URL` = your Vercel frontend URL (e.g. `https://toss-xyz.vercel.app`).

Redeploy the backend if needed so CORS allows that origin.

---

## 2. Frontend on Vercel

1. Go to [vercel.com](https://vercel.com) and sign in (e.g. with GitHub).
2. **Add New** → **Project** → import your TOSS repo.
3. **Configure:**
   - **Root Directory:** `web` (click “Edit” and set to `web`).
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Environment variables:** add:
     - **Name:** `VITE_API_URL`
     - **Value:** your **backend URL** from step 1.2 (e.g. `https://toss-api-production-xxx.up.railway.app`)
     - Apply to Production (and Preview if you want).
4. **Deploy.** Wait until the build finishes.
5. Copy the project URL (e.g. `https://toss-xxx.vercel.app`). This is your **live link**.

---

## 3. Connect backend and frontend

1. In **Railway** (backend service): set **`FRONTEND_URL`** to your Vercel URL (e.g. `https://toss-xxx.vercel.app`) and save/redeploy.
2. In **Vercel** (frontend): ensure **`VITE_API_URL`** is set to your Railway backend URL. If you change it, redeploy the frontend.

---

## 4. Share your live link

- **Live app (share this):** your Vercel URL, e.g. `https://toss-xxx.vercel.app`
- **API:** your Railway backend URL (only if you need it for debugging; users use the Vercel link).

---

## Troubleshooting

- **“Failed to fetch” or CORS:** Make sure `FRONTEND_URL` on Railway exactly matches your Vercel URL (including `https://`).
- **Backend 500 / DB errors:** Ensure you ran `npm run db:init` once with the production `DATABASE_URL` (step 1.3).
- **Frontend shows old API:** Redeploy on Vercel after changing `VITE_API_URL`; the value is baked in at build time.
