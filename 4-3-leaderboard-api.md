# Story 4.3: Leaderboard API

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a player,
I want to see the global leaderboard,
So that I can see how I rank compared to other players.

## Acceptance Criteria

1. **Given** Multiple players have played matches and have scores
   **When** I send a GET request to `/api/leaderboard`
   **Then** The server responds with status 200 OK
   **And** The response contains an array of players sorted by total score (descending):
   ```json
   [
     {
       "rank": 1,
       "userId": 3,
       "username": "player3",
       "totalScore": 50
     },
     {
       "rank": 2,
       "userId": 1,
       "username": "player1",
       "totalScore": 35
     }
   ]
   ```
   **And** Players with the same score have the same rank (ties)
   **And** The query is optimized with proper indexes (NFR-2)
   **And** All registered players are included (even with 0 score)
   **And** The endpoint requires authentication (JWT middleware)
   **And** The response includes my current rank if I'm in the leaderboard

## Tasks / Subtasks

- [x] Task 1: Create Leaderboard Model Function (AC: #1)
  - [x] Add `getLeaderboard(currentUserId)` function to `backend/src/models/score-model.js`
  - [x] Query all users with LEFT JOIN to scores table
  - [x] Calculate total score as SUM of score_change values
  - [x] Include all registered players (even with 0 score)
  - [x] Sort by total score descending, then by user ID ascending
  - [x] Calculate ranks (same score = same rank)
  - [x] Track current user's rank if provided
  - [x] Use indexes for optimization (idx_scores_player_id)

- [x] Task 2: Create Leaderboard Route (AC: #1)
  - [x] Create `backend/src/routes/leaderboard.js` file
  - [x] Implement GET `/api/leaderboard` endpoint
  - [x] Require JWT authentication middleware
  - [x] Call `getLeaderboard` with current user ID
  - [x] Return 200 OK with leaderboard array
  - [x] Handle errors appropriately

- [x] Task 3: Register Leaderboard Route (AC: #1)
  - [x] Import leaderboard routes in `backend/src/server.js`
  - [x] Register route at `/api/leaderboard`
  - [x] Verify route is accessible

- [x] Task 4: Write Tests (AC: #1)
  - [x] Create `backend/tests/routes/leaderboard.test.js` file
  - [x] Test authentication required (401 without token)
  - [x] Test leaderboard sorted by score descending
  - [x] Test all players included (even with 0 score)
  - [x] Test same rank for players with same score (ties)
  - [x] Test correct response format

## Dev Notes

### Relevant Architecture Patterns and Constraints

**Database Strategy (from Architecture Document):**
- **Query Strategy:** SQL raw (nessun ORM/Query Builder)
- **Database Library:** MariaDB native driver
- **Connection:** Connection pooling
- **Naming:** snake_case in database, camelCase in API responses
- **Query Optimization:** Use indexes for efficient queries (NFR-2)

**API Patterns (from Architecture Document):**
- **Endpoints:** RESTful plurali, camelCase parametri → `/api/leaderboard`
- **Response Format:** Successo diretto (no wrapper), errori con wrapper
- **JSON Fields:** camelCase (conversione da snake_case database)
- **Authentication:** JWT middleware required

**Key Architectural Decisions:**
- **Leaderboard Calculation:** Server-side only, calculated from scores table
- **Rank Calculation:** Same score = same rank (ties handled correctly)
- **Query Optimization:** LEFT JOIN with GROUP BY, uses idx_scores_player_id index
- **All Players Included:** LEFT JOIN ensures users with 0 score are included

**Source Tree Components to Touch:**
- `backend/src/models/score-model.js` - Leaderboard query function
- `backend/src/routes/leaderboard.js` - Leaderboard route handler
- `backend/src/server.js` - Route registration
- `backend/tests/routes/leaderboard.test.js` - Test suite

### Project Structure Notes

**Alignment with Unified Project Structure:**
- ✅ Route in `backend/src/routes/` directory
- ✅ Model function in `backend/src/models/` directory
- ✅ Tests in `backend/tests/routes/` separate from src
- ✅ File naming: kebab-case (e.g., `leaderboard.js`)
- ✅ ES6 modules used throughout

**Detected Conflicts or Variances:**
- None - follows Architecture document structure exactly

### Testing Standards Summary

**For This Story:**
- Jest for unit and integration tests
- Test all acceptance criteria scenarios
- Test authentication requirement
- Test leaderboard sorting and ranking
- Test ties handling (same score = same rank)
- Test all players included (even with 0 score)

**Testing Approach:**
- Integration tests for API endpoint
- Test database queries with test data
- Verify response format matches acceptance criteria
- Test edge cases (no scores, ties, etc.)

**Test Structure:**
- `backend/tests/routes/leaderboard.test.js` for API endpoint tests
- Use Jest `describe` and `test` blocks
- Setup/teardown test data for each test
- Use supertest for HTTP requests

### References

- **Architecture Document:** `_bmad-output/planning-artifacts/architecture.md`
  - Section: "Data Architecture" → "Database Query Strategy" (SQL raw)
  - Section: "API & Communication Patterns" → "API Endpoints" (RESTful)
  - Section: "Performance Requirements" → "Query Optimization" (NFR-2)
- **PRD:** `_bmad-output/planning-artifacts/prd.md`
  - Section: "Requisiti Funzionali" → "FR-6: Sistema Classifica"
- **Epics:** `_bmad-output/planning-artifacts/epics.md`
  - Story 4.3 Acceptance Criteria (lines 908-940)
  - Epic 4 context: Results & Leaderboard System
- **Previous Stories:**
  - Story 4.1: Database Schema - Scores Table (scores table structure)
  - Story 4.2: Save Match Results API (score saving logic)

### Implementation Guidelines

**Critical Requirements:**
1. **Query Optimization:** Use LEFT JOIN with GROUP BY, leverage idx_scores_player_id index
2. **Rank Calculation:** Same score = same rank (ties handled correctly)
3. **All Players:** Include all registered players (even with 0 score)
4. **Authentication:** JWT middleware required
5. **Response Format:** Array of players with rank, userId, username, totalScore

**What NOT to Do:**
- ❌ Don't exclude players with 0 score (all players must be included)
- ❌ Don't calculate ranks incorrectly (same score must have same rank)
- ❌ Don't skip authentication (JWT required)
- ❌ Don't use inefficient queries (must use indexes)

**Leaderboard Query Pattern:**
```sql
SELECT 
  u.id as user_id,
  u.username,
  COALESCE(SUM(s.score_change), 0) as total_score
FROM users u
LEFT JOIN scores s ON u.id = s.player_id
GROUP BY u.id, u.username
ORDER BY total_score DESC, u.id ASC
```

**Rank Calculation:**
- Iterate through sorted results
- Track previous score
- If current score differs from previous, increment rank
- Same score = same rank (ties)

## Code Review

**Data Review:** 2026-01-12  
**Reviewer:** Auto (Cursor AI Assistant)

### 📊 Riepilogo

**File Analizzati:**
- `backend/src/models/score-model.js` - getLeaderboard function
- `backend/src/routes/leaderboard.js` - Leaderboard route handler
- `backend/src/server.js` - Route registration
- `backend/tests/routes/leaderboard.test.js` - Test suite

**Test Status:** ✅ 5 test creati, tutti passati

### ✅ Verifica Acceptance Criteria

**AC #1: Leaderboard API**
- ✅ GET `/api/leaderboard` endpoint implemented
- ✅ Returns 200 OK with array of players
- ✅ Players sorted by total score descending
- ✅ Same score = same rank (ties handled correctly)
- ✅ All registered players included (even with 0 score)
- ✅ Query optimized with indexes (LEFT JOIN uses idx_scores_player_id)
- ✅ Authentication required (JWT middleware)
- ✅ Response format matches acceptance criteria (rank, userId, username, totalScore)
- ✅ Current user's rank included in array (can find themselves by userId)

**Valutazione:**
- ✅ **Query Optimization:** LEFT JOIN with GROUP BY, uses idx_scores_player_id index
- ✅ **Rank Calculation:** Correctly handles ties (same score = same rank)
- ✅ **All Players:** LEFT JOIN ensures users with 0 score are included
- ✅ **Authentication:** JWT middleware correctly applied
- ✅ **Response Format:** Matches acceptance criteria exactly
- ✅ **Tests:** Comprehensive test coverage

### 🔍 Analisi Dettagliata

#### Leaderboard Query

**Query Implementation:**
- ✅ Uses LEFT JOIN to include users with 0 score
- ✅ Groups by user to sum score_change values
- ✅ Orders by total_score DESC, then user_id ASC (for consistent ordering)
- ✅ Uses COALESCE to handle NULL scores (defaults to 0)
- ✅ Leverages idx_scores_player_id index for performance

**Rank Calculation:**
- ✅ Correctly calculates ranks (same score = same rank)
- ✅ Handles ties properly
- ✅ Tracks current user's rank if provided

#### Route Handler

**Implementation:**
- ✅ GET `/api/leaderboard` endpoint created
- ✅ JWT authentication middleware applied
- ✅ Calls getLeaderboard with current user ID
- ✅ Returns 200 OK with leaderboard array
- ✅ Error handling via Express error handler

### 📊 Risultati Finali

**Problemi Risolti:**
- ✅ Tutti i requisiti dell'acceptance criteria soddisfatti
- ✅ Query ottimizzata con indici
- ✅ Rank calculation corretta (ties handled)

**Metriche:**
- **Linee di codice:** ~70 linee (getLeaderboard function)
- **Route handler:** ~20 linee
- **Test Coverage:** 5 test (authentication, sorting, ties, all players, format)
- **Query Performance:** Ottimizzata con LEFT JOIN e indici

## Dev Agent Record

### Agent Model Used

Auto (Cursor AI Assistant)

### Debug Log References

Nessun log necessario per questa story (endpoint REST standard).

### Completion Notes List

✅ **Task 1 Complete:** Created getLeaderboard function with:
- LEFT JOIN query to include all users
- Total score calculation (SUM of score_change)
- Rank calculation with ties handling
- Current user rank tracking

✅ **Task 2 Complete:** Created leaderboard route with:
- GET `/api/leaderboard` endpoint
- JWT authentication middleware
- Error handling

✅ **Task 3 Complete:** Registered leaderboard route:
- Added import in server.js
- Registered at `/api/leaderboard`

✅ **Task 4 Complete:** Written comprehensive test suite:
- 5 tests covering all scenarios
- Authentication, sorting, ties, all players, format
- All tests passing ✅

**Implementation Approach:**
- Created getLeaderboard function following SQL raw pattern
- Used LEFT JOIN to include all users (even with 0 score)
- Implemented rank calculation with ties handling
- Created route handler with JWT authentication
- Registered route in server.js
- Created comprehensive test suite

### File List

**Created Files:**
- `backend/src/routes/leaderboard.js` - Leaderboard route handler (~20 lines)
- `backend/tests/routes/leaderboard.test.js` - Test suite (5 tests)

**Modified Files:**
- `backend/src/models/score-model.js` - Added getLeaderboard function (~70 lines)
- `backend/src/server.js` - Registered leaderboard route

**Test Results:**
- ✅ 5/5 tests passing (100%)
- ✅ All acceptance criteria verified
- ✅ Query optimization verified
- ✅ Rank calculation verified (ties handled correctly)
