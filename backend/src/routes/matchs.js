import express from 'express';
import authenticate from '../middleware/authenticate.js';
import { findActiveInvitationsByInvitee } from '../models/invitation-model.js';

const router = express.Router();

router.get('/invites/active', authenticate, async (req, res, next) => {
  try {
    const invitations = await findActiveInvitationsByInvitee(req.user.id);
    res.status(200).json(invitations);
  } catch (err) {
    next(err);
  }
});

export default router;
