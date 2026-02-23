import pool from '../database/db.js';

export async function createMatch(player1Id, player2Id, conn = null) {
  const connection = conn || await pool.getConnection();

  try {
    // Converted Postgres RETURNING to MySQL insertId logic
    const [result] = await connection.query(
      `INSERT INTO matches (player1_id, player2_id, status) VALUES (?, ?, 'pending')`,
      [player1Id, player2Id]
    );

    const [matchRows] = await connection.query(
      `SELECT * FROM matches WHERE id = ?`,
      [result.insertId]
    );

    const row = matchRows[0];
    return {
      id: row.id,
      player1Id: row.player1_id,
      player2Id: row.player2_id,
      status: row.status,
      winnerId: row.winner_id,
      createdAt: row.created_at ? new Date(row.created_at).toISOString() : null,
    };
  } finally {
    if (!conn) connection.release();
  }
}

export async function completeMatch(matchId, winnerId, conn = null) {
  const connection = conn || await pool.getConnection();
  try {
    await connection.query(
      `UPDATE matches SET status = 'completed', winner_id = ? WHERE id = ?`,
      [winnerId, matchId]
    );
  } finally {
    if (!conn) connection.release();
  }
}

export async function getMatchHistory(userId, limit = 50, conn = null) {
  const connection = conn || await pool.getConnection();

  try {
    const [rows] = await connection.query(
      `SELECT 
        m.id, m.player1_id, m.player2_id, m.status, m.winner_id, m.created_at,
        CASE WHEN m.player1_id = ? THEN m.player2_id ELSE m.player1_id END AS opponent_id,
        CASE WHEN m.player1_id = ? THEN u2.username ELSE u1.username END AS opponent_username,
        s_user.score_change AS my_score,
        s_opponent.score_change AS opponent_score
      FROM matches m
      INNER JOIN users u1 ON m.player1_id = u1.id
      INNER JOIN users u2 ON m.player2_id = u2.id
      LEFT JOIN scores s_user ON m.id = s_user.match_id AND s_user.player_id = ?
      LEFT JOIN scores s_opponent ON m.id = s_opponent.match_id AND s_opponent.player_id = 
          CASE WHEN m.player1_id = ? THEN m.player2_id ELSE m.player1_id END
      WHERE (m.player1_id = ? OR m.player2_id = ?)
        AND m.status IN ('completed', 'cancelled')
      ORDER BY m.created_at DESC
      LIMIT ?`,
      [userId, userId, userId, userId, userId, userId, limit]
    );

    return rows.map(row => ({
      id: row.id,
      opponentId: row.opponent_id,
      opponentUsername: row.opponent_username,
      result: row.status === 'cancelled' ? 'cancelled' : (row.winner_id === userId ? 'win' : 'loss'),
      myScore: row.status === 'cancelled' ? null : row.my_score,
      opponentScore: row.status === 'cancelled' ? null : row.opponent_score
    }));
  } finally {
    if (!conn) connection.release();
  }
}
