const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,                  // max pool size
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

pool.on('error', (err) => {
  console.error('Unexpected PostgreSQL pool error:', err.message);
});

/**
 * Execute a query. Pass params as array for parameterised queries.
 * Usage: await query('SELECT * FROM users WHERE id = $1', [userId])
 */
async function query(text, params) {
  const start = Date.now();
  const res = await pool.query(text, params);
  if (process.env.NODE_ENV === 'development') {
    console.log(`  [DB] ${text.slice(0, 80)}  — ${Date.now() - start}ms`);
  }
  return res;
}

/** Get a client for transactions */
async function getClient() {
  return pool.connect();
}

/** Verify DB connectivity on startup */
async function testConnection() {
  const client = await pool.connect();
  try {
    await client.query('SELECT 1');
    console.log('✅  PostgreSQL connected');
  } finally {
    client.release();
  }
}

module.exports = { query, getClient, testConnection };
