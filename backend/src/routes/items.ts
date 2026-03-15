import { Router } from "express";
import { query, queryOne } from "../db";
import { optionalAuth, requireAuth, type AuthRequest } from "../auth";
import { canRequestItem, hasMinPostThisMonth, isAccessAllowed, isCommitmentValid } from "../rules";
import type { Item, Circulation } from "../types";

const router = Router();

/** List items (browse). Same items table as GET /mine (my postings); here we return every item with status 'live' so anything you post (and see in My postings) is findable here by other users. No owner filter. Optional: category, neighbourhood, seasonal. */
router.get("/", optionalAuth, async (req: AuthRequest, res) => {
  const user = req.user;
  const category = req.query.category as string | undefined;
  const neighbourhood = req.query.neighbourhood as string | undefined;
  const seasonal = req.query.seasonal as string | undefined;

  if (user) {
    const check = isAccessAllowed(user);
    if (!check.allowed) return res.status(403).json({ error: check.reason });
  }

  /* Same items table as /mine; status = 'live' means available for others to request */
  let sql = `
    SELECT i.*, cat.name AS category_name, u.display_name AS owner_name
    FROM items i
    JOIN categories cat ON cat.id = i.category_id
    JOIN users u ON u.id = i.owner_id
    WHERE i.status = 'live'
  `;
  const params: unknown[] = [];
  let n = 1;
  if (category) {
    sql += ` AND cat.slug = $${n}`;
    params.push(category);
    n++;
  }
  if (neighbourhood) {
    sql += ` AND i.neighbourhood = $${n}`;
    params.push(neighbourhood);
    n++;
  }
  if (seasonal) {
    sql += ` AND i.seasonal_collection = $${n}`;
    params.push(seasonal);
    n++;
  }
  sql += " ORDER BY i.created_at DESC";

  const items = await query(sql, params);
  res.json({ items });
});

/** List current user's items (my postings). */
router.get("/mine", requireAuth, async (req: AuthRequest, res) => {
  const user = req.user!;
  const items = await query(
    `SELECT i.*, cat.name AS category_name
     FROM items i
     JOIN categories cat ON cat.id = i.category_id
     WHERE i.owner_id = $1
     ORDER BY i.created_at DESC`,
    [user.id]
  );
  res.json({ items });
});

/** Get one item + biography (holders history). */
router.get("/:id", async (req, res) => {
  const item = await queryOne(
    `SELECT i.*, c.name AS category_name, u.display_name AS owner_name
     FROM items i
     JOIN categories c ON c.id = i.category_id
     JOIN users u ON u.id = i.owner_id
     WHERE i.id = $1`,
    [req.params.id]
  );
  if (!item) return res.status(404).json({ error: "Item not found." });

  const biography = await query(
    `SELECT ih.*, u.display_name
     FROM item_holders ih
     JOIN users u ON u.id = ih.user_id
     WHERE ih.item_id = $1
     ORDER BY ih.received_at ASC`,
    [req.params.id]
  );
  res.json({ item, biography });
});

/** Post new item. Status: pending_review until Gemini moderation. */
router.post("/", requireAuth, async (req: AuthRequest, res) => {
  const user = req.user!;
  const check = isAccessAllowed(user);
  if (!check.allowed) return res.status(403).json({ error: check.reason });
  const commitment = isCommitmentValid(user);
  if (!commitment.valid) return res.status(403).json({ error: commitment.reason });

  const { title, description, photo_url, category_id, neighbourhood, lat, lng, seasonal_collection } = req.body;
  if (!title || !category_id) {
    return res.status(400).json({ error: "Title and category required." });
  }

  /* New items go live immediately so they appear in both My postings and Browse for others to find. */
  const skipMod = process.env.SKIP_MODERATION?.toLowerCase();
  const status =
    process.env.NODE_ENV === "development" || skipMod === "1" || skipMod === "true"
      ? "live"
      : "pending_review";

  const rows = await query<Item>(
    `INSERT INTO items (owner_id, category_id, title, description, photo_url, neighbourhood, lat, lng, seasonal_collection, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     RETURNING *`,
    [
      user.id,
      category_id,
      title,
      description ?? null,
      photo_url ?? null,
      neighbourhood ?? null,
      lat ?? null,
      lng ?? null,
      seasonal_collection ?? null,
      status,
    ]
  );
  const item = rows[0]!;
  await query(
    `INSERT INTO item_holders (item_id, user_id, passed_on_at) VALUES ($1, $2, NULL)`,
    [item.id, user.id]
  );
  res.status(201).json({ item });
});

