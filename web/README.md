# TOSS Web App

React frontend for TOSS, a community exchange platform. Users create an account, post items, browse what others have posted, and request items. Requesting opens a popup to enter dates/times and meeting locations.

## Tech stack

- **React 18** with TypeScript
- **Vite** (dev server and build)
- **React Router** for routes
- **Firebase** (dependency present; auth can be wired later)

## Project structure

```
web/
├── index.html              # Entry HTML
├── package.json
├── vite.config.ts          # Dev server, API proxy
├── tsconfig.json
└── src/
    ├── main.tsx            # React root, AuthProvider, Router
    ├── App.tsx              # Routes (Landing, Browse, Post, Item detail, etc.)
    ├── index.css            # Global styles
    ├── api.ts               # API client (getItems, postItem, requestItem, etc.)
    ├── auth.tsx             # Auth context (token, user, setToken, refreshUser)
    ├── Layout.tsx           # Header, sidebar (Home, Browse, Wishlist, Account, Post, My postings)
    └── pages/
        ├── Landing.tsx      # Home page
        ├── Account.tsx      # Sign in / Sign up entry
        ├── SignIn.tsx       # Sign in form
        ├── SignUp.tsx       # Sign up form
        ├── Browse.tsx       # List all items (bio cards), filters
        ├── PostItem.tsx     # Post new item form
        ├── MyPostings.tsx   # Your items, delete option per item
        ├── ItemDetail.tsx   # Single item, request button, request modal (dates/times, locations)
        ├── Profile.tsx      # User profile, counts
        ├── Wishlist.tsx     # Wishlist
        └── CommunitySpace.tsx
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server (default port 5173) |
| `npm run build` | TypeScript build + Vite build; output in `dist/` |
| `npm run preview` | Serve the production build locally |

## Environment variables

- **Development:** No `.env` required. The dev server proxies `/api` to the backend (see `vite.config.ts`).
- **Point to a specific backend:** Set `VITE_API_URL` before starting the dev server so the proxy target is correct. Example:
  ```bash
  VITE_API_URL=http://localhost:3017 npm run dev
  ```
- **Production build:** Set `VITE_API_URL` to your API base URL (e.g. `https://your-api.railway.app`) so the built app calls the right backend.

## Run locally

1. **Backend:** From the repo root, start the API (e.g. `cd backend && PORT=3017 npm run dev`). The API must be running for the web app to load items and handle sign in, post, request, delete.

2. **Frontend:**
   ```bash
   cd web
   npm install
   npm run dev
   ```
   If your backend runs on a different port, use:
   ```bash
   VITE_API_URL=http://localhost:3017 npm run dev
   ```

3. Open the URL Vite prints (e.g. `http://localhost:5173`). Create an account (Sign up), then you can post an item, browse all items, open an item and request it (popup: dates/times and locations), and delete your postings from My postings.

## API proxy (development)

In `vite.config.ts`, requests to `/api` are proxied to `process.env.VITE_API_URL` or `http://localhost:3001`. The backend port may be set via `PORT` in the backend (e.g. 3012 in `backend/.env` or 3017 when you run `PORT=3017 npm run dev`). Use `VITE_API_URL` so the proxy target matches your backend.

## Build for production

```bash
npm run build
```

Output is in `dist/`. Deploy that folder to a static host (e.g. Vercel). Set `VITE_API_URL` in the build environment to your production API URL.

## Main features and where to edit

| Feature | File(s) |
|---------|--------|
| Landing page text and layout | `src/pages/Landing.tsx` |
| Sign in / Sign up forms | `src/pages/SignIn.tsx`, `src/pages/SignUp.tsx` |
| Browse list and filters | `src/pages/Browse.tsx` |
| Post item form | `src/pages/PostItem.tsx` |
| Item detail and request modal (dates/times, locations) | `src/pages/ItemDetail.tsx` |
| My postings and delete button | `src/pages/MyPostings.tsx` |
| Navigation and sidebar | `src/Layout.tsx` |
| API calls | `src/api.ts` |
| Auth (token, user) | `src/auth.tsx` |
| Global styles | `src/index.css` |

## Notes

- The app expects the backend to be running. Sign up, sign in, browse, post, request, and delete all go through the API.
- In development, auth uses a dev token (see backend). No Firebase Auth is required to run locally.
- Request flow: user clicks "Request this item" on an item page, a modal opens to enter dates/times and meeting locations, then they submit. The backend stores that with the request.
