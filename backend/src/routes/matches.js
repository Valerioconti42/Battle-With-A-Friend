import express from 'express';
import { body, validationResult } from 'express-validator';
import { authenticate } from '../middleware/auth.js';
import { ValidationError } from '../errors.js';

// Consolidating all model imports
import { createInvitation, findUserByUsername, findActiveInvitationsByInvitee } from '../models/invitation-model.js';
import { getMatchHistory, completeMatch } from '../models/match-model.js';
import { saveMatchResults } from '../models/score-model.js';

// Note: You will need to ensure this path matches your DB connection file
import pool from '../database/db.js'; 

const router = express.Router();

// ─── Invitations ──────────────────────────────────────────────────────────────

// POST /api/matches/invite
router.post(
  '/invite',
  authenticate,
  body('username')
    .exists().withMessage('Username is required')
    .bail()
    .isString().withMessage('Username must be a string')
    .bail()
    .isLength({ min: 3, max: 50 }).withMessage('Username must be 3-50 characters'),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new ValidationError('Invalid input', errors.array());
      }

      const { username } = req.body;
      const currentUser = req.user;
      const invitee = await findUserByUsername(username);

      if (invitee.id === currentUser.id) {
        throw new ValidationError('You cannot invite yourself');
      }

      const invitation = await createInvitation(currentUser.id, invitee.id);
      res.status(201).json(invitation);
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/matches/invites/active
router.get('/invites/active', authenticate, async (req, res, next) => {
  try {
    const invitations = await findActiveInvitationsByInvitee(req.user.id);
    res.status(200).json(invitations);
  } catch (err) {
    next(err);
  }
});

// ─── Matches ──────────────────────────────────────────────────────────────────

// GET /api/matches/history
router.get('/history', authenticate, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const history = await getMatchHistory(userId, 50);
    return res.status(200).json(history);
  } catch (error) {
    next(error);
  }
});

// POST /api/matches/:id/forfeit
router.post('/:id/forfeit', authenticate, async (req, res, next) => {
  const matchId = parseInt(req.params.id, 10);
  const forfeitingPlayerId = req.user.id;
  
  let connection;
  try {
    // Note: ensure getOpponentId is properly imported or defined in match-model.js
    // const winnerId = await getOpponentId(matchId, forfeitingPlayerId); 
    
    connection = await pool.getConnection();
    await connection.query('START TRANSACTION');

    // Assuming winnerId is resolved above
    await completeMatch(matchId, winnerId, connection);
    await saveMatchResults(matchId, winnerId, forfeitingPlayerId, connection);

    await connection.query('COMMIT');
    res.json({ success: true });
  } catch (err) {
    if (connection) await connection.query('ROLLBACK');
    next(err); // Route to global handler instead of res.status(500)
  } finally {
    if (connection) connection.release();
  }
});

export default router;
