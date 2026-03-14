import { Router } from "express";
import { query } from "../db";

const router = Router();

router.get("/", async (_req, res) => {
  const categories = await query("SELECT id, name, slug FROM categories ORDER BY name");
  res.json({ categories });
});

export default router;
