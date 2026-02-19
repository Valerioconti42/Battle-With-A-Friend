import { saveMatchResults } from '../models/score-model.js';
import { completeMatch } from '../models/match-model.js';

async function handleVictory(matchId, winnerId, loserId) {
  const connection = await pool.getConnection();
  try {
    await connection.query('START TRANSACTION');

    // Complete match (update status + winner_id)
    await completeMatch(matchId, winnerId, connection);

    // Save scores atomically
    await saveMatchResults(matchId, winnerId, loserId, connection);

    await connection.query('COMMIT');
    console.log(`[GameLoop] Match ${matchId} completed and scores saved`);
  } catch (err) {
    await connection.query('ROLLBACK');
    console.error(`[GameLoop] Error saving scores for match ${matchId}:`, err);
    throw err;
  } finally {
    connection.release();
  }
}
