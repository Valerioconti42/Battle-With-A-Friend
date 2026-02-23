import express from 'express';
import dotenv from 'dotenv';

// 1. Import your custom error class
import { NotFoundError } from './errors.js'; 

// Import all routes
import authRouter from './routes/auth.js';
import leaderboardRoutes from './routes/leaderboard.js';
import matchesRoutes from './routes/matches.js'; 

dotenv.config();

const app = express();

// ─── Middleware ────────────────────────────────────────────────────────────────
app.use(express.json());

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth', authRouter);
app.use('/api', leaderboardRoutes); 
app.use('/api/matches', matchesRoutes);

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// ─── 404 Not Found Handler ────────────────────────────────────────────────────
app.use((req, res, next) => {
  // 2. Use your custom error class instead of manually building an object!
  next(new NotFoundError('Route Not Found'));
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  // This seamlessly picks up the 'status', 'code', and 'details' 
  // from the classes you defined in errors.js!
  const status = err.status || 500;

  res.status(status).json({
    error: {
      message: err.message || 'Internal Server Error',
      code: err.code || 'INTERNAL_ERROR',
      status,
      details: err.details || null,
    },
  });
});

export default app;
