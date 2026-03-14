import { Router } from "express";
import { query } from "../db";
import { requireAuth, type AuthRequest } from "../auth";

const router = Router();

/** List community circles (for display). */
router.get("/", async (_req, res) => {
  const circles = await query(
    "SELECT id, name, slug FROM community_circles ORDER BY name"
  );
  res.json({ circles });
});

/** Circles the current user belongs to. */
router.get("/mine", requireAuth, async (req: AuthRequest, res) => {
  const circles = await query(
    `SELECT c.id, c.name, c.slug FROM community_circles c
     JOIN user_circles uc ON uc.circle_id = c.id
     WHERE uc.user_id = $1`,
    [req.user!.id]
  );
  res.json({ circles });
});

export default router;
