import { Router } from "express";
import { query, queryOne } from "../db";
import { requireAuth, type AuthRequest } from "../auth";
import { getCounts } from "../rules";
import type { User } from "../types";

const router = Router();

/** Current user profile + counts. */
router.get("/me", requireAuth, async (req: AuthRequest, res) => {
  const user = req.user!;
  const counts = await getCounts(user.id);
  res.json({ user, counts });
});

/** Sign up: create user from Firebase UID + email. Institution domain verified by allowed list when set. */
router.post("/signup", async (req, res) => {
  const { firebase_uid, email, display_name, photo_url } = req.body;
  const rawEmail = typeof email === "string" ? email.trim() : "";
  if (!firebase_uid || !rawEmail) {
    return res.status(400).json({ error: "firebase_uid and email required." });
  }
  if (!rawEmail.includes("@")) {
    return res.status(400).json({ error: "Invalid email." });
  }
  const domain = rawEmail.split("@")[1]?.toLowerCase() || "";
  const allowedDomainsEnv = (process.env.ALLOWED_EMAIL_DOMAINS || "").trim();
  if (allowedDomainsEnv) {
    const allowedDomains = allowedDomainsEnv.split(",").map((d) => d.trim()).filter(Boolean);
    if (allowedDomains.length > 0 && !allowedDomains.includes(domain)) {
      return res.status(403).json({ error: "Email domain not allowed." });
    }
  }
  const commitmentEndsAt = new Date();
  commitmentEndsAt.setMonth(commitmentEndsAt.getMonth() + 3);

  try {
    await query(
      `INSERT INTO users (firebase_uid, email, email_domain, display_name, photo_url, commitment_ends_at)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (firebase_uid) DO UPDATE SET
         email = EXCLUDED.email,
         email_domain = EXCLUDED.email_domain,
         display_name = COALESCE(EXCLUDED.display_name, users.display_name),
         photo_url = COALESCE(EXCLUDED.photo_url, users.photo_url),
         updated_at = NOW()`,
      [firebase_uid, rawEmail, domain, display_name ?? null, photo_url ?? null, commitmentEndsAt]
    );
  } catch (err: unknown) {
    const code = (err as { code?: string })?.code;
    if (code === "23505") {
      return res.status(400).json({ error: "Email already registered." });
    }
    console.error("Signup error:", err);
    return res.status(500).json({ error: "Sign up failed. Please try again." });
  }

  const user = await queryOne<User>("SELECT * FROM users WHERE firebase_uid = $1", [firebase_uid]);
  if (!user) {
    return res.status(500).json({ error: "Sign up failed. Please try again." });
  }
  if (domain) {
    const circle = await queryOne<{ id: string }>(
      "SELECT id FROM community_circles WHERE $1 = ANY(allowed_email_domains)",
      [domain]
    );
    if (circle) {
      await query(
        "INSERT INTO user_circles (user_id, circle_id) VALUES ($1, $2) ON CONFLICT (user_id, circle_id) DO NOTHING",
        [user.id, circle.id]
      );
    }
  }
  res.status(201).json({ user });
});

export default router;
