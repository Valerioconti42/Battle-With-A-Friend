import express from 'express';
import dotenv from 'dotenv';

// Import all routes
import authRouter from './routes/auth.js';
import leaderboardRoutes from './routes/leaderboard.js';
import matchesRoutes from './routes/matches.js'; // Converted from require()

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
// This catches requests to routes that don't exist and passes them to the error handler
app.use((req, res, next) => {
  const error = new Error('Route Not Found');
  error.status = 404;
  error.code = 'NOT_FOUND';
  next(error);
});

// ─── Error handler ────────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
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
