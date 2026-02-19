import express from 'express';
import { getLeaderboard } from '../models/score-model.js';
import { authenticate } from './middlewares/jwt-middleware.js';

const router = express.Router();

/**
 * GET /api/leaderboard
 * Returns the leaderboard with ranks and total scores
 */
router.get('/leaderboard', authenticate, async (req, res) => {
  try {
    const leaderboard = await getLeaderboard(req.user.id);
    res.status(200).json(leaderboard);
  } catch (err) {
    console.error('[Leaderboard] Error fetching leaderboard:', err);
    res.status(500).json({ error: { message: 'Failed to fetch leaderboard', status: 500 } });
  }
});

export default router;
