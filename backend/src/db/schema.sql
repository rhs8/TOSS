-- Toss: money-free community exchange
-- Rules: post before browse, 1 post = 1 borrow, min 1 post/month, 3-month commitment, items circulate (biography)

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  firebase_uid TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  email_domain TEXT NOT NULL,
  display_name TEXT,
  photo_url TEXT,
  commitment_ends_at TIMESTAMPTZ,
  stripe_customer_id TEXT,
  card_on_file BOOLEAN DEFAULT FALSE,
  suspended_until TIMESTAMPTZ,
  banned BOOLEAN DEFAULT FALSE,
  circulation_offence_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS community_circles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  allowed_email_domains TEXT[] NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_circles (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  circle_id UUID NOT NULL REFERENCES community_circles(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, circle_id)
);

CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  circle_id UUID REFERENCES community_circles(id) ON DELETE SET NULL,
  category_id UUID NOT NULL REFERENCES categories(id),
  title TEXT NOT NULL,
  description TEXT,
  photo_url TEXT,
  neighbourhood TEXT,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  status TEXT NOT NULL DEFAULT 'pending_review',
  moderation_notes TEXT,
  seasonal_collection TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT status_check CHECK (status IN ('pending_review', 'live', 'in_transit', 'held', 'removed'))
);

CREATE TABLE IF NOT EXISTS circulations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  from_user_id UUID NOT NULL REFERENCES users(id),
  to_user_id UUID NOT NULL REFERENCES users(id),
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ,
  exchanged_at TIMESTAMPTZ,
  handoff_notes TEXT,
  requester_availability TEXT,
  meeting_spots TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT no_self_circulation CHECK (from_user_id != to_user_id)
);

CREATE TABLE IF NOT EXISTS item_holders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  circulation_id UUID REFERENCES circulations(id),
  received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  passed_on_at TIMESTAMPTZ,
  UNIQUE (item_id, user_id, received_at)
);

CREATE TABLE IF NOT EXISTS wishlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category_id UUID REFERENCES categories(id),
  neighbourhood TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS suspensions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  suspended_until TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_items_owner ON items(owner_id);
CREATE INDEX idx_items_status ON items(status);
CREATE INDEX idx_items_category ON items(category_id);
CREATE INDEX idx_items_neighbourhood ON items(neighbourhood);
CREATE INDEX idx_circulations_item ON circulations(item_id);
CREATE INDEX idx_circulations_to_user ON circulations(to_user_id);
CREATE INDEX idx_item_holders_item ON item_holders(item_id);
CREATE INDEX idx_users_email_domain ON users(email_domain);
CREATE INDEX idx_users_banned ON users(banned) WHERE banned = FALSE;

-- Optional: for existing DBs that had circulations before these columns existed
ALTER TABLE circulations ADD COLUMN IF NOT EXISTS requester_availability TEXT;
ALTER TABLE circulations ADD COLUMN IF NOT EXISTS meeting_spots TEXT;
