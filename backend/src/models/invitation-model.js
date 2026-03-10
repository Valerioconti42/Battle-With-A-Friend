import pool from '../database/db.js';
import { ConflictError, NotFoundError, ValidationError } from '../utils/errors.js';
import { createMatch } from './match-model.js'; // Import to create match on accept

export async function findUserByUsername(username) {
  const [rows] = await pool.query(
    'SELECT id, username FROM users WHERE username = ?',
    [username]
  );

  if (rows.length === 0) {
    throw new NotFoundError('User not found');
  }

  return rows[0];
}

export async function createInvitation(inviterId, inviteeId) {
  const conn = await pool.getConnection();

  try {
    await conn.query('START TRANSACTION');

    const [existing] = await conn.query(
      `SELECT id FROM invitations 
       WHERE status = 'pending' 
       AND ((inviter_id = ? AND invitee_id = ?) OR (inviter_id = ? AND invitee_id = ?))`,
      [inviterId, inviteeId, inviteeId, inviterId]
    );

    if (existing.length > 0) {
      throw new ConflictError('A pending invitation already exists between these users');
    }

    // Set expiration (e.g., 24 hours from now)
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const [result] = await conn.query(
      `INSERT INTO invitations (inviter_id, invitee_id, status, expires_at) 
       VALUES (?, ?, 'pending', ?)`,
      [inviterId, inviteeId, expiresAt]
    );

    await conn.query('COMMIT');

    return {
      id: result.insertId,
      inviterId,
      inviteeId,
      status: 'pending',
      expiresAt: expiresAt.toISOString()
    };
  } catch (err) {
    await conn.query('ROLLBACK');
    throw err;
  } finally {
    conn.release();
  }
}

export async function findActiveInvitationsByInvitee(inviteeId) {
  const [rows] = await pool.query(
    `SELECT i.id, i.inviter_id, i.status, i.created_at, u.username as inviter_username 
     FROM invitations i 
     JOIN users u ON i.inviter_id = u.id 
     WHERE i.invitee_id = ? AND i.status = 'pending'`,
    [inviteeId]
  );
  return rows;
}
