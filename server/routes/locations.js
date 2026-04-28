const router = require('express').Router();
const { body, param, query: qv } = require('express-validator');
const { query } = require('../db/pool');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

// All location routes require auth
router.use(authenticate);

// ─── GET /api/locations ───────────────────────────────────────────────────────
router.get('/', async (req, res, next) => {
  try {
    const { rows } = await query(
      `SELECT id, name, address, phone, website, category, hours, status,
              rating, review_count, post_count, created_at, updated_at
       FROM locations
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [req.user.id]
    );
    res.json({ locations: rows, total: rows.length });
  } catch (err) { next(err); }
});

// ─── GET /api/locations/:id ───────────────────────────────────────────────────
router.get('/:id',
  [param('id').isUUID()], validate,
  async (req, res, next) => {
    try {
      const { rows } = await query(
        `SELECT id, name, address, phone, website, category, hours, status,
                rating, review_count, post_count, created_at, updated_at
         FROM locations WHERE id = $1 AND user_id = $2`,
        [req.params.id, req.user.id]
      );
      if (!rows.length) return res.status(404).json({ error: 'Location not found' });
      res.json({ location: rows[0] });
    } catch (err) { next(err); }
  }
);

// ─── POST /api/locations ──────────────────────────────────────────────────────
router.post('/',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('address').optional().trim(),
    body('phone').optional().trim(),
    body('website').optional().isURL().withMessage('Website must be a valid URL'),
    body('category').optional().trim(),
    body('hours').optional().trim(),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { name, address, phone, website, category, hours } = req.body;
      const { rows: [loc] } = await query(
        `INSERT INTO locations (user_id, name, address, phone, website, category, hours)
         VALUES ($1,$2,$3,$4,$5,$6,$7)
         RETURNING *`,
        [req.user.id, name, address || null, phone || null, website || null, category || null, hours || null]
      );
      res.status(201).json({ location: loc });
    } catch (err) { next(err); }
  }
);

// ─── PUT /api/locations/:id ───────────────────────────────────────────────────
router.put('/:id',
  [
    param('id').isUUID(),
    body('name').optional().trim().notEmpty(),
    body('website').optional().isURL(),
    body('status').optional().isIn(['active', 'paused', 'suspended']),
  ],
  validate,
  async (req, res, next) => {
    try {
      // Build dynamic SET clause from allowed fields
      const allowed = ['name', 'address', 'phone', 'website', 'category', 'hours', 'status'];
      const updates = [];
      const values = [];
      let idx = 1;

      for (const field of allowed) {
        if (req.body[field] !== undefined) {
          updates.push(`${field} = $${idx++}`);
          values.push(req.body[field]);
        }
      }

      if (!updates.length) {
        return res.status(400).json({ error: 'No valid fields to update' });
      }

      values.push(req.params.id, req.user.id);
      const { rows } = await query(
        `UPDATE locations SET ${updates.join(', ')}
         WHERE id = $${idx++} AND user_id = $${idx}
         RETURNING *`,
        values
      );

      if (!rows.length) return res.status(404).json({ error: 'Location not found' });
      res.json({ location: rows[0] });
    } catch (err) { next(err); }
  }
);

// ─── DELETE /api/locations/:id ────────────────────────────────────────────────
router.delete('/:id',
  [param('id').isUUID()], validate,
  async (req, res, next) => {
    try {
      const { rowCount } = await query(
        'DELETE FROM locations WHERE id = $1 AND user_id = $2',
        [req.params.id, req.user.id]
      );
      if (!rowCount) return res.status(404).json({ error: 'Location not found' });
      res.json({ message: 'Location deleted' });
    } catch (err) { next(err); }
  }
);

module.exports = router;
