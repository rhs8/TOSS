# Toss — Community Exchange Platform

A **money-free** item exchange where items must keep circulating. Built for students and newcomers who need tools temporarily (e.g. a sander, a drill) but can't justify buying—or can't keep things when they move.

## Core concept

- **List first, then borrow.** You can't receive anything until you've put something up. After you post, you get access to everything on the platform.
- **One exchange per week.** Keeps things fair and items moving.
- **6-month minimum commitment** from your first listing. Builds trust and reduces one-off purchases.
- **Card on file.** For reassurance: if someone doesn't return an item, they're charged. Keeps the community reliable.

## Tech stack

- **Next.js 14** (Pages Router), TypeScript, Tailwind CSS
- **Prisma** + SQLite (swap to Postgres for production)
- Demo auth (replace with NextAuth/Clerk for real use)

## Run locally

```bash
npm install
npx prisma generate
npx prisma db push
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project structure

- `pages/` — Routes (home, browse, post, profile, listing detail)
- `pages/api/` — API routes (listings, exchange request)
- `src/components/` — UI (Header, ListingCard, PostItemForm)
- `src/lib/` — db, rules (commitment, week), demo auth
- `prisma/schema.prisma` — User, Listing, Exchange

## Rules (enforced in API)

1. **Must list before receive** — Request is rejected until the user has at least one listing.
2. **One exchange per week** — One active exchange per user per week (week starts Monday).
3. **6-month commitment** — Set on first listing; request is rejected if commitment has ended.
4. **Card on file** — Stored on user; charge flow can be added via Stripe when item not returned.

## Hackathon status

- Full-stack scaffold and core flows (post, browse, request) are in place.
- Auth is a single demo user; add real auth and multiple users for production.
- Card on file is a boolean; integrate Stripe (setup intent / payment method) to charge on abuse.
- Consider: return flow (mark item returned, set listing active again), disputes, notifications.
