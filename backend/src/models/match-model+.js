async function getMatchHistory(userId, limit = 50, conn = null) {
  const client = conn || await pool.connect();

  try {
    const result = await client.query(
      `
      SELECT 
        m.id,
        m.player1_id,
        m.player2_id,
        m.status,
        m.winner_id,
        m.created_at,

        CASE 
          WHEN m.player1_id = $1 THEN m.player2_id
          ELSE m.player1_id
        END AS opponent_id,

        CASE 
          WHEN m.player1_id = $1 THEN u2.username
          ELSE u1.username
        END AS opponent_username,

        s_user.score_change AS my_score,
        s_opponent.score_change AS opponent_score

      FROM matches m
      INNER JOIN users u1 ON m.player1_id = u1.id
      INNER JOIN users u2 ON m.player2_id = u2.id

      LEFT JOIN scores s_user 
        ON m.id = s_user.match_id 
        AND s_user.player_id = $1

      LEFT JOIN scores s_opponent 
        ON m.id = s_opponent.match_id 
        AND s_opponent.player_id = 
          CASE 
            WHEN m.player1_id = $1 THEN m.player2_id
            ELSE m.player1_id
          END

      WHERE (m.player1_id = $1 OR m.player2_id = $1)
        AND m.status IN ('completed', 'cancelled')

      ORDER BY m.created_at DESC
      LIMIT $2
      `,
      [userId, limit]
    );

    return result.rows.map(row => {
      let resultValue;

      if (row.status === 'cancelled') {
        resultValue = 'cancelled';
      } else if (row.winner_id === userId) {
        resultValue = 'win';
      } else {
        resultValue = 'loss';
      }

      return {
        id: row.id,
        opponentId: row.opponent_id,
        opponentUsername: row.opponent_username,
        result: resultValue,
        myScore: row.status === 'cancelled' ? null : row.my_score,
        opponentScore: row.status === 'cancelled' ? null : row.opponent_score,
        createdAt: row.created_at
          ? new Date(row.created_at).toISOString()
          : null,
      };
    });
  } finally {
    if (!conn) {
      client.release();
    }
  }
}
module.exports = {
  createMatch,
  getMatchHistory,
};

