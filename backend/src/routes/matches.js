const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticate } = require('../middleware/authenticate');
const {
  createInvitation,
  findUserByUsername,
} = require('../models/invitation-model');
const { ValidationError } = require('../errors/validation-error');

const router = express.Router();

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

      const invitation = await createInvitation(
        currentUser.id,
        invitee.id
      );

      res.status(201).json(invitation);
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
