import db from '../database/db.js';

/**
 * Lazily expire old invitations
 */
export async function expireOldInvitations(conn) {
  try {
    await conn.execute(
      `
      UPDATE invitations
      SET status = 'expired'
      WHERE status = 'pending'
        AND expires_at < NOW()
      `
    );
  } catch (err) {
    console.error('Error expiring invitations:', err);
    throw err;
  }
}

/**
 * Find active invitations where user is invitee
 */
export async function findActiveInvitationsByInvitee(inviteeId) {
  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    await expireOldInvitations(conn);

    const [rows] = await conn.execute(
      `
      SELECT
        i.id,
        i.inviter_id,
        u.username AS inviter_username,
        i.status,
        i.expires_at,
        i.created_at
      FROM invitations i
      JOIN users u ON u.id = i.inviter_id
      WHERE i.invitee_id = ?
        AND i.status = 'pending'
        AND i.expires_at > NOW()
      ORDER BY i.created_at DESC
      `,
      [inviteeId]
    );

    await conn.commit();

    return rows.map(row => ({
      id: row.id,
      inviterId: row.inviter_id,
      inviterUsername: row.inviter_username,
      status: row.status,
      expiresAt: row.expires_at.toISOString(),
      createdAt: row.created_at.toISOString()
    }));
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}
