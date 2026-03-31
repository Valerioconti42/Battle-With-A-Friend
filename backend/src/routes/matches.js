import express from 'express';
import { body, validationResult } from 'express-validator';
import { authenticate } from '../middleware/auth.js';
import { ValidationError, NotFoundError } from '../errors.js';

import { createInvitation, findUserByUsername, findActiveInvitationsByInvitee } from '../models/invitation-model.js';
import { getMatchHistory, completeMatch, createMatch } from '../models/match-model.js';
import { saveMatchResults } from '../models/score-model.js';

import pool from '../utils/database.js';
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
    connection = await pool.getConnection();
    await connection.query('START TRANSACTION');

    const [matchRows] = await connection.query(
      'SELECT * FROM matches WHERE id = ? AND status = "active"',
      [matchId]
    );
    if (matchRows.length === 0) throw new NotFoundError('Match not found or not active');

    const match = matchRows[0];
    if (match.player1_id !== forfeitingPlayerId && match.player2_id !== forfeitingPlayerId) {
      throw new NotFoundError('You are not part of this match');
    }

    const winnerId = match.player1_id === forfeitingPlayerId ? match.player2_id : match.player1_id;

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



// POST /api/matches/invites/:id/accept
router.post('/invites/:id/accept', authenticate, async (req, res, next) => {
  const invitationId = parseInt(req.params.id, 10);
  const userId = req.user.id;

  let connection;
  try {
    connection = await pool.getConnection();
    await connection.query('START TRANSACTION');

    // 1. Verifica che l'invito esista, sia pending e appartenga all'utente
    const [inviteRows] = await connection.query(
      `SELECT * FROM invitations WHERE id = ? AND invitee_id = ? AND status = 'pending'`,
      [invitationId, userId]
    );
    if (inviteRows.length === 0) {
      throw new NotFoundError('Invitation not found or already processed');
    }
    const invitation = inviteRows[0];

    // 2. Crea un nuovo match in stato 'pending'
    const match = await createMatch(invitation.inviter_id, userId, connection);

    // 3. Aggiorna lo stato dell'invito ad 'accepted'
    await connection.query(
      `UPDATE invitations SET status = 'accepted' WHERE id = ?`,
      [invitationId]
    );

    await connection.query('COMMIT');
    res.status(201).json(match);
  } catch (err) {
    if (connection) await connection.query('ROLLBACK');
    next(err);
  } finally {
    if (connection) connection.release();
  }
});


export default router;
