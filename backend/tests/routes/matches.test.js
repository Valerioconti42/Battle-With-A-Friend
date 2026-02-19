const request = require('supertest');
const app = require('../../src/server');
const pool = require('../../src/config/db');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'testsecret';

function generateToken(user) {
  return jwt.sign(user, JWT_SECRET);
}

describe('POST /api/matches/invite', () => {
  let user1;
  let user2;
  let token;

  beforeEach(async () => {
    await pool.query('DELETE FROM invitations');
    await pool.query('DELETE FROM users');

    const u1 = await pool.query(
      `INSERT INTO users (username, password)
       VALUES ('player1', 'hashed')
       RETURNING *`
    );

    const u2 = await pool.query(
      `INSERT INTO users (username, password)
       VALUES ('player2', 'hashed')
       RETURNING *`
    );

    user1 = u1.rows[0];
    user2 = u2.rows[0];

    token = generateToken({ id: user1.id });
  });

  afterAll(async () => {
    await pool.end();
  });

  it('creates invitation successfully', async () => {
    const res = await request(app)
      .post('/api/matches/invite')
      .set('Authorization', `Bearer ${token}`)
      .send({ username: 'player2' });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe('pending');
    expect(res.body.inviterId).toBe(user1.id);
    expect(res.body.inviteeId).toBe(user2.id);
  });

  it('returns 404 if username does not exist', async () => {
    const res = await request(app)
      .post('/api/matches/invite')
      .set('Authorization', `Bearer ${token}`)
      .send({ username: 'unknown' });

    expect(res.status).toBe(404);
  });

  it('returns 400 if inviting yourself', async () => {
    const res = await request(app)
      .post('/api/matches/invite')
      .set('Authorization', `Bearer ${token}`)
      .send({ username: 'player1' });

    expect(res.status).toBe(400);
  });

  it('returns 409 if invitation already exists', async () => {
    await pool.query(
      `
      INSERT INTO invitations (inviter_id, invitee_id, status, expires_at)
      VALUES ($1, $2, 'pending', NOW() + INTERVAL '3 minutes')
      `,
      [user1.id, user2.id]
    );

    const res = await request(app)
      .post('/api/matches/invite')
      .set('Authorization', `Bearer ${token}`)
      .send({ username: 'player2' });

    expect(res.status).toBe(409);
  });

  it('returns 401 if not authenticated', async () => {
    const res = await request(app)
      .post('/api/matches/invite')
      .send({ username: 'player2' });

    expect(res.status).toBe(401);
  });

  it('returns 400 if username missing', async () => {
    const res = await request(app)
      .post('/api/matches/invite')
      .set('Authorization', `Bearer ${token}`)
      .send({});

    expect(res.status).toBe(400);
  });
});
