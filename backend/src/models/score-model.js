// score-model.js
// Handles score calculation and saving match results

import pool from '../database/pool.js';

/**
 * Get the total score of a player (sum of score_change)
 * @param {number} playerId
 * @param {object} [conn] optional database connection (for transactions)
 * @returns {Promise<number>}
 */
export async function getPlayerTotalScore(playerId, conn) {
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

/**
 * Save match results: create score records for winner (+10) and loser (-5)
 * @param {number} matchId
 * @param {number} winnerId
 * @param {number} loserId
 * @param {object} [conn] optional database connection (for transactions)
 * @returns {Promise<object>} saved score records
 */
export async function saveMatchResults(matchId, winnerId, loserId, conn) {
  const connection = conn || (await pool.getConnection());
  let ownConnection = false;
  try {
    if (!conn) {
      ownConnection = true;
      await connection.query('START TRANSACTION');
    }

    // Calculate previous total scores
    const winnerPrev = await getPlayerTotalScore(winnerId, connection);
    const loserPrev = await getPlayerTotalScore(loserId, connection);

    const winnerScoreChange = 10;
    const loserScoreChange = -5;

    const winnerNew = winnerPrev + winnerScoreChange;
    const loserNew = loserPrev + loserScoreChange;

    // Insert score records
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
    if (!conn) connection.release();
  }
}
