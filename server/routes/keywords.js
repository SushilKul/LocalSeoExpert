const router = require('express').Router();
const { body, param, query: qv } = require('express-validator');
const { query } = require('../db/pool');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

router.use(authenticate);

async function ownsLocation(locationId, userId) {
  const { rows } = await query(
    'SELECT id FROM locations WHERE id = $1 AND user_id = $2',
    [locationId, userId]
  );
  return rows.length > 0;
}

// ─── GET /api/keywords/:locationId ───────────────────────────────────────────
router.get('/:locationId',
  [param('locationId').isUUID()], validate,
  async (req, res, next) => {
    try {
      if (!(await ownsLocation(req.params.locationId, req.user.id))) {
        return res.status(404).json({ error: 'Location not found' });
      }

      // Fetch keywords with latest rank + rank history (last 10 snapshots)
      const { rows } = await query(
        `SELECT
           k.id,
           k.keyword,
           k.created_at,
           (SELECT rank FROM keyword_ranks WHERE keyword_id = k.id ORDER BY snapshot_date DESC LIMIT 1) AS current_rank,
           (SELECT snapshot_date FROM keyword_ranks WHERE keyword_id = k.id ORDER BY snapshot_date DESC LIMIT 1) AS last_updated,
           COALESCE(
             (SELECT json_agg(r ORDER BY r.snapshot_date ASC)
              FROM (
                SELECT rank, snapshot_date
                FROM keyword_ranks
                WHERE keyword_id = k.id
                ORDER BY snapshot_date DESC
                LIMIT 10
              ) r
             ), '[]'
           ) AS rank_history
         FROM keywords k
         WHERE k.location_id = $1
         ORDER BY k.created_at DESC`,
        [req.params.locationId]
      );

      // Compute trend (compare latest vs 2nd-to-last rank)
      const withTrend = rows.map(k => {
        const hist = k.rank_history;
        let trend = 'flat';
        if (hist.length >= 2) {
          const latest = hist[hist.length - 1].rank;
          const prev = hist[hist.length - 2].rank;
          if (latest < prev) trend = 'up';       // lower rank number = better
          else if (latest > prev) trend = 'down';
        }
        return { ...k, trend };
      });

      res.json({ keywords: withTrend, total: withTrend.length });
    } catch (err) { next(err); }
  }
);

// ─── POST /api/keywords/:locationId ──────────────────────────────────────────
router.post('/:locationId',
  [
    param('locationId').isUUID(),
    body('keyword').trim().notEmpty().withMessage('Keyword is required'),
  ],
  validate,
  async (req, res, next) => {
    try {
      if (!(await ownsLocation(req.params.locationId, req.user.id))) {
        return res.status(404).json({ error: 'Location not found' });
      }

      const { keyword } = req.body;

      // Check duplicate
      const dup = await query(
        'SELECT id FROM keywords WHERE location_id = $1 AND keyword = $2',
        [req.params.locationId, keyword.toLowerCase()]
      );
      if (dup.rows.length) {
        return res.status(409).json({ error: 'Keyword already tracked for this location' });
      }

      const { rows: [kw] } = await query(
        'INSERT INTO keywords (location_id, keyword) VALUES ($1,$2) RETURNING *',
        [req.params.locationId, keyword.toLowerCase()]
      );

      // Simulate an initial rank (MVP — replace with real SERP API later)
      const simulatedRank = Math.floor(Math.random() * 30) + 1;
      await query(
        'INSERT INTO keyword_ranks (keyword_id, rank) VALUES ($1,$2)',
        [kw.id, simulatedRank]
      );

      res.status(201).json({
        keyword: { ...kw, current_rank: simulatedRank, rank_history: [{ rank: simulatedRank, snapshot_date: new Date().toISOString().split('T')[0] }], trend: 'flat' }
      });
    } catch (err) { next(err); }
  }
);

// ─── POST /api/keywords/:locationId/:keywordId/snapshot ──────────────────────
// Simulates a fresh rank check (would call SERP API in production)
router.post('/:locationId/:keywordId/snapshot',
  [param('locationId').isUUID(), param('keywordId').isUUID()], validate,
  async (req, res, next) => {
    try {
      if (!(await ownsLocation(req.params.locationId, req.user.id))) {
        return res.status(404).json({ error: 'Location not found' });
      }

      const { rows } = await query(
        'SELECT id FROM keywords WHERE id = $1 AND location_id = $2',
        [req.params.keywordId, req.params.locationId]
      );
      if (!rows.length) return res.status(404).json({ error: 'Keyword not found' });

      // Get last rank and nudge it slightly (simulate change)
      const { rows: [last] } = await query(
        'SELECT rank FROM keyword_ranks WHERE keyword_id = $1 ORDER BY snapshot_date DESC LIMIT 1',
        [req.params.keywordId]
      );
      const delta = Math.floor(Math.random() * 5) - 2; // -2 to +2
      const newRank = Math.max(1, (last?.rank || 10) + delta);

      const { rows: [snap] } = await query(
        `INSERT INTO keyword_ranks (keyword_id, rank)
         VALUES ($1,$2)
         ON CONFLICT DO NOTHING
         RETURNING *`,
        [req.params.keywordId, newRank]
      );

      res.json({ snapshot: snap, simulated: true });
    } catch (err) { next(err); }
  }
);

// ─── DELETE /api/keywords/:locationId/:keywordId ──────────────────────────────
router.delete('/:locationId/:keywordId',
  [param('locationId').isUUID(), param('keywordId').isUUID()], validate,
  async (req, res, next) => {
    try {
      if (!(await ownsLocation(req.params.locationId, req.user.id))) {
        return res.status(404).json({ error: 'Location not found' });
      }
      const { rowCount } = await query(
        'DELETE FROM keywords WHERE id = $1 AND location_id = $2',
        [req.params.keywordId, req.params.locationId]
      );
      if (!rowCount) return res.status(404).json({ error: 'Keyword not found' });
      res.json({ message: 'Keyword removed' });
    } catch (err) { next(err); }
  }
);

module.exports = router;
