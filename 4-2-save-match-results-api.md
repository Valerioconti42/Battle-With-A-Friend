# Story 4.2: Save Match Results API

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a system,
I want to save match results and update player scores,
So that leaderboards and history can be maintained.

## Acceptance Criteria

1. **Given** A match has ended with a winner (status = 'completed', winner_id set)
   **When** The match result is processed
   **Then** Score records are created in the `scores` table:
   - One record for the winner: score_change = +10
   - One record for the loser: score_change = -5
   - Both records reference the match_id
   - Both records have the current total score for each player (calculated from previous scores + score_change)
   **And** The player's total score in the users table (if we add a score column) or calculated from scores table is updated
   **And** If match was cancelled (no winner), no scores are created
   **And** The score calculation happens server-side
   **And** Score updates are atomic (transaction ensures consistency)

## Tasks / Subtasks

- [x] Task 1: Create Score Model (AC: #1)
  - [x] Create `backend/src/models/score-model.js` file
  - [x] Implement `getPlayerTotalScore(playerId)` function
    - Calculates sum of all score_change values for the player
    - Returns 0 if no scores exist
    - Supports optional database connection for transactions
  - [x] Implement `saveMatchResults(matchId, winnerId, loserId)` function
    - Creates score records for both players (winner and loser)
    - Calculates current total scores before inserting
    - Uses transaction to ensure atomicity
    - Returns object with saved score records
    - Supports optional database connection for transactions

- [x] Task 2: Integrate Score Saving in Victory Handler (AC: #1)
  - [x] Modify `backend/src/game/game-loop.js`:
    - Import `saveMatchResults` from score-model
    - Call `saveMatchResults` after `completeMatch` in `handleVictory`
    - Use transaction to ensure atomicity (completeMatch + saveMatchResults)
    - Handle errors and rollback on failure

- [x] Task 3: Integrate Score Saving in Forfeit Handler (AC: #1)
  - [x] Modify `backend/src/routes/matches.js`:
    - Import `saveMatchResults` from score-model
    - Call `saveMatchResults` after `completeMatch` in forfeit endpoint
    - Use transaction to ensure atomicity (completeMatch + saveMatchResults)
    - Handle errors and rollback on failure

- [x] Task 4: Verify Cancelled Matches Don't Save Scores (AC: #1)
  - [x] Verify that `updateMatchStatus(matchId, 'cancelled')` does NOT call `saveMatchResults`
    - Check `backend/src/websocket/heartbeat-manager.js` (technical disconnection)
    - Check `backend/src/game/game-loop.js` (inactivity timeout)
  - [x] Confirm cancelled matches have no winner_id and no scores are created

- [x] Task 5: Write Tests (AC: #1)
  - [x] Create `backend/tests/models/score-model.test.js` file
  - [x] Test `getPlayerTotalScore` returns 0 for new player
  - [x] Test `saveMatchResults` creates correct score records
  - [x] Test cumulative scores are calculated correctly
  - [x] Test transaction atomicity (rollback on error)

## Dev Notes

### Relevant Architecture Patterns and Constraints

**Database Strategy (from Architecture Document):**
- **Query Strategy:** SQL raw (nessun ORM/Query Builder)
- **Database Library:** MariaDB native driver
- **Connection:** Connection pooling
- **Naming:** snake_case in database, camelCase in API responses
- **Transaction Management:** Manual transaction control for atomicity

**Score Calculation (from PRD FR-5):**
- **Win Score:** +10 points
- **Loss Score:** -5 points
- **Score Storage:** Each match creates two score records (one per player)
- **Total Score:** Calculated as sum of all score_change values (not stored in users table)

**Key Architectural Decisions:**
- **Score Calculation:** Server-side only, calculated from scores table (no score column in users table)
- **Transaction Atomicity:** Match completion and score saving happen in same transaction
- **Cancelled Matches:** No scores saved (no winner_id set)
- **Score Records:** Each record stores current total score after the match (for history tracking)

**Source Tree Components to Touch:**
- `backend/src/models/score-model.js` - Score model functions
- `backend/src/game/game-loop.js` - Victory handler integration
- `backend/src/routes/matches.js` - Forfeit handler integration
- `backend/tests/models/score-model.test.js` - Test suite

### Project Structure Notes

**Alignment with Unified Project Structure:**
- ✅ Model in `backend/src/models/` directory
- ✅ Tests in `backend/tests/models/` separate from src
- ✅ File naming: kebab-case (e.g., `score-model.js`)
- ✅ ES6 modules used throughout

**Detected Conflicts or Variances:**
- None - follows Architecture document structure exactly

### Testing Standards Summary

**For This Story:**
- Jest for unit tests
- Test all acceptance criteria scenarios
- Test score calculation (winner +10, loser -5)
- Test cumulative scores across multiple matches
- Test transaction atomicity (rollback on error)
- Test cancelled matches don't save scores (verified manually)

**Testing Approach:**
- Unit tests for score model functions
- Integration tests for score saving in victory/forfeit handlers
- Test database transactions
- Verify score calculations

**Test Structure:**
- `backend/tests/models/score-model.test.js` for score model tests
- Use Jest `describe` and `test` blocks
- Setup/teardown test data for each test
- Test deterministic score calculations

### References

- **Architecture Document:** `_bmad-output/planning-artifacts/architecture.md`
  - Section: "Data Architecture" → "Database Query Strategy" (SQL raw)
  - Section: "Data Architecture" → "Transaction Management"
- **PRD:** `_bmad-output/planning-artifacts/prd.md`
  - Section: "Requisiti Funzionali" → "FR-5: Registrazione Risultati Partita"
- **Epics:** `_bmad-output/planning-artifacts/epics.md`
  - Story 4.2 Acceptance Criteria (lines 888-906)
  - Epic 4 context: Results & Leaderboard System
- **Previous Stories:**
  - Story 4.1: Database Schema - Scores Table (scores table structure)
  - Story 3.8: Victory Condition - Weapon Hits Figure (victory detection)
  - Story 3.11: Explicit Forfeit (forfeit handling)

### Implementation Guidelines

**Critical Requirements:**
1. **Score Calculation:** Server-side only, calculated from scores table
2. **Transaction Atomicity:** Match completion and score saving in same transaction
3. **Score Values:** Winner +10, Loser -5 (as per PRD FR-5)
4. **Cancelled Matches:** No scores saved (no winner_id)
5. **Total Score:** Calculated as sum of score_change values

**What NOT to Do:**
- ❌ Don't save scores for cancelled matches (no winner_id)
- ❌ Don't calculate scores client-side (server-authoritative only)
- ❌ Don't store total score in users table (calculate from scores table)
- ❌ Don't skip transaction atomicity (must be atomic)

**Score Model Pattern:**
```javascript
// Get current total score
const totalScore = await getPlayerTotalScore(playerId);

// Save match results (atomic transaction)
const result = await saveMatchResults(matchId, winnerId, loserId, connection);
// Returns: { winner: { playerId, previousScore, scoreChange, newScore }, loser: {...} }
```

**Integration Pattern:**
```javascript
// In victory/forfeit handlers:
const connection = await pool.getConnection();
try {
  await connection.query('START TRANSACTION');
  
  // Complete match (update status and winner_id)
  await completeMatch(matchId, winnerId, connection);
  
  // Save match results and update scores
  await saveMatchResults(matchId, winnerId, loserId, connection);
  
  await connection.query('COMMIT');
} catch (error) {
  await connection.query('ROLLBACK');
  throw error;
} finally {
  connection.release();
}
```

## Code Review

**Data Review:** 2026-01-12  
**Reviewer:** Auto (Cursor AI Assistant)

### 📊 Riepilogo

**File Analizzati:**
- `backend/src/models/score-model.js`
- `backend/src/game/game-loop.js`
- `backend/src/routes/matches.js`
- `backend/tests/models/score-model.test.js`

**Test Status:** ✅ 4 test creati, tutti passati

### ✅ Verifica Acceptance Criteria

**AC #1: Save Match Results**
- ✅ Score records created for winner (+10) and loser (-5)
- ✅ Both records reference match_id
- ✅ Current total score calculated correctly (previous + score_change)
- ✅ Score calculation happens server-side only
- ✅ Score updates are atomic (transaction ensures consistency)
- ✅ Cancelled matches don't save scores (verified: updateMatchStatus doesn't call saveMatchResults)

**Valutazione:**
- ✅ **Score Model:** Corretto, funzioni ben implementate con supporto transazioni
- ✅ **Integration:** Corretta, integrata in victory handler e forfeit endpoint
- ✅ **Transaction Atomicity:** Garantita, match completion e score saving nella stessa transazione
- ✅ **Cancelled Matches:** Verificato, non salvano scores
- ✅ **Tests:** Completi, coprono tutti i casi principali

### 🔍 Analisi Dettagliata

#### Score Model Implementation

**Funzione `getPlayerTotalScore()`:**
- ✅ Calcola correttamente la somma di tutti i score_change
- ✅ Restituisce 0 se non ci sono scores
- ✅ Supporta connessione opzionale per transazioni
- ✅ Gestisce correttamente i casi edge (nessun risultato)

**Funzione `saveMatchResults()`:**
- ✅ Crea record per winner e loser
- ✅ Calcola correttamente i punteggi totali (previous + change)
- ✅ Usa transazione per atomicità
- ✅ Gestisce rollback in caso di errore
- ✅ Supporta connessione opzionale per transazioni esterne

#### Integration Points

**Victory Handler (`game-loop.js`):**
- ✅ Integrato correttamente in `handleVictory`
- ✅ Transazione atomica: completeMatch + saveMatchResults
- ✅ Gestione errori corretta con rollback
- ✅ Logging appropriato

**Forfeit Handler (`matches.js`):**
- ✅ Integrato correttamente nell'endpoint forfeit
- ✅ Transazione atomica: completeMatch + saveMatchResults
- ✅ Gestione errori corretta con rollback
- ✅ Logging appropriato

#### Cancelled Matches Verification

**Technical Disconnection (`heartbeat-manager.js`):**
- ✅ Chiama solo `updateMatchStatus(matchId, 'cancelled')`
- ✅ Non chiama `saveMatchResults`
- ✅ Corretto: no winner_id, no scores

**Inactivity Timeout (`game-loop.js`):**
- ✅ Chiama solo `updateMatchStatus(matchId, 'cancelled')`
- ✅ Non chiama `saveMatchResults`
- ✅ Corretto: no winner_id, no scores

### 📊 Risultati Finali

**Problemi Risolti:**
- ✅ Tutti i requisiti dell'acceptance criteria soddisfatti
- ✅ Transaction atomicity garantita
- ✅ Cancelled matches verificati (non salvano scores)

**Metriche:**
- **Linee di codice:** ~120 linee (score-model.js)
- **Funzioni:** 2 funzioni principali (getPlayerTotalScore, saveMatchResults)
- **Integration Points:** 2 (victory handler, forfeit handler)
- **Test Coverage:** 4 test (getPlayerTotalScore, saveMatchResults, cumulative scores, transaction atomicity)

## Dev Agent Record

### Agent Model Used

Auto (Cursor AI Assistant)

### Debug Log References

- Score saving logs: `[GameLoop] Match {matchId} completed and scores saved`
- Forfeit logs: `[Matches] Match {matchId} forfeited and scores saved`
- Transaction logs: Rollback on error, commit on success

### Completion Notes List

✅ **Task 1 Complete:** Created score model with:
- `getPlayerTotalScore()` function for calculating total scores
- `saveMatchResults()` function for saving match results with transaction support
- Proper error handling and transaction management

✅ **Task 2 Complete:** Integrated score saving in victory handler:
- Added `saveMatchResults` call after `completeMatch` in `handleVictory`
- Used transaction to ensure atomicity
- Proper error handling with rollback

✅ **Task 3 Complete:** Integrated score saving in forfeit handler:
- Added `saveMatchResults` call after `completeMatch` in forfeit endpoint
- Used transaction to ensure atomicity
- Proper error handling with rollback

✅ **Task 4 Complete:** Verified cancelled matches don't save scores:
- Checked `heartbeat-manager.js` (technical disconnection)
- Checked `game-loop.js` (inactivity timeout)
- Confirmed both only call `updateMatchStatus` with 'cancelled' status
- No `saveMatchResults` calls for cancelled matches

✅ **Task 5 Complete:** Written comprehensive test suite:
- 4 tests covering all main scenarios
- Tests for score calculation, cumulative scores, transaction atomicity
- All tests passing ✅

**Implementation Approach:**
- Created score model following the pattern from other models (match-model.js, user-model.js)
- Used transactions for atomicity (completeMatch + saveMatchResults)
- Integrated in both victory and forfeit handlers
- Verified cancelled matches don't save scores
- Created comprehensive test suite

### File List

**Created Files:**
- `backend/src/models/score-model.js` - Score model (~120 lines)
- `backend/tests/models/score-model.test.js` - Test suite (4 tests)

**Modified Files:**
- `backend/src/game/game-loop.js` - Integrated score saving in victory handler
- `backend/src/routes/matches.js` - Integrated score saving in forfeit handler

**Test Results:**
- ✅ 4/4 tests passing (100%)
- ✅ All acceptance criteria verified
- ✅ Transaction atomicity tested
- ✅ Cancelled matches verified (no scores saved)
