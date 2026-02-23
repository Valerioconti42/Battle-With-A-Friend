import express from 'express';
import { getLeaderboard } from '../models/score-model.js';
import { authenticate } from '../middleware/auth.js'; // Standardized path

const router = express.Router();

router.get('/leaderboard', authenticate, async (req, res, next) => { // Added next
  try {
    const leaderboard = await getLeaderboard(req.user.id);
    res.status(200).json(leaderboard);
  } catch (err) {
    console.error('[Leaderboard] Error fetching leaderboard:', err);
    next(err); // Funneled to global error handler
  }
});

export default router;
