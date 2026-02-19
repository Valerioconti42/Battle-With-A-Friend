import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import { findByUsername, createUser, usernameExists } from '../models/user-model.js';
import { AuthenticationError, ValidationError } from '../utils/errors.js';

const router = express.Router();

// ─── Validation middleware helper ─────────────────────────────────────────────
function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ValidationError('Validation failed', errors.array());
  }
  next();
}

// ─── POST /api/auth/register ──────────────────────────────────────────────────
router.post(
  '/register',
  [
    body('username')
      .exists().withMessage('Username is required')
      .isString().withMessage('Username must be a string')
      .trim()
      .notEmpty().withMessage('Username cannot be empty'),
    body('password')
      .exists().withMessage('Password is required')
      .isString().withMessage('Password must be a string')
      .notEmpty().withMessage('Password cannot be empty'),
  ],
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const { username, password } = req.body;

      if (await usernameExists(username)) {
        return res.status(409).json({
          error: {
            message: 'Username already taken',
            code: 'CONFLICT',
            status: 409,
          },
        });
      }

      const SALT_ROUNDS = 10;
      const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
      const user = await createUser(username, passwordHash);

      return res.status(201).json({ user });
    } catch (err) {
      next(err);
    }
  }
);

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
router.post(
  '/login',
  [
    body('username')
      .exists().withMessage('Username is required')
      .isString().withMessage('Username must be a string')
      .trim()
      .notEmpty().withMessage('Username cannot be empty'),
    body('password')
      .exists().withMessage('Password is required')
      .isString().withMessage('Password must be a string')
      .notEmpty().withMessage('Password cannot be empty'),
  ],
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const { username, password } = req.body;

      // 1. Find user by username
      const user = await findByUsername(username);
      if (!user) {
        throw new AuthenticationError('Invalid credentials');
      }

      // 2. Verify password
      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
      if (!isPasswordValid) {
        throw new AuthenticationError('Invalid credentials');
      }

      // 3. Generate JWT token
      const token = jwt.sign(
        { id: user.id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      // 4. Return token and user data (without passwordHash)
      return res.status(200).json({
        token,
        user: {
          id: user.id,
          username: user.username,
        },
      });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
