import pool from '../utils/database.js';

export async function getPlayerTotalScore(playerId, conn = null) {
  const connection = conn || (await pool.getConnection());
  try {
    const [rows] = await connection.query(
      'SELECT COALESCE(SUM(score_change), 0) AS total_score FROM scores WHERE player_id = ?',
      [playerId]
    );
    return rows[0]?.total_score ?? 0;
  } finally {
    if (!conn) connection.release();
  }
}

export async function saveMatchResults(matchId, winnerId, loserId, conn = null) {
  const connection = conn || (await pool.getConnection());
  let ownConnection = false;
  try {
    if (!conn) {
      ownConnection = true;
      await connection.query('START TRANSACTION');
    }

    const winnerPrev = await getPlayerTotalScore(winnerId, connection);
    const loserPrev = await getPlayerTotalScore(loserId, connection);

    const winnerScoreChange = 10;
    const loserScoreChange = -5;

    const winnerNew = winnerPrev + winnerScoreChange;
    const loserNew = loserPrev + loserScoreChange;

    await connection.query(
      'INSERT INTO scores (match_id, player_id, score, score_change) VALUES (?, ?, ?, ?)',
      [matchId, winnerId, winnerNew, winnerScoreChange]
    );
    
    await connection.query(
      'INSERT INTO scores (match_id, player_id, score, score_change) VALUES (?, ?, ?, ?)',
      [matchId, loserId, loserNew, loserScoreChange]
    );

    if (ownConnection) await connection.query('COMMIT');

    return {
      winner: { playerId: winnerId, previousScore: winnerPrev, scoreChange: winnerScoreChange, newScore: winnerNew },
      loser: { playerId: loserId, previousScore: loserPrev, scoreChange: loserScoreChange, newScore: loserNew },
    };
  } catch (err) {
    if (ownConnection) await connection.query('ROLLBACK');
    throw err;
  } finally {
    if (ownConnection) connection.release();
  }
}

export async function getLeaderboard(currentUserId) {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.query(
      `SELECT u.id AS user_id, u.username, COALESCE(SUM(s.score_change), 0) AS total_score
       FROM users u
       LEFT JOIN scores s ON u.id = s.player_id
       GROUP BY u.id, u.username
       ORDER BY total_score DESC, u.id ASC`
    );

    const leaderboard = [];
    let rank = 1;
    let prevScore = null;
    let skippedRanks = 0;

    rows.forEach((row) => {
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
