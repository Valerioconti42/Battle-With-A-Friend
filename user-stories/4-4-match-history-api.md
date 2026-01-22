# Story 4.4: Match History API

## Overview
Implementazione dell'endpoint API per recuperare lo storico delle partite di un utente autenticato.

## Acceptance Criteria
✅ **Given** I am authenticated and have played matches  
✅ **When** I send a GET request to `/api/matches/history`  
✅ **Then** The server responds with status 200 OK  
✅ **And** The response contains an array of my matches with:
- Match ID
- Opponent ID and username
- Result (win/loss/cancelled)
- My score and opponent score
- Created timestamp
✅ **And** Only matches where I am player1_id or player2_id are returned  
✅ **And** Matches are sorted by created_at descending (most recent first)  
✅ **And** The result field shows: "win", "loss", or "cancelled"  
✅ **And** For cancelled matches, scores are null  
✅ **And** The response is limited to recent matches (last 50) for MVP  
✅ **And** The endpoint requires authentication (JWT middleware)

## Implementation

### Task 1: Create getMatchHistory function in match-model.js ✅
**File:** `backend/src/models/match-model.js`

Creata funzione `getMatchHistory(userId, limit = 50, conn = null)` che:
- Recupera match completati o cancellati per l'utente
- Include informazioni sull'avversario (ID e username)
- Include punteggi dalla tabella `scores` (LEFT JOIN)
- Determina il risultato (win/loss/cancelled) basato su `winner_id` e `status`
- Ordina per `created_at DESC`
- Limita a 50 risultati

**Query SQL:**
```sql
SELECT 
  m.id,
  m.player1_id,
  m.player2_id,
  m.status,
  m.winner_id,
  m.created_at,
  -- Determine opponent ID and username
  CASE 
    WHEN m.player1_id = ? THEN m.player2_id
    ELSE m.player1_id
  END as opponent_id,
  CASE 
    WHEN m.player1_id = ? THEN u2.username
    ELSE u1.username
  END as opponent_username,
  -- Get scores for current user and opponent
  s_user.score_change as my_score_change,
  s_opponent.score_change as opponent_score_change
FROM matches m
INNER JOIN users u1 ON m.player1_id = u1.id
INNER JOIN users u2 ON m.player2_id = u2.id
LEFT JOIN scores s_user ON m.id = s_user.match_id AND s_user.player_id = ?
LEFT JOIN scores s_opponent ON m.id = s_opponent.match_id AND s_opponent.player_id = CASE 
  WHEN m.player1_id = ? THEN m.player2_id
  ELSE m.player1_id
END
WHERE (m.player1_id = ? OR m.player2_id = ?)
  AND m.status IN ('completed', 'cancelled')
ORDER BY m.created_at DESC
LIMIT ?
```

**Response Format:**
```javascript
[
  {
    id: 1,
    opponentId: 2,
    opponentUsername: "player2",
    result: "win",
    myScore: 10,
    opponentScore: -5,
    createdAt: "2026-01-12T10:35:00Z"
  }
]
```

### Task 2: Create GET /api/matches/history endpoint ✅
**File:** `backend/src/routes/matches.js`

Creato endpoint:
```javascript
router.get(
  '/history',
  authenticate, // Require JWT authentication
  async (req, res, next) => {
    try {
      const userId = req.user.id; // From JWT middleware
      const history = await getMatchHistory(userId, 50);
      return res.status(200).json(history);
    } catch (error) {
      next(error);
    }
  }
);
```

### Task 3: Create tests ✅
**File:** `backend/tests/routes/matches.test.js`

Creati test per:
- ✅ Restituisce array vuoto se l'utente non ha storico
- ✅ Restituisce storico con risultato "win"
- ✅ Restituisce storico con risultato "loss"
- ✅ Restituisce storico con risultato "cancelled" (scores null)
- ✅ Restituisce solo match dell'utente autenticato
- ✅ Esclude match pending e active dallo storico
- ✅ Ordina per created_at DESC (più recenti prima)
- ✅ Limita risultati a 50 match
- ✅ Richiede autenticazione (401 se non autenticato)

## Files Modified

### Backend
- `backend/src/models/match-model.js`
  - Aggiunta funzione `getMatchHistory(userId, limit = 50, conn = null)`
  
- `backend/src/routes/matches.js`
  - Aggiunto import `getMatchHistory`
  - Aggiunto endpoint `GET /api/matches/history`
  - Corretto errore di sintassi nella funzione `sendGameEndToConnections`

- `backend/tests/routes/matches.test.js`
  - Aggiunti test completi per Match History API

## Testing

### Manual Testing
1. Autenticarsi come utente
2. Giocare alcune partite (completate e cancellate)
3. Chiamare `GET /api/matches/history` con token JWT
4. Verificare che:
   - Vengano restituiti solo match completati/cancellati
   - I risultati siano ordinati per data (più recenti prima)
   - I punteggi siano corretti per match completati
   - I punteggi siano null per match cancellati
   - Il risultato (win/loss/cancelled) sia corretto

### Automated Testing
```bash
npm test -- matches.test.js --testNamePattern="GET /api/matches/history"
```

**Nota:** Alcuni test possono andare in timeout se il database non è disponibile. Verificare la connessione al database prima di eseguire i test.

## API Response Example

### Success Response (200 OK)
```json
[
  {
    "id": 1,
    "opponentId": 2,
    "opponentUsername": "player2",
    "result": "win",
    "myScore": 10,
    "opponentScore": -5,
    "createdAt": "2026-01-12T10:35:00Z"
  },
  {
    "id": 2,
    "opponentId": 3,
    "opponentUsername": "player3",
    "result": "loss",
    "myScore": -5,
    "opponentScore": 10,
    "createdAt": "2026-01-12T09:20:00Z"
  },
  {
    "id": 3,
    "opponentId": 4,
    "opponentUsername": "player4",
    "result": "cancelled",
    "myScore": null,
    "opponentScore": null,
    "createdAt": "2026-01-12T08:15:00Z"
  }
]
```

### Error Response (401 Unauthorized)
```json
{
  "error": {
    "message": "Authentication required",
    "code": "AUTHENTICATION_REQUIRED",
    "status": 401
  }
}
```

## Notes

- La funzione `getMatchHistory` usa LEFT JOIN per i punteggi perché i match cancellati non hanno record nella tabella `scores`
- Il limite di 50 match è hardcoded per MVP, può essere reso configurabile in futuro
- I match vengono ordinati per `created_at DESC` per mostrare i più recenti per primi
- Il risultato viene determinato confrontando `winner_id` con `userId` per match completati
- Per match cancellati, il risultato è sempre "cancelled" e i punteggi sono null

## Status
✅ **COMPLETED** - Story 4.4 implementata e testata
