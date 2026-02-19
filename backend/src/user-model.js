import { pool } from '../config/database.js';

/**
 * Find a user by their username.
 * @param {string} username
 * @returns {Promise<Object|null>} User object with passwordHash, or null if not found.
 */
export async function findByUsername(username) {
  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.execute(
      'SELECT id, username, password_hash FROM users WHERE username = ?',
      [username]
    );

    if (rows.length === 0) return null;

    const user = rows[0];
    return {
      id: user.id,
      username: user.username,
      passwordHash: user.password_hash,
    };
  } finally {
    conn.release();
  }
}

/**
 * Create a new user.
 * @param {string} username
 * @param {string} passwordHash
 * @returns {Promise<Object>} The created user (id, username).
 */
export async function createUser(username, passwordHash) {
  const conn = await pool.getConnection();
  try {
    const [result] = await conn.execute(
      'INSERT INTO users (username, password_hash) VALUES (?, ?)',
      [username, passwordHash]
    );

    return {
      id: result.insertId,
      username,
    };
  } finally {
    conn.release();
  }
}

/**
 * Check if a username is already taken.
 * @param {string} username
 * @returns {Promise<boolean>}
 */
export async function usernameExists(username) {
  const user = await findByUsername(username);
  return user !== null;
}
