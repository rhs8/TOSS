import { Router } from "express";
import { query, queryOne } from "../db";
import { requireAuth, type AuthRequest } from "../auth";
import { getCounts } from "../rules";

const router = Router();

/** Current user profile + counts. */
router.get("/me", requireAuth, async (req: AuthRequest, res) => {
  const user = req.user!;
  const counts = await getCounts(user.id);
  res.json({ user, counts });
});

/** Sign up: create user from Firebase UID + email. Institution domain verified by allowed list. */
router.post("/signup", async (req, res) => {
  const { firebase_uid, email, display_name, photo_url } = req.body;
  if (!firebase_uid || !email) {
    return res.status(400).json({ error: "firebase_uid and email required." });
  }
  const domain = email.split("@")[1]?.toLowerCase();
  const allowedDomains = (process.env.ALLOWED_EMAIL_DOMAINS || "sfu.ca,ubc.ca").split(",").map((d) => d.trim());
  if (!allowedDomains.includes(domain)) {
    return res.status(403).json({ error: "Institution email required (e.g. @sfu.ca)." });
  }
  const commitmentEndsAt = new Date();
  commitmentEndsAt.setMonth(commitmentEndsAt.getMonth() + 3);

  await query(
    `INSERT INTO users (firebase_uid, email, email_domain, display_name, photo_url, commitment_ends_at)
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT (firebase_uid) DO UPDATE SET
       email = EXCLUDED.email,
       email_domain = EXCLUDED.email_domain,
       display_name = COALESCE(EXCLUDED.display_name, users.display_name),
       photo_url = COALESCE(EXCLUDED.photo_url, users.photo_url),
       updated_at = NOW()`,
    [firebase_uid, email, domain, display_name ?? null, photo_url ?? null, commitmentEndsAt]
  );
  const user = await queryOne("SELECT * FROM users WHERE firebase_uid = $1", [firebase_uid]);
  res.status(201).json({ user });
});

export default router;
