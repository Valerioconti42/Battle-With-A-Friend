const pool = require('../config/db');

function toCamelCase(row) {
  return {
    id: row.id,
    player1Id: row.player1_id,
    player2Id: row.player2_id,
    status: row.status,
    winnerId: row.winner_id,
    createdAt: row.created_at
      ? new Date(row.created_at).toISOString()
      : null,
  };
}

/**
 * Can run standalone OR inside transaction
 */
async function createMatch(player1Id, player2Id, conn = null) {
  const client = conn || await pool.connect();

  try {
    const result = await client.query(
      `
      INSERT INTO matches (player1_id, player2_id, status)
      VALUES ($1, $2, 'pending')
      RETURNING *
      `,
      [player1Id, player2Id]
    );

    return toCamelCase(result.rows[0]);
  } finally {
    if (!conn) {
      client.release();
    }
  }
}

module.exports = {
  createMatch,
};
