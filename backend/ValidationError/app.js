import express from 'express';
import dotenv from 'dotenv';
import authRouter from './routes/auth.js';
import { errorHandler } from './middleware/error-handler.js';

dotenv.config();

const app = express();

// ─── Middleware ────────────────────────────────────────────────────────────────
app.use(express.json());

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth', authRouter);

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// ─── Error handler ────────────────────────────────────────────────────────────
app.use(errorHandler);

export default app;
