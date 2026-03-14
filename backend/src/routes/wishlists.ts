import { Router } from "express";
import { query } from "../db";
import { requireAuth, type AuthRequest } from "../auth";

const router = Router();

router.get("/", requireAuth, async (req: AuthRequest, res) => {
  const list = await query(
    `SELECT w.*, c.name AS category_name FROM wishlists w
     LEFT JOIN categories c ON c.id = w.category_id
     WHERE w.user_id = $1 ORDER BY w.created_at DESC`,
    [req.user!.id]
  );
  res.json({ wishlists: list });
});

router.post("/", requireAuth, async (req: AuthRequest, res) => {
  const { title, description, category_id, neighbourhood } = req.body;
  if (!title) return res.status(400).json({ error: "Title required." });
  const rows = await query(
    `INSERT INTO wishlists (user_id, title, description, category_id, neighbourhood)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [req.user!.id, title, description ?? null, category_id ?? null, neighbourhood ?? null]
  );
  res.status(201).json({ wishlist: rows[0] });
});

export default router;
