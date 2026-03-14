import { Router } from "express";
import { queryOne } from "../db";

const router = Router();

/** Public stats: number of completed exchanges (items passed on). Used for "prevented X purchases" counter. */
router.get("/impact", async (_req, res) => {
  const row = await queryOne<{ count: string }>(
    "SELECT COUNT(*) AS count FROM circulations WHERE exchanged_at IS NOT NULL"
  );
  const preventedPurchases = parseInt(row?.count ?? "0", 10);
  res.json({ preventedPurchases });
});

export default router;
