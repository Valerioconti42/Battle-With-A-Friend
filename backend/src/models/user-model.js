import pool from '../utils/database.js';
import { ConflictError } from '../utils/errors.js';

export async function createUser(username, passwordHash) {
  const conn = await pool.getConnection();

  try {
    const existing = await conn.query(
      'SELECT id FROM users WHERE username = ?',
      [username]
    );

    if (existing.length > 0) {
      throw new ConflictError('Username already taken');
    }

    const result = await conn.query(
      'INSERT INTO users (username, password_hash) VALUES (?, ?)',
      [username, passwordHash]
    );

    const user = await conn.query(
      'SELECT id, username, created_at FROM users WHERE id = ?',
      [result.insertId]
    );

    return {
      id: user[0].id,
      username: user[0].username,
      createdAt: user[0].created_at.toISOString()
    };
  } finally {
    conn.release();
  }
}
