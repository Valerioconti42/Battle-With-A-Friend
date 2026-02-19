import request from 'supertest';
import bcrypt from 'bcrypt';
import app from '../../src/server.js';
import pool from '../../src/utils/database.js';


beforeEach(async () => {
  const conn = await pool.getConnection();
  await conn.query('DELETE FROM users');
  conn.release();
});

describe('POST /api/auth/register', () => {

  test('should register user successfully', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'player1',
        password: 'securePassword123'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.username).toBe('player1');
    expect(res.body).toHaveProperty('createdAt');
  });

  test('should return 409 if username exists', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ username: 'player1', password: 'securePassword123' });

    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'player1', password: 'securePassword123' });

    expect(res.statusCode).toBe(409);
    expect(res.body.error.code).toBe('CONFLICT');
  });

  test('should return 400 for validation errors', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'ab', password: '123' });

    expect(res.statusCode).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  test('password should be hashed in database', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ username: 'player2', password: 'securePassword123' });

    const conn = await pool.getConnection();
    const result = await conn.query(
      'SELECT password_hash FROM users WHERE username = ?',
      ['player2']
    );

    conn.release();

    const hash = result[0].password_hash;

    expect(hash).not.toBe('securePassword123');

    const isMatch = await bcrypt.compare('securePassword123', hash);
    expect(isMatch).toBe(true);
  });

describe('POST /api/auth/login', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'test-secret-key';
  });

  const mockUser = {
    id: 1,
    username: 'testplayer',
    passwordHash: 'hashedPassword',
  };

  test('should login successfully and return JWT token (200)', async () => {
    findByUsername.mockResolvedValue(mockUser);
    bcrypt.compare.mockResolvedValue(true);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'testplayer', password: 'securePass123' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('user');
    expect(res.body.user).toEqual({ id: 1, username: 'testplayer' });
    expect(res.body.user).not.toHaveProperty('passwordHash');
  });

  test('should return valid JWT token with correct payload', async () => {
    findByUsername.mockResolvedValue(mockUser);
    bcrypt.compare.mockResolvedValue(true);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'testplayer', password: 'securePass123' });

    const decoded = jwt.verify(res.body.token, process.env.JWT_SECRET);
    expect(decoded).toHaveProperty('id', 1);
    expect(decoded).toHaveProperty('username', 'testplayer');
    expect(decoded).toHaveProperty('iat');
    expect(decoded).toHaveProperty('exp');
  });

  test('should set JWT token expiration to 24 hours', async () => {
    findByUsername.mockResolvedValue(mockUser);
    bcrypt.compare.mockResolvedValue(true);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'testplayer', password: 'securePass123' });

    const decoded = jwt.verify(res.body.token, process.env.JWT_SECRET);
    expect(decoded.exp).toBe(decoded.iat + 24 * 60 * 60);
  });

  test('should verify JWT token with JWT_SECRET', async () => {
    findByUsername.mockResolvedValue(mockUser);
    bcrypt.compare.mockResolvedValue(true);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'testplayer', password: 'securePass123' });

    expect(() => jwt.verify(res.body.token, process.env.JWT_SECRET)).not.toThrow();
    expect(() => jwt.verify(res.body.token, 'wrong-secret')).toThrow();
  });

  test('should return 401 for invalid username', async () => {
    findByUsername.mockResolvedValue(null);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'nonexistent', password: 'pass' });

    expect(res.status).toBe(401);
    expect(res.body.error).toHaveProperty('code', 'AUTH_REQUIRED');
    expect(res.body.error).toHaveProperty('message', 'Invalid credentials');
  });

  test('should return 401 for incorrect password', async () => {
    findByUsername.mockResolvedValue(mockUser);
    bcrypt.compare.mockResolvedValue(false);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'testplayer', password: 'wrongpassword' });

    expect(res.status).toBe(401);
    expect(res.body.error).toHaveProperty('code', 'AUTH_REQUIRED');
    expect(res.body.error).toHaveProperty('message', 'Invalid credentials');
  });

  test('should return 400 if username is missing', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ password: 'securePass123' });

    expect(res.status).toBe(400);
    expect(res.body.error).toHaveProperty('code', 'VALIDATION_ERROR');
  });

  test('should return 400 if password is missing', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'testplayer' });

    expect(res.status).toBe(400);
    expect(res.body.error).toHaveProperty('code', 'VALIDATION_ERROR');
  });
});
