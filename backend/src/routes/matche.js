import { saveMatchResults } from '../models/score-model.js';
import { completeMatch } from '../models/match-model.js';

router.post('/matches/:id/forfeit', authenticate, async (req, res) => {
  const matchId = parseInt(req.params.id, 10);
  const forfeitingPlayerId = req.user.id;
  const winnerId = await getOpponentId(matchId, forfeitingPlayerId);

  const connection = await pool.getConnection();
  try {
    await connection.query('START TRANSACTION');

    await completeMatch(matchId, winnerId, connection);

    await saveMatchResults(matchId, winnerId, forfeitingPlayerId, connection);

    await connection.query('COMMIT');
    res.json({ success: true });
  } catch (err) {
    await connection.query('ROLLBACK');
    res.status(500).json({ error: { message: 'Failed to save scores', status: 500 } });
  } finally {
    connection.release();
  }
});
