import express from 'express';
import bcrypt from 'bcrypt';
import { body, validationResult } from 'express-validator';
import { createUser } from '../models/user-model.js';
import { ValidationError } from '../utils/errors.js';

const router = express.Router();

router.post(
  '/register',
  [
    body('username')
      .isString().withMessage('Username must be a string')
      .isLength({ min: 3, max: 50 }).withMessage('Username must be 3-50 characters')
      .matches(/^[a-zA-Z0-9_]+$/).withMessage('Username must be alphanumeric with underscores'),

    body('password')
      .isString().withMessage('Password must be a string')
      .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        const details = {};
        errors.array().forEach(err => {
          details[err.path] = err.msg;
        });

        throw new ValidationError('Invalid input data', details);
      }

      const { username, password } = req.body;

      const passwordHash = await bcrypt.hash(password, 10);

      const user = await createUser(username, passwordHash);

      return res.status(201).json(user);
    } catch (err) {
      next(err);
    }
  }
);

export default router;
