import express from 'express';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import errorHandler from './middleware/error-handler.js';

dotenv.config();

const app = express();

app.use(express.json());

app.use('/api/auth', authRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use(errorHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

const matchesRoutes = require('./routes/matches');
registrati 
  app.use('/api/matches', matchesRoutes);
Ensure your error handler includes NotFoundError support:
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
