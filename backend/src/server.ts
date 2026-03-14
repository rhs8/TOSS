import "dotenv/config";
import "express-async-errors";
import express from "express";
import cors from "cors";
import { initDb } from "./db";
import itemsRouter from "./routes/items";
import usersRouter from "./routes/users";
import categoriesRouter from "./routes/categories";
import wishlistsRouter from "./routes/wishlists";
import circlesRouter from "./routes/circles";
import statsRouter from "./routes/stats";

const app = express();
const PORT = process.env.PORT || 3001;

const allowedOrigin = process.env.FRONTEND_URL || "http://localhost:5173";
app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    if (origin === allowedOrigin) return cb(null, true);
    if (process.env.NODE_ENV !== "production" && /^https?:\/\/localhost(:\d+)?$/.test(origin)) return cb(null, true);
    if (/^https?:\/\/[a-z0-9-]+\.(ngrok(-free)?\.app|ngrok\.io)(:\d+)?$/i.test(origin)) return cb(null, true);
    return cb(null, false);
  },
  credentials: true,
}));
app.use(express.json());

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/api/items", itemsRouter);
app.use("/api/users", usersRouter);
app.use("/api/categories", categoriesRouter);
app.use("/api/wishlists", wishlistsRouter);
app.use("/api/circles", circlesRouter);
app.use("/api/stats", statsRouter);

// JSON error responses (must be after routes)
app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("Server error:", err);
  const code = (err as { code?: string })?.code;
  const msg = err instanceof Error ? err.message : "";
  const message = code === "ECONNREFUSED" || msg.includes("connect")
    ? "Database unavailable. Check DATABASE_URL and that PostgreSQL is running."
    : "Something went wrong. Please try again.";
  res.status(500).json({ error: message });
});

async function start() {
  await initDb();
  app.listen(PORT, () => {
    console.log(`Toss API at http://localhost:${PORT}`);
  });
}
start().catch((err) => {
  console.error("Failed to start:", err);
  process.exit(1);
});
