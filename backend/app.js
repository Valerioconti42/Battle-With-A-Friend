import express from 'express';
import dotenv from 'dotenv';

// Import all routes
import authRouter from './routes/auth.js';
import leaderboardRoutes from './routes/leaderboard.js';
import matchesRoutes from './routes/matches.js';

// Import our new global error handler!
import { errorHandler } from './middleware/error-handler.js';

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

// ─── Global Error Handler ─────────────────────────────────────────────────────
// This replaces the old inline code and automatically catches AppErrors!
app.use(errorHandler);

export default app;
