const router = require('express').Router();
const { param, query: qv } = require('express-validator');
const { query } = require('../db/pool');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

router.use(authenticate);

// ─── GET /api/insights/:locationId ───────────────────────────────────────────
// Returns 7-day time series + totals for dashboard cards
router.get('/:locationId',
  [
    param('locationId').isUUID(),
    qv('days').optional().isInt({ min: 1, max: 90 }),
  ],
  validate,
  async (req, res, next) => {
    try {
      // Verify ownership
      const { rows: loc } = await query(
        'SELECT id FROM locations WHERE id = $1 AND user_id = $2',
        [req.params.locationId, req.user.id]
      );
      if (!loc.length) return res.status(404).json({ error: 'Location not found' });

      const days = parseInt(req.query.days) || 7;

      const { rows: series } = await query(
        `SELECT metric_date, views, searches, calls, website_clicks
         FROM location_insights
         WHERE location_id = $1
           AND metric_date >= CURRENT_DATE - ($2 - 1) * INTERVAL '1 day'
         ORDER BY metric_date ASC`,
        [req.params.locationId, days]
      );

      // Fill missing dates with zeros (ensures chart always has full series)
      const filled = [];
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const found = series.find(r => r.metric_date.toISOString?.().split('T')[0] === dateStr ||
                                        String(r.metric_date).split('T')[0] === dateStr);
        filled.push(found || { metric_date: dateStr, views: 0, searches: 0, calls: 0, website_clicks: 0 });
      }

      // Totals
      const totals = filled.reduce((acc, row) => ({
        views: acc.views + Number(row.views),
        searches: acc.searches + Number(row.searches),
        calls: acc.calls + Number(row.calls),
        website_clicks: acc.website_clicks + Number(row.website_clicks),
      }), { views: 0, searches: 0, calls: 0, website_clicks: 0 });

      res.json({ series: filled, totals, days });
    } catch (err) { next(err); }
  }
);

// ─── POST /api/insights/:locationId/generate ─────────────────────────────────
// Simulates today's GBP metrics (would be replaced by real GBP API data)
router.post('/:locationId/generate',
  [param('locationId').isUUID()], validate,
  async (req, res, next) => {
    try {
      const { rows: loc } = await query(
        'SELECT id FROM locations WHERE id = $1 AND user_id = $2',
        [req.params.locationId, req.user.id]
      );
      if (!loc.length) return res.status(404).json({ error: 'Location not found' });

      const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
      const { rows: [row] } = await query(
        `INSERT INTO location_insights (location_id, metric_date, views, searches, calls, website_clicks)
         VALUES ($1, CURRENT_DATE, $2, $3, $4, $5)
         ON CONFLICT (location_id, metric_date)
         DO UPDATE SET views = EXCLUDED.views, searches = EXCLUDED.searches,
                       calls = EXCLUDED.calls, website_clicks = EXCLUDED.website_clicks
         RETURNING *`,
        [req.params.locationId, rand(200, 800), rand(100, 400), rand(20, 100), rand(40, 160)]
      );

      res.json({ insight: row, simulated: true });
    } catch (err) { next(err); }
  }
);

module.exports = router;
