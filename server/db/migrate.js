require('dotenv').config();
const { query, testConnection } = require('./pool');

const RESET = process.argv.includes('--reset');

const DROP_ALL = `
  DROP TABLE IF EXISTS keyword_ranks CASCADE;
  DROP TABLE IF EXISTS keywords CASCADE;
  DROP TABLE IF EXISTS post_media CASCADE;
  DROP TABLE IF EXISTS posts CASCADE;
  DROP TABLE IF EXISTS review_replies CASCADE;
  DROP TABLE IF EXISTS reviews CASCADE;
  DROP TABLE IF EXISTS location_insights CASCADE;
  DROP TABLE IF EXISTS locations CASCADE;
  DROP TABLE IF EXISTS users CASCADE;
`;

const SCHEMA = `
-- ─── Users ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email       TEXT UNIQUE NOT NULL,
  username    TEXT UNIQUE,
  password    TEXT NOT NULL,
  full_name   TEXT NOT NULL,
  role        TEXT NOT NULL DEFAULT 'Business Owner'
                CHECK (role IN ('Business Owner','Agency Manager','Marketing Manager')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Locations ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS locations (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  address     TEXT,
  phone       TEXT,
  website     TEXT,
  category    TEXT,
  hours       TEXT,
  status      TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','paused','suspended')),
  rating      NUMERIC(3,1) DEFAULT 0,
  review_count INT DEFAULT 0,
  post_count  INT DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_locations_user_id ON locations(user_id);

-- ─── Reviews ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reviews (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id   UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  reviewer_name TEXT NOT NULL,
  rating        SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment       TEXT,
  review_date   DATE NOT NULL DEFAULT CURRENT_DATE,
  reply_text    TEXT,
  replied_at    TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_reviews_location_id ON reviews(location_id);

-- ─── Posts ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS posts (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  type        TEXT NOT NULL DEFAULT 'WHATS_NEW'
                CHECK (type IN ('WHATS_NEW','OFFER','EVENT','COVID')),
  summary     TEXT NOT NULL,
  cta_text    TEXT,
  media_url   TEXT,
  status      TEXT NOT NULL DEFAULT 'live' CHECK (status IN ('live','draft','deleted')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_posts_location_id ON posts(location_id);

-- ─── Keywords ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS keywords (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  keyword     TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(location_id, keyword)
);
CREATE INDEX IF NOT EXISTS idx_keywords_location_id ON keywords(location_id);

-- ─── Keyword rank snapshots ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS keyword_ranks (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword_id  UUID NOT NULL REFERENCES keywords(id) ON DELETE CASCADE,
  rank        INT NOT NULL,
  snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_keyword_ranks_keyword_id ON keyword_ranks(keyword_id);

-- ─── Location insights (simulated GBP metrics) ───────────────────────────────
CREATE TABLE IF NOT EXISTS location_insights (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  metric_date DATE NOT NULL DEFAULT CURRENT_DATE,
  views       INT DEFAULT 0,
  searches    INT DEFAULT 0,
  calls       INT DEFAULT 0,
  website_clicks INT DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(location_id, metric_date)
);
CREATE INDEX IF NOT EXISTS idx_insights_location_id ON location_insights(location_id);

-- ─── Auto-update updated_at ───────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_users_updated ON users;
CREATE TRIGGER trg_users_updated BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_locations_updated ON locations;
CREATE TRIGGER trg_locations_updated BEFORE UPDATE ON locations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_posts_updated ON posts;
CREATE TRIGGER trg_posts_updated BEFORE UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
`;

async function migrate() {
  await testConnection();

  if (RESET) {
    console.log('⚠️   --reset flag detected: dropping all tables...');
    await query(DROP_ALL);
    console.log('✅  All tables dropped');
  }

  await query(SCHEMA);
  console.log('✅  Migration complete — all tables ready');
  process.exit(0);
}

migrate().catch((err) => {
  console.error('❌  Migration failed:', err.message);
  process.exit(1);
});
