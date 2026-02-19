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

