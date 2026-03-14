# TOSS API

## Run (no install)

With `DATABASE_URL=memory` in `.env` (default), the backend uses an **in-memory database**. No PostgreSQL or Docker required.

```bash
cd backend
npm run dev
```

API: http://localhost:3001  
Health: http://localhost:3001/health

Data is lost when the process exits. For persistent data, use PostgreSQL (see below).

## Optional: PostgreSQL (persistent data)

### Option A – Docker

```bash
cd backend
docker compose up -d
```

In `.env` set `DATABASE_URL=postgresql://user:password@localhost:5432/toss`, then:

```bash
npm run db:init
npm run dev
```

### Option B – Homebrew (macOS)

```bash
brew install postgresql@16
brew services start postgresql@16
```

In `.env` set `DATABASE_URL=postgresql://user:password@localhost:5432/toss`, then `npm run db:init` and `npm run dev`.

## Environment

Copy `.env.example` to `.env`. Leave `ALLOWED_EMAIL_DOMAINS` commented to allow any email for signup.

If port 3001 is in use, set `PORT=3006` (or another free port) in `.env`. If the frontend calls this API, set `VITE_API_URL=http://localhost:3006` when running the web app.
