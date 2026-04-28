const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body } = require('express-validator');
const { query } = require('../db/pool');
const { validate } = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');

// ─── POST /api/auth/register ──────────────────────────────────────────────────
router.post('/register',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('full_name').trim().notEmpty().withMessage('Full name required'),
    body('role').optional().isIn(['Business Owner', 'Agency Manager', 'Marketing Manager']),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { email, password, full_name, role = 'Business Owner', username } = req.body;

      // Check duplicate
      const existing = await query('SELECT id FROM users WHERE email = $1', [email]);
      if (existing.rows.length) {
        return res.status(409).json({ error: 'Email already registered' });
      }

      const hashed = await bcrypt.hash(password, 12);
      const { rows: [user] } = await query(`
        INSERT INTO users (email, username, password, full_name, role)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, email, full_name, role, created_at
      `, [email, username || null, hashed, full_name, role]);

      const token = signToken(user.id);

      res.status(201).json({ user: sanitize(user), token });
    } catch (err) { next(err); }
  }
);

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
router.post('/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { email, password } = req.body;

      const { rows } = await query(
        'SELECT id, email, full_name, role, password FROM users WHERE email = $1',
        [email]
      );

      const user = rows[0];
      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      const token = signToken(user.id);
      res.json({ user: sanitize(user), token });
    } catch (err) { next(err); }
  }
);

// ─── GET /api/auth/me ─────────────────────────────────────────────────────────
router.get('/me', authenticate, (req, res) => {
  res.json({ user: req.user });
});

// ─── POST /api/auth/forgot-password (stub) ───────────────────────────────────
router.post('/forgot-password',
  [body('email').isEmail().normalizeEmail()],
  validate,
  async (req, res, next) => {
    try {
      const { rows } = await query('SELECT id FROM users WHERE email = $1', [req.body.email]);
      // Always return 200 to avoid email enumeration
      if (rows.length) {
        // TODO: replace stub with real email service
        console.log(`[STUB] Password reset requested for ${req.body.email}`);
      }
      res.json({ message: 'If that email exists, a reset link has been sent.' });
    } catch (err) { next(err); }
  }
);

// ─── Helpers ─────────────────────────────────────────────────────────────────
function signToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  });
}

function sanitize(user) {
  const { password, ...safe } = user;
  return safe;
}

module.exports = router;
