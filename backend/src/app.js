import express from 'express';
import dotenv from 'dotenv';
import path from 'path'; // <-- 1. Import path
import { fileURLToPath } from 'url'; // <-- 2. Import this to handle ES module directories

// Import all routes
import authRouter from './routes/auth.js';
import leaderboardRoutes from './routes/leaderboard.js';
import matchesRoutes from './routes/matches.js';

// Import our new global error handler!
import { errorHandler } from './middleware/error-handler.js';

dotenv.config();

const app = express();

// --- 3. Set up directory paths for ES modules ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ─── Middleware ────────────────────────────────────────────────────────────────
app.use(express.json());

// --- 4. TELL EXPRESS TO SERVE YOUR FRONTEND ---
// This assumes your frontend folder is outside the backend folder.
// If your folder structure is different, we can adjust this path!
app.use(express.static(path.join(__dirname, '../../frontend')));

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth', authRouter);
app.use('/api', leaderboardRoutes); 
app.use('/api/matches', matchesRoutes);

// ... (KEEP THE REST OF YOUR FILE EXACTLY THE SAME FROM HERE DOWN) ...

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
