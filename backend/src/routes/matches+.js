const { param, validationResult } = require('express-validator');
const { acceptInvitation } = require('../models/invitation-model');
➕ Add Route
router.post(
  '/invites/:invitationId/accept',
  authenticate,
  [
    param('invitationId')
      .isInt({ min: 1 })
      .withMessage('Invitation ID must be a positive integer')
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new ValidationError('Invalid invitation ID', errors.array());
      }

      const invitationId = parseInt(req.params.invitationId, 10);
      const inviteeId = req.user.id;

      const match = await acceptInvitation(invitationId, inviteeId);

      return res.status(200).json(match);
    } catch (error) {
      next(error);
    }
  }
);
