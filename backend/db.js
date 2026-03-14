const Database = require("better-sqlite3");
const path = require("path");

const db = new Database(path.join(__dirname, "toss.db"));

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    commitment_end INTEGER NOT NULL DEFAULT 0,
    card_on_file INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER DEFAULT (strftime('%s','now'))
  );
  CREATE TABLE IF NOT EXISTS listings (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT,
    owner_id TEXT NOT NULL,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at INTEGER DEFAULT (strftime('%s','now')),
    FOREIGN KEY (owner_id) REFERENCES users(id)
  );
  CREATE TABLE IF NOT EXISTS exchanges (
    id TEXT PRIMARY KEY,
    listing_id TEXT NOT NULL,
    receiver_id TEXT NOT NULL,
    lender_id TEXT NOT NULL,
    week_start INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    borrowed_at INTEGER DEFAULT (strftime('%s','now')),
    FOREIGN KEY (listing_id) REFERENCES listings(id),
    FOREIGN KEY (receiver_id) REFERENCES users(id),
    FOREIGN KEY (lender_id) REFERENCES users(id)
  );
`);

function id() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function getDemoUser() {
  const DEMO_ID = "demo-user-1";
  let user = db.prepare("SELECT * FROM users WHERE id = ?").get(DEMO_ID);
  if (!user) {
    db.prepare(
      "INSERT INTO users (id, email, name, commitment_end, card_on_file) VALUES (?, ?, ?, ?, ?)"
    ).run(DEMO_ID, "demo@toss.local", "Demo User", 0, 0);
    user = db.prepare("SELECT * FROM users WHERE id = ?").get(DEMO_ID);
  }
  return user;
}

function addMonths(date, months) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d.getTime();
}

function getWeekStart(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return Math.floor(d.getTime() / 1000);
}

function createListing(ownerId, title, description, category) {
  const listingId = id();
  const count = db.prepare("SELECT COUNT(*) AS c FROM listings WHERE owner_id = ?").get(ownerId).c;
  if (count === 0) {
    const end = addMonths(Date.now(), 6);
    db.prepare("UPDATE users SET commitment_end = ? WHERE id = ?").run(Math.floor(end / 1000), ownerId);
  }
  db.prepare(
    "INSERT INTO listings (id, title, description, category, owner_id) VALUES (?, ?, ?, ?, ?)"
  ).run(listingId, title, description || null, category || null, ownerId);
  return listingId;
}

function getListings(activeOnly = true) {
  const rows = db
    .prepare(
      `SELECT l.*, u.name AS owner_name FROM listings l LEFT JOIN users u ON l.owner_id = u.id ${activeOnly ? "WHERE l.is_active = 1" : ""} ORDER BY l.created_at DESC`
    )
    .all();
  return rows;
}

function getListing(listingId) {
  return db
    .prepare(
      "SELECT l.*, u.name AS owner_name FROM listings l LEFT JOIN users u ON l.owner_id = u.id WHERE l.id = ?"
    )
    .get(listingId);
}

function requestExchange(receiverId, listingId) {
  const listing = getListing(listingId);
  if (!listing || !listing.is_active) return { error: "Item not available" };
  if (listing.owner_id === receiverId) return { error: "Cannot request your own item" };
  const myCount = db.prepare("SELECT COUNT(*) AS c FROM listings WHERE owner_id = ?").get(receiverId).c;
  if (myCount === 0) return { error: "List an item first. You can't receive until you've put something up." };
  const user = db.prepare("SELECT commitment_end FROM users WHERE id = ?").get(receiverId);
  if (user.commitment_end > 0 && user.commitment_end < Math.floor(Date.now() / 1000)) {
    return { error: "Your commitment period has ended." };
  }
  const weekStart = getWeekStart(new Date());
  const existing = db
    .prepare("SELECT id FROM exchanges WHERE receiver_id = ? AND week_start = ? AND status = 'active'")
    .get(receiverId, weekStart);
  if (existing) return { error: "You already have an active exchange this week. One per week." };
  const exchangeId = id();
  db.prepare(
    "INSERT INTO exchanges (id, listing_id, receiver_id, lender_id, week_start) VALUES (?, ?, ?, ?, ?)"
  ).run(exchangeId, listingId, receiverId, listing.owner_id, weekStart);
  db.prepare("UPDATE listings SET is_active = 0 WHERE id = ?").run(listingId);
  return { ok: true };
}

function getMyListings(ownerId) {
  return db.prepare("SELECT * FROM listings WHERE owner_id = ? ORDER BY created_at DESC").all(ownerId);
}

function getProfile(ownerId) {
  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(ownerId);
  const listings = getMyListings(ownerId);
  return { user, listings };
}

module.exports = {
  db,
  id,
  getDemoUser,
  addMonths,
  getWeekStart,
  createListing,
  getListings,
  getListing,
  requestExchange,
  getMyListings,
  getProfile,
};
