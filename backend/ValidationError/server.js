import app from './app.js';

const PORT = process.env.PORT || 3000;

// Don't start HTTP server during tests
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;