/** Delete own posting. Only owner can delete; removes the item from the database (and related circulations/holders via CASCADE). */
router.delete("/:id", requireAuth, async (req: AuthRequest, res) => {
  const user = req.user!;
  const item = await queryOne<Item>("SELECT id, owner_id FROM items WHERE id = $1", [req.params.id]);
  if (!item) return res.status(404).json({ error: "Item not found." });
  if (item.owner_id !== user.id) return res.status(403).json({ error: "You can only delete your own items." });
  await query("DELETE FROM items WHERE id = $1 AND owner_id = $2", [req.params.id, user.id]);
  res.status(200).json({ ok: true });
});

/** Request to receive an item (creates circulation, owner must confirm). */
router.post("/:id/request", requireAuth, async (req: AuthRequest, res) => {
  const user = req.user!;
  const check = isAccessAllowed(user);
  if (!check.allowed) return res.status(403).json({ error: check.reason });
  const canReq = await canRequestItem(user.id);
  if (!canReq.allowed) return res.status(403).json({ error: canReq.reason });
  const minPost = await hasMinPostThisMonth(user.id);
  if (!minPost.ok) return res.status(403).json({ error: minPost.reason });

  const item = await queryOne<Item>("SELECT * FROM items WHERE id = $1", [req.params.id]);
  if (!item) return res.status(404).json({ error: "Item not found." });
  if (item.status !== "live") return res.status(400).json({ error: "Item not available." });
  if (item.owner_id === user.id) return res.status(400).json({ error: "Cannot request your own item." });

  const existing = await queryOne(
    "SELECT id FROM circulations WHERE item_id = $1 AND exchanged_at IS NULL",
    [item.id]
  );
  if (existing) return res.status(400).json({ error: "Item already requested." });

  const { availability: requester_availability, meeting_spots } = req.body || {};
  const rows = await query<Circulation>(
    `INSERT INTO circulations (item_id, from_user_id, to_user_id, requester_availability, meeting_spots) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [item.id, item.owner_id, user.id, requester_availability ?? null, meeting_spots ?? null]
  );
  await query("UPDATE items SET status = 'in_transit' WHERE id = $1", [item.id]);
  res.status(201).json({ circulation: rows[0] });
});

/** Owner confirms handoff (exchange arranged). */
router.post("/:id/confirm/:circulationId", requireAuth, async (req: AuthRequest, res) => {
  const user = req.user!;
  const circ = await queryOne<Circulation>(
    "SELECT * FROM circulations WHERE id = $1 AND item_id = $2 AND from_user_id = $3",
    [req.params.circulationId, req.params.id, user.id]
  );
  if (!circ) return res.status(404).json({ error: "Circulation not found." });

  await query(
    "UPDATE circulations SET confirmed_at = NOW() WHERE id = $1",
    [req.params.circulationId]
  );
  res.json({ ok: true });
});

/** Mark item as circulated (new holder has it). Updates item holder history. */
router.post("/:id/circulated", requireAuth, async (req: AuthRequest, res) => {
  const user = req.user!;
  const { circulation_id, handoff_notes } = req.body;
  const circ = await queryOne<Circulation>(
    "SELECT * FROM circulations WHERE id = $1 AND item_id = $2 AND to_user_id = $3",
    [circulation_id, req.params.id, user.id]
  );
  if (!circ) return res.status(404).json({ error: "Circulation not found." });

  await query(
    "UPDATE circulations SET exchanged_at = NOW(), handoff_notes = $1 WHERE id = $2",
    [handoff_notes ?? null, circulation_id]
  );
  await query(
    "UPDATE item_holders SET passed_on_at = NOW() WHERE item_id = $1 AND user_id = $2",
    [req.params.id, circ.from_user_id]
  );
  await query(
    `INSERT INTO item_holders (item_id, user_id, circulation_id) VALUES ($1, $2, $3)`,
    [req.params.id, user.id, circulation_id]
  );
  await query(
    "UPDATE items SET owner_id = $1, status = 'held', updated_at = NOW() WHERE id = $2",
    [user.id, req.params.id]
  );
  res.json({ ok: true });
});

export default router;
