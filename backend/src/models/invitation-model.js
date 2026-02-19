const pool = require('../config/db');
const { ConflictError } = require('../errors/conflict-error');
const { NotFoundError } = require('../errors/not-found-error');

/**
 * Reuse user-model lookup
 */
async function findUserByUsername(username) {
  const result = await pool.query(
    'SELECT id, username FROM users WHERE username = $1',
    [username]
  );

  if (result.rows.length === 0) {
    throw new NotFoundError('User not found');
  }

  return result.rows[0];
}

function mapInvitation(row) {
  return {
    id: row.id,
    inviterId: row.inviter_id,
    inviteeId: row.invitee_id,
    status: row.status,
    expiresAt: row.expires_at.toISOString(),
    createdAt: row.created_at.toISOString(),
  };
}

async function createInvitation(inviterId, inviteeId) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Check for existing pending invitation (bidirectional)
    const existing = await client.query(
      `
      SELECT id FROM invitations
      WHERE status = 'pending'
      AND (
        (inviter_id = $1 AND invitee_id = $2)
        OR
        (inviter_id = $2 AND invitee_id = $1)
      )
      `,
      [inviterId, inviteeId]
    );

    if (existing.rows.length > 0) {
      throw new ConflictError('Pending invitation already exists');
    }

    const expiresAt = new Date(Date.now() + 3 * 60 * 1000);

    const result = await client.query(
      `
      INSERT INTO invitations (inviter_id, invitee_id, status, expires_at)
      VALUES ($1, $2, 'pending', $3)
      RETURNING *
      `,
      [inviterId, inviteeId, expiresAt]
    );

    await client.query('COMMIT');

    return mapInvitation(result.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

module.exports = {
  findUserByUsername,
  createInvitation,
};


const { createMatch } = require('./match-model');
const { NotFoundError } = require('../errors/not-found-error');
const { ValidationError } = require('../errors/validation-error');
const { ConflictError } = require('../errors/conflict-error');
 
➕ Add findInvitationById
async function findInvitationById(invitationId, conn = null) {
  const client = conn || await pool.connect();

  try {
    const result = await client.query(
      'SELECT * FROM invitations WHERE id = $1',
      [invitationId]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError('Invitation not found');
    }

    return result.rows[0];
  } finally {
    if (!conn) {
      client.release();
    }
  }
}
➕ Add acceptInvitation (Transactional + Atomic)
async function acceptInvitation(invitationId, inviteeId) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const invitation = await findInvitationById(invitationId, client);

    // Ownership check
    if (invitation.invitee_id !== inviteeId) {
      throw new ValidationError('You cannot accept this invitation');
    }

    // Prevent accepting own invitation
    if (invitation.inviter_id === inviteeId) {
      throw new ValidationError('You cannot accept your own invitation');
    }

    // Expiration check
    if (new Date(invitation.expires_at) < new Date()) {
      throw new ValidationError('Invitation has expired');
    }

    // Status check
    if (invitation.status !== 'pending') {
      throw new ConflictError('Invitation already processed');
    }

    // Update invitation
    await client.query(
      `
      UPDATE invitations
      SET status = 'accepted'
      WHERE id = $1
      `,
      [invitationId]
    );

    // Create match (player1 = inviter, player2 = accepter)
    const match = await createMatch(
      invitation.inviter_id,
      inviteeId,
      client
    );

    await client.query('COMMIT');

    return match;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}
➕ Export New Functions
module.exports = {
  findUserByUsername,
  createInvitation,
  findInvitationById,
  acceptInvitation,
};
