# Deploy now (code is already pushed)

Your latest code is on **GitHub** (`main`). Do these steps once; both sites will use that repo.

---

## Step 1: Backend on Railway (~3 min)

1. Open **https://railway.app** and sign in with GitHub.
2. Click **New Project** → **Deploy from GitHub repo** → choose **rhs8/TOSS**.
3. You’ll see one service. Click it → **Settings**:
   - **Root Directory:** `backend`
   - **Build Command:** `npm run build`
   - **Start Command:** `npm start`
4. **Variables:** click **Add variable** (or **Variables** tab):
   - Add **Postgres first:** click **+ New** → **Database** → **PostgreSQL**. Railway creates a DB and usually adds `DATABASE_URL` to your service. If not, copy the Postgres connection string from the new DB service and add variable `DATABASE_URL` = that URL.
   - Then add: `NODE_ENV` = `production`
   - Leave `FRONTEND_URL` empty for now.
5. **Deploy:** Railway builds and runs. Open **Settings** → **Networking** → **Generate domain**. Copy the URL (e.g. `https://toss-production-xxxx.up.railway.app`) — this is your **backend URL**.
6. **Create tables (one-time):** In the backend service, open **Settings** → find **Run command** / **One-off command**, or use **Railway CLI** on your machine:
   - `npm i -g @railway/cli` then `railway login`
   - `cd backend` → `railway link` (choose this project/service)
   - `railway run npm run db:init`
   - When it prints "Schema applied." and "Categories seeded.", you’re done.

---

## Step 2: Frontend on Vercel (~2 min)

1. Open **https://vercel.com** and sign in with GitHub.
2. Click **Add New** → **Project** → import **rhs8/TOSS**.
3. **Configure:**
   - **Root Directory:** click **Edit** → set to `web` → **Continue**.
   - **Environment Variables:** add one:
     - Name: `VITE_API_URL`
     - Value: paste your **backend URL** from Step 1 (e.g. `https://toss-production-xxxx.up.railway.app`) — no trailing slash.
   - **Deploy**.
4. When the build finishes, copy your **frontend URL** (e.g. `https://toss-xxx.vercel.app`). This is your **live link**.

---

## Step 3: Connect backend to frontend

1. In **Railway** (backend service): **Variables** → add or edit:
   - `FRONTEND_URL` = your **Vercel frontend URL** from Step 2 (e.g. `https://toss-xxx.vercel.app`)
2. Save. Railway will redeploy. Wait ~1 min.

Done. Share your **Vercel URL**; that’s the live app.

---

## Optional: Deploy from your machine with CLI

- **Vercel:** In the repo run `npm run deploy:web`. First time it will ask you to log in and link the project. Set `VITE_API_URL` in the Vercel dashboard (Project → Settings → Environment Variables) to your backend URL before or after.
- **Railway:** Install `@railway/cli`, `railway login`, `cd backend`, `railway link`, then `railway up` to deploy the backend.
