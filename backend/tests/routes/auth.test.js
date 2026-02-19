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

});
