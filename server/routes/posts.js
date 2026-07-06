const router = require('express').Router();
const { body, param } = require('express-validator');
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

// ─── GET /api/locations/:locationId/posts ─────────────────────────────────────
router.get('/:locationId/posts',
  [param('locationId').isUUID()], validate,
  async (req, res, next) => {
    try {
      if (!(await ownsLocation(req.params.locationId, req.user.id))) {
        return res.status(404).json({ error: 'Location not found' });
      }
      const { rows } = await query(
        `SELECT id, type, summary, cta_text, media_url, status, created_at, updated_at
         FROM posts
         WHERE location_id = $1 AND status != 'deleted'
         ORDER BY created_at DESC`,
        [req.params.locationId]
      );
      res.json({ posts: rows, total: rows.length });
    } catch (err) { next(err); }
  }
);

// ─── POST /api/locations/:locationId/posts ────────────────────────────────────
router.post('/:locationId/posts',
  [
    param('locationId').isUUID(),
    body('type').isIn(['WHATS_NEW', 'OFFER', 'EVENT', 'COVID']).withMessage('Invalid post type'),
    body('summary').trim().notEmpty().withMessage('Summary is required'),
    body('cta_text').optional().trim(),
    body('media_url').optional().isURL().withMessage('media_url must be a valid URL'),
  ],
  validate,
  async (req, res, next) => {
    try {
      if (!(await ownsLocation(req.params.locationId, req.user.id))) {
        return res.status(404).json({ error: 'Location not found' });
      }

      const { type, summary, cta_text, media_url } = req.body;
      const { rows: [post] } = await query(
        `INSERT INTO posts (location_id, type, summary, cta_text, media_url)
         VALUES ($1,$2,$3,$4,$5) RETURNING *`,
        [req.params.locationId, type, summary, cta_text || null, media_url || null]
      );

      // Increment post count on location
      await query(
        'UPDATE locations SET post_count = post_count + 1 WHERE id = $1',
        [req.params.locationId]
      );

      res.status(201).json({ post });
    } catch (err) { next(err); }
  }
);

// ─── PUT /api/locations/:locationId/posts/:postId ─────────────────────────────
router.put('/:locationId/posts/:postId',
  [
    param('locationId').isUUID(),
    param('postId').isUUID(),
    body('type').optional().isIn(['WHATS_NEW', 'OFFER', 'EVENT', 'COVID']),
    body('summary').optional().trim().notEmpty(),
    body('cta_text').optional().trim(),
    body('media_url').optional().isURL(),
    body('status').optional().isIn(['live', 'draft']),
  ],
  validate,
  async (req, res, next) => {
    try {
      if (!(await ownsLocation(req.params.locationId, req.user.id))) {
        return res.status(404).json({ error: 'Location not found' });
      }

      const allowed = ['type', 'summary', 'cta_text', 'media_url', 'status'];
      const updates = [];
      const values = [];
      let idx = 1;

      for (const field of allowed) {
        if (req.body[field] !== undefined) {
          updates.push(`${field} = $${idx++}`);
          values.push(req.body[field]);
        }
      }

      if (!updates.length) return res.status(400).json({ error: 'No valid fields to update' });

      values.push(req.params.postId, req.params.locationId);
      const { rows } = await query(
        `UPDATE posts SET ${updates.join(', ')}
         WHERE id = $${idx++} AND location_id = $${idx} AND status != 'deleted'
         RETURNING *`,
        values
      );

      if (!rows.length) return res.status(404).json({ error: 'Post not found' });
      res.json({ post: rows[0] });
    } catch (err) { next(err); }
  }
);

// ─── DELETE /api/locations/:locationId/posts/:postId ─────────────────────────
router.delete('/:locationId/posts/:postId',
  [param('locationId').isUUID(), param('postId').isUUID()], validate,
  async (req, res, next) => {
    try {
      if (!(await ownsLocation(req.params.locationId, req.user.id))) {
        return res.status(404).json({ error: 'Location not found' });
      }
      // Soft delete
      const { rows } = await query(
        `UPDATE posts SET status = 'deleted'
         WHERE id = $1 AND location_id = $2 AND status != 'deleted'
         RETURNING id`,
        [req.params.postId, req.params.locationId]
      );
      if (!rows.length) return res.status(404).json({ error: 'Post not found' });

      await query(
        'UPDATE locations SET post_count = GREATEST(post_count - 1, 0) WHERE id = $1',
        [req.params.locationId]
      );

      res.json({ message: 'Post deleted' });
    } catch (err) { next(err); }
  }
);

module.exports = router;
