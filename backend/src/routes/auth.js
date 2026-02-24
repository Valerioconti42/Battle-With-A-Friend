import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken'; // <-- Added to issue login tickets
import { body, validationResult } from 'express-validator';
import { createUser, getUserByUsername } from '../models/user-model.js'; // <-- Added getUserByUsername
import { ValidationError } from '../errors.js'; //

const router = express.Router();

// --- REGISTER ROUTE (Exactly as you wrote it!) ---
router.post(
  '/register',
  [
    body('username')
      .isString().withMessage('Username must be a string') //
      .isLength({ min: 3, max: 50 }).withMessage('Username must be 3-50 characters') //
      .matches(/^[a-zA-Z0-9_]+$/).withMessage('Username must be alphanumeric with underscores'), //

    body('password')
      .isString().withMessage('Password must be a string') //
      .isLength({ min: 6 }).withMessage('Password must be at least 6 characters') //
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        const details = {};
        errors.array().forEach(err => {
          details[err.path] = err.msg;
        });

        throw new ValidationError('Invalid input data', details); //
      }

      const { username, password } = req.body;
      const passwordHash = await bcrypt.hash(password, 10); //
      const user = await createUser(username, passwordHash); //

      return res.status(201).json(user); //
    } catch (err) {
      next(err); //
    }
  }
);

// --- NEW LOGIN ROUTE ---
router.post(
  '/login',
  [
    body('username').isString().notEmpty().withMessage('Username is required'),
    body('password').isString().notEmpty().withMessage('Password is required')
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

      // 1. Fetch user from DB
      const user = await getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ message: 'Invalid username or password' });
      }

      // 2. Check password against the 'password_hash' column
      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid username or password' });
      }

      // 3. Issue Token
      const token = jwt.sign(
        { userId: user.id, username: user.username },
        process.env.JWT_SECRET || 'super_secret_school_key', 
        { expiresIn: '24h' }
      );

      return res.json({ token, message: 'Logged in successfully!' });
    } catch (err) {
      next(err);
    }
  }
);

export default router; //
