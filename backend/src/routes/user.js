import express from 'express';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /api/user/profile
 *
 * Protected route used for testing authentication middleware.
 *
 * Requires:
 *   Authorization: Bearer <valid_token>
 *
 * Returns:
 *   {
 *     user: {
 *       id: string,
 *       username: string
 *     }
 *   }
 */
router.get('/profile', authenticate, (req, res) => {
  res.status(200).json({
    user: req.user
  });
});

export default router;
