import request from 'supertest';
import jwt from 'jsonwebtoken';
import express from 'express';
import userRoutes from '../../src/routes/user.js';
import { errorHandler } from '../../src/middleware/error-handler.js';

describe('Authentication Middleware', () => {
  let app;
  const JWT_SECRET = 'test-secret';

  beforeAll(() => {
    process.env.JWT_SECRET = JWT_SECRET;

    app = express();
    app.use(express.json());
    app.use('/api/user', userRoutes);
    app.use(errorHandler);
  });

  function generateToken(payload, options = {}) {
    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: '1h',
      ...options
    });
  }

  test('should allow access with valid JWT token', async () => {
    const token = generateToken({
      id: '123',
      username: 'testuser'
    });

    const response = await request(app)
      .get('/api/user/profile')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.user).toEqual({
      id: '123',
      username: 'testuser'
    });
  });

  test('should return 401 without Authorization header', async () => {
    const response = await request(app).get('/api/user/profile');

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      error: {
        message: 'Authentication required',
        code: 'AUTH_REQUIRED',
        status: 401
      }
    });
  });

  test('should return 401 with invalid token', async () => {
    const response = await request(app)
      .get('/api/user/profile')
      .set('Authorization', 'Bearer invalid.token.here');

    expect(response.status).toBe(401);
    expect(response.body.error.status).toBe(401);
  });

  test('should return 401 with expired token', async () => {
    const token = jwt.sign(
      { id: '123', username: 'testuser' },
      JWT_SECRET,
      { expiresIn: '-1h' }
    );

    const response = await request(app)
      .get('/api/user/profile')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(401);
  });

  test('should return 401 with malformed Authorization header', async () => {
    const response = await request(app)
      .get('/api/user/profile')
      .set('Authorization', 'InvalidFormat token');

    expect(response.status).toBe(401);
  });

  test('should return 401 if Bearer prefix is missing', async () => {
    const token = generateToken({
      id: '123',
      username: 'testuser'
    });

    const response = await request(app)
      .get('/api/user/profile')
      .set('Authorization', token);

    expect(response.status).toBe(401);
  });

  test('should return 401 if token payload is missing fields', async () => {
    const token = generateToken({ foo: 'bar' });

    const response = await request(app)
      .get('/api/user/profile')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(401);
  });

  test('should return 401 with empty Authorization header', async () => {
    const response = await request(app)
      .get('/api/user/profile')
      .set('Authorization', '');

    expect(response.status).toBe(401);
  });
});
