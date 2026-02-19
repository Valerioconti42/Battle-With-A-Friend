/**
 * Get the leaderboard, including all registered users
 * @param {number} currentUserId - optional: ID of current user
 * @returns {Promise<Array>} leaderboard array with rank, userId, username, totalScore
 */
export async function getLeaderboard(currentUserId) {
  const connection = await pool.getConnection();
  try {
    // Query all users with total score, including 0-score players
    const [rows] = await connection.query(
      `SELECT 
         u.id AS user_id,
         u.username,
         COALESCE(SUM(s.score_change), 0) AS total_score
       FROM users u
       LEFT JOIN scores s ON u.id = s.player_id
       GROUP BY u.id, u.username
       ORDER BY total_score DESC, u.id ASC`
    );

    const leaderboard = [];
    let rank = 1;
    let prevScore = null;
    let skippedRanks = 0;

    rows.forEach((row, index) => {
      if (prevScore !== null) {
        if (row.total_score === prevScore) {
          skippedRanks++;
        } else {
          rank += 1 + skippedRanks;
          skippedRanks = 0;
        }
      }
      prevScore = row.total_score;

      leaderboard.push({
        rank,
        userId: row.user_id,
        username: row.username,
        totalScore: Number(row.total_score),
      });
    });

    return leaderboard;
  } finally {
    connection.release();
  }
}
