const router = require('express').Router();
const { body, param, query: qv } = require('express-validator');
const { query } = require('../db/pool');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

router.use(authenticate);

/** Verify caller owns the location */
async function ownsLocation(locationId, userId) {
  const { rows } = await query(
    'SELECT id FROM locations WHERE id = $1 AND user_id = $2',
    [locationId, userId]
  );
  return rows.length > 0;
}

// ─── GET /api/locations/:locationId/reviews ───────────────────────────────────
router.get('/:locationId/reviews',
  [
    param('locationId').isUUID(),
    qv('page').optional().isInt({ min: 1 }),
    qv('limit').optional().isInt({ min: 1, max: 50 }),
    qv('filter').optional().isIn(['all', 'replied', 'pending']),
  ],
  validate,
  async (req, res, next) => {
    try {
      if (!(await ownsLocation(req.params.locationId, req.user.id))) {
        return res.status(404).json({ error: 'Location not found' });
      }

      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const offset = (page - 1) * limit;
      const filter = req.query.filter || 'all';

      let filterClause = '';
      if (filter === 'replied') filterClause = 'AND reply_text IS NOT NULL';
      if (filter === 'pending') filterClause = 'AND reply_text IS NULL';

      const { rows } = await query(
        `SELECT id, reviewer_name, rating, comment, review_date,
                reply_text, replied_at, created_at
         FROM reviews
         WHERE location_id = $1 ${filterClause}
         ORDER BY review_date DESC
         LIMIT $2 OFFSET $3`,
        [req.params.locationId, limit, offset]
      );

      const { rows: [{ count }] } = await query(
        `SELECT COUNT(*) FROM reviews WHERE location_id = $1 ${filterClause}`,
        [req.params.locationId]
      );

      res.json({
        reviews: rows,
        pagination: { page, limit, total: parseInt(count), pages: Math.ceil(count / limit) },
      });
    } catch (err) { next(err); }
  }
);

// ─── POST /api/locations/:locationId/reviews (add mock review) ────────────────
router.post('/:locationId/reviews',
  [
    param('locationId').isUUID(),
    body('reviewer_name').trim().notEmpty(),
    body('rating').isInt({ min: 1, max: 5 }),
    body('comment').optional().trim(),
  ],
  validate,
  async (req, res, next) => {
    try {
      if (!(await ownsLocation(req.params.locationId, req.user.id))) {
        return res.status(404).json({ error: 'Location not found' });
      }
      const { reviewer_name, rating, comment } = req.body;
      const { rows: [review] } = await query(
        `INSERT INTO reviews (location_id, reviewer_name, rating, comment)
         VALUES ($1,$2,$3,$4) RETURNING *`,
        [req.params.locationId, reviewer_name, rating, comment || null]
      );

      // Update location rating average
      await query(
        `UPDATE locations SET
           rating = (SELECT ROUND(AVG(rating)::numeric, 1) FROM reviews WHERE location_id = $1),
           review_count = (SELECT COUNT(*) FROM reviews WHERE location_id = $1)
         WHERE id = $1`,
        [req.params.locationId]
      );

      res.status(201).json({ review });
    } catch (err) { next(err); }
  }
);

// ─── POST /api/locations/:locationId/reviews/:reviewId/reply ─────────────────
router.post('/:locationId/reviews/:reviewId/reply',
  [
    param('locationId').isUUID(),
    param('reviewId').isUUID(),
    body('reply_text').trim().notEmpty().withMessage('Reply text is required'),
  ],
  validate,
  async (req, res, next) => {
    try {
      if (!(await ownsLocation(req.params.locationId, req.user.id))) {
        return res.status(404).json({ error: 'Location not found' });
      }

      const { rows } = await query(
        `UPDATE reviews SET reply_text = $1, replied_at = NOW()
         WHERE id = $2 AND location_id = $3
         RETURNING *`,
        [req.body.reply_text, req.params.reviewId, req.params.locationId]
      );

      if (!rows.length) return res.status(404).json({ error: 'Review not found' });
      res.json({ review: rows[0] });
    } catch (err) { next(err); }
  }
);

// ─── DELETE /api/locations/:locationId/reviews/:reviewId/reply ───────────────
router.delete('/:locationId/reviews/:reviewId/reply',
  [param('locationId').isUUID(), param('reviewId').isUUID()],
  validate,
  async (req, res, next) => {
    try {
      if (!(await ownsLocation(req.params.locationId, req.user.id))) {
        return res.status(404).json({ error: 'Location not found' });
      }
      const { rows } = await query(
        `UPDATE reviews SET reply_text = NULL, replied_at = NULL
         WHERE id = $1 AND location_id = $2 RETURNING id`,
        [req.params.reviewId, req.params.locationId]
      );
      if (!rows.length) return res.status(404).json({ error: 'Review not found' });
      res.json({ message: 'Reply removed' });
    } catch (err) { next(err); }
  }
);

module.exports = router;
