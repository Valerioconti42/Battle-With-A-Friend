import express from 'express';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/profile', authenticate, (req, res) => {
  res.status(200).json({
    user: req.user
  });
});

export default router;
