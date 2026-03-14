import { query, queryOne } from "./db";
import type { User, Counts } from "./types";

const CIRCULATION_DEADLINE_DAYS = 30;
const FIRST_OFFENCE_SUSPENSION_DAYS = 30;
const COMMITMENT_MONTHS = 3;
const MIN_POSTS_PER_MONTH = 1;

/** Get user's post count (items they've listed that went live) and borrow count (items they've received). */
export async function getCounts(userId: string): Promise<Counts> {
  const post = await queryOne<{ count: string }>(
    `SELECT COUNT(*) AS count FROM items WHERE owner_id = $1 AND status IN ('live','in_transit','held')`,
    [userId]
  );
  const borrow = await queryOne<{ count: string }>(
    `SELECT COUNT(*) AS count FROM circulations WHERE to_user_id = $1 AND exchanged_at IS NOT NULL`,
    [userId]
  );
  return {
    post_count: parseInt(post?.count ?? "0", 10),
    borrow_count: parseInt(borrow?.count ?? "0", 10),
  };
}

/** Block browse if post count is 0. */
export async function canBrowse(userId: string): Promise<{ allowed: boolean; reason?: string }> {
  const counts = await getCounts(userId);
  if (counts.post_count === 0) {
    return { allowed: false, reason: "Post at least one item before browsing." };
  }
  return { allowed: true };
}

/** Block new request if borrow count >= post count. */
export async function canRequestItem(userId: string): Promise<{ allowed: boolean; reason?: string }> {
  const counts = await getCounts(userId);
  if (counts.borrow_count >= counts.post_count) {
    return {
      allowed: false,
      reason: `You can only receive as many items as you've posted (${counts.post_count}). Based on need, not value — post more to borrow more.`,
    };
  }
  return { allowed: true };
}

/** Minimum 1 post per month (rolling). If user hasn't posted in last 30 days, they should post before borrowing again. */
export async function hasMinPostThisMonth(userId: string): Promise<{ ok: boolean; reason?: string }> {
  const row = await queryOne<{ count: string }>(
    `SELECT COUNT(*) AS count FROM items WHERE owner_id = $1 AND created_at > NOW() - INTERVAL '30 days'`,
    [userId]
  );
  const count = parseInt(row?.count ?? "0", 10);
  if (count < MIN_POSTS_PER_MONTH) {
    return { ok: false, reason: "Minimum 1 post per month. Post an item to keep your account in good standing." };
  }
  return { ok: true };
}

/** Check user is not suspended or banned. */
export function isAccessAllowed(user: User): { allowed: boolean; reason?: string } {
  if (user.banned) return { allowed: false, reason: "Account permanently banned." };
  if (user.suspended_until && new Date(user.suspended_until) > new Date()) {
    return { allowed: false, reason: `Account suspended until ${user.suspended_until}.` };
  }
  return { allowed: true };
}

/** Check commitment is valid (3-month renewable). */
export function isCommitmentValid(user: User): { valid: boolean; reason?: string } {
  if (!user.commitment_ends_at) return { valid: false, reason: "No active commitment." };
  if (new Date(user.commitment_ends_at) < new Date()) {
    return { valid: false, reason: "Commitment expired. Renew for 3 months." };
  }
  return { valid: true };
}

/** Apply 30-day suspension for first offence; ban + charge for second. */
export async function recordCirculationOffence(userId: string): Promise<void> {
  const user = await queryOne<User>("SELECT * FROM users WHERE id = $1", [userId]);
  if (!user) return;
  const count = (user.circulation_offence_count ?? 0) + 1;
  if (count === 1) {
    const until = new Date();
    until.setDate(until.getDate() + FIRST_OFFENCE_SUSPENSION_DAYS);
    await query(
      "UPDATE users SET circulation_offence_count = $1, suspended_until = $2, updated_at = NOW() WHERE id = $3",
      [count, until.toISOString(), userId]
    );
  } else {
    await query(
      "UPDATE users SET circulation_offence_count = $1, banned = TRUE, suspended_until = NULL, updated_at = NOW() WHERE id = $2",
      [count, userId]
    );
    // TODO: Stripe charge via webhook or service
  }
}

/** Flag users who haven't passed on an item within 30 days (run via cron/job). */
export async function flagStaleHolders(): Promise<void> {
  const rows = await query<{ circulation_id: string; to_user_id: string }>(
    `SELECT c.id AS circulation_id, c.to_user_id
     FROM circulations c
     WHERE c.exchanged_at IS NULL AND c.confirmed_at IS NOT NULL
     AND c.confirmed_at < NOW() - INTERVAL '${CIRCULATION_DEADLINE_DAYS} days'`
  );
  for (const r of rows) {
    await recordCirculationOffence(r.to_user_id);
  }
}

/** Extract email domain for institution verification (e.g. user@sfu.ca -> sfu.ca). */
export function getEmailDomain(email: string): string {
  const part = email.split("@")[1];
  return part?.toLowerCase() ?? "";
}
