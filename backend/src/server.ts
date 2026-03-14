import "dotenv/config";
import express from "express";
import cors from "cors";
import itemsRouter from "./routes/items";
import usersRouter from "./routes/users";
import categoriesRouter from "./routes/categories";
import wishlistsRouter from "./routes/wishlists";
import { pool } from "./db";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:5173", credentials: true }));
app.use(express.json());

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/api/items", itemsRouter);
app.use("/api/users", usersRouter);
app.use("/api/categories", categoriesRouter);
app.use("/api/wishlists", wishlistsRouter);

app.listen(PORT, () => {
  console.log(`Toss API at http://localhost:${PORT}`);
});
