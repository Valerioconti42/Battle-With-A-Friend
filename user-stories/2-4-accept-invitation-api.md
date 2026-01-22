# Story 2.4: Accept Invitation API

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a player,
I want to accept an invitation from another player,
So that we can start a match.

## Acceptance Criteria

1. **Given** I am authenticated and have a pending invitation (id=1) from player2
   **When** I send a POST request to `/api/matches/invites/1/accept`
   **Then** The server responds with status 200 OK
   **And** The response contains the created match:
   ```json
   {
     "id": 1,
     "player1Id": 2,
     "player2Id": 1,
     "status": "pending",
     "createdAt": "2026-01-12T10:31:00Z"
   }
   ```
   **And** A match record is created in the database with:
   - player1_id = inviter_id from invitation
   - player2_id = current user id (accepter)
   - status = 'pending'
   **And** The invitation status is updated to 'accepted'
   **And** If the invitation doesn't exist, server responds with 404 Not Found
   **And** If the invitation has expired, server responds with 400 Bad Request with message "Invitation has expired"
   **And** If the invitation was already accepted/cancelled, server responds with 409 Conflict
   **And** If I try to accept my own invitation, server responds with 400 Bad Request
   **And** The endpoint requires authentication (JWT middleware)

## Tasks / Subtasks

- [x] Task 1: Create Match Model (AC: #1)
  - [x] Create `backend/src/models/match-model.js` file
  - [x] Implement `createMatch(player1Id, player2Id)` function
  - [x] Use SQL raw queries with prepared statements
  - [x] Return created match data with camelCase field names
  - [x] Handle database errors appropriately

- [x] Task 2: Extend Invitation Model (AC: #1)
  - [x] Add `findInvitationById(invitationId)` function to `backend/src/models/invitation-model.js`
  - [x] Add `acceptInvitation(invitationId, inviteeId)` function
  - [x] Use transaction to ensure atomicity (update invitation + create match)
  - [x] Check invitation exists, status, expiration, and ownership
  - [x] Update invitation status to 'accepted'
  - [x] Return invitation data with updated status

- [x] Task 3: Add Accept Route Handler (AC: #1)
  - [x] Add POST `/api/matches/invites/:invitationId/accept` route to `backend/src/routes/matches.js`
  - [x] Use JWT authentication middleware
  - [x] Validate invitationId parameter (must be integer)
  - [x] Call invitation model to accept invitation
  - [x] Handle all error cases (404, 400, 409)
  - [x] Return 200 OK with match data

- [x] Task 4: Write Tests (AC: #1)
  - [x] Create/update test file `backend/tests/routes/matches.test.js`
  - [x] Test successful invitation acceptance (200 OK with match data)
  - [x] Test 404 when invitation doesn't exist
  - [x] Test 400 when invitation has expired
  - [x] Test 409 when invitation already accepted/cancelled
  - [x] Test 400 when trying to accept own invitation
  - [x] Test 401 when not authenticated
  - [x] Test validation errors (invalid invitationId format)
  - [x] Test additional edge cases (cancelled invitation, wrong user)

## Dev Notes

### Relevant Architecture Patterns and Constraints

**API Patterns (from Architecture Document):**
- **Endpoints:** `/api/matches/invites/:invitationId/accept` (POST)
- **Request Format:** No body, invitationId in URL parameter
- **Response Format:** Success direct (match object), errors with wrapper
- **Error Format:** `{ error: { message, code, status, details } }`
- **Authentication:** JWT middleware required
- **Route Parameters:** Express `:param` syntax, camelCase naming

**Database Patterns:**
- **SQL Raw Queries:** No ORM, use raw SQL with prepared statements
- **Naming Convention:** snake_case in database, camelCase in API
- **Date Format:** ISO 8601 strings (YYYY-MM-DDTHH:mm:ssZ)
- **Transactions:** Use transactions for atomic operations (invitation update + match creation)

**Error Handling:**
- **NotFoundError:** Invitation doesn't exist (404)
- **ValidationError:** Expired invitation, accepting own invitation, invalid invitationId (400)
- **ConflictError:** Invitation already accepted/cancelled (409)
- **AuthenticationError:** Missing/invalid JWT token (401)

**Key Architectural Decisions:**
- Use database transaction to ensure atomicity: invitation status update and match creation must both succeed or both fail
- player1_id = inviter_id from invitation (the one who sent the invitation)
- player2_id = current user id (the one accepting the invitation)
- Match status starts as 'pending' (will be activated when WebSocket connection is established in future story)
- Invitation status updated to 'accepted' atomically with match creation
- Check expiration before accepting (expires_at < NOW())
- Check invitation ownership (invitee_id must match current user id)

**Source Tree Components to Touch:**
- `backend/src/models/match-model.js` (new - match database operations)
- `backend/src/models/invitation-model.js` (update - add findInvitationById and acceptInvitation)
- `backend/src/routes/matches.js` (update - add POST /api/matches/invites/:invitationId/accept route)
- `backend/tests/routes/matches.test.js` (update - add acceptance tests)

### Project Structure Notes

**Alignment with Unified Project Structure:**
- ✅ Models in `backend/src/models/` as specified
- ✅ Routes in `backend/src/routes/` as specified
- ✅ Tests in `backend/tests/routes/` as specified
- ✅ snake_case in database, camelCase in API
- ✅ File naming: kebab-case (match-model.js, invitation-model.js)

**Detected Conflicts or Variances:**
- None - follows Architecture document structure exactly

### Previous Story Intelligence

**Learnings from Story 2.2 (Create Invitation API):**
- Pattern per creazione modelli: `createX()` function con prepared statements
- Pattern per conversione snake_case → camelCase: funzione helper `toCamelCase()`
- Pattern per validazione: express-validator con error handling strutturato
- Pattern per error handling: Custom error classes (NotFoundError, ValidationError, ConflictError)
- Pattern per route: JWT middleware `authenticate` applicato prima della route handler
- Pattern per test: Jest + supertest, setup/teardown con test users, cleanup database

**Learnings from Story 2.3 (List Active Invitations API):**
- **CRITICAL:** Usare transazioni database per operazioni atomiche (prevenire race conditions)
- Pattern per transazioni: `beginTransaction()`, `commit()`, `rollback()` con try/catch
- Pattern per gestione errori: try/catch con rollback in caso di errore
- Pattern per query con JOIN: INNER JOIN con users per ottenere dati relazionali
- Pattern per conversione date: `new Date(row.timestamp).toISOString()` con null check
- **IMPORTANTE:** Sempre rilasciare connection in `finally` block

**Code Patterns Established:**
- Model functions: `export async function functionName(params) { const conn = await pool.getConnection(); try { ... } finally { conn.release(); } }`
- Transaction pattern: `await conn.beginTransaction(); try { ... await conn.commit(); } catch { await conn.rollback(); throw; }`
- Error handling: Custom error classes con status codes appropriati
- Response format: Success direct (no wrapper), errors with `{ error: { message, code, status, details } }`

**Files Created/Modified in Previous Stories:**
- `backend/src/models/invitation-model.js` - Pattern per model functions, transaction usage
- `backend/src/routes/matches.js` - Pattern per route handlers, error handling
- `backend/tests/routes/matches.test.js` - Pattern per test setup, cleanup, assertions

### Testing Standards Summary

**For This Story:**
- Integration tests for API endpoint
- Test all acceptance criteria scenarios
- Test transaction atomicity (rollback on error)
- Test all error cases (404, 400, 409, 401)
- Test validation errors
- Test authentication requirement
- Test database state after successful acceptance

**Testing Approach:**
- Use Jest and supertest for API tests
- Create test users and invitations in database
- Test transaction rollback by simulating database errors
- Clean up test data after tests
- Test with valid and invalid JWT tokens
- Verify both invitation status and match creation in database

**Test Structure:**
- `backend/tests/routes/matches.test.js` for route tests (add to existing file)
- Use Jest `describe` and `test` blocks
- Setup/teardown database state as needed
- Create test invitations with different statuses for error testing

### References

- **Architecture Document:** `_bmad-output/planning-artifacts/architecture.md`
  - Section: "API & Communication Patterns" → "REST endpoints", "Error Handling"
  - Section: "Data Architecture" → "Database Query Strategy" (SQL raw, transactions)
  - Section: "Naming Patterns" → "API Naming Conventions" (route parameters, camelCase)
- **Epics:** `_bmad-output/planning-artifacts/epics.md`
  - Story 2.4 Acceptance Criteria (lines 426-456)
  - Epic 2 context: Matchmaking & Invitation System
- **Previous Stories:**
  - Story 1.5: Authentication Middleware (JWT middleware pattern)
  - Story 2.1: Database Schema - Invitations and Matches Tables (database schema, matches table structure)
  - Story 2.2: Create Invitation API (invitation model pattern, error handling)
  - Story 2.3: List Active Invitations API (transaction pattern, error handling improvements)

### Implementation Guidelines

**Critical Requirements:**
1. **Transaction Atomicity:** Use database transaction to ensure invitation update and match creation are atomic
2. **Error Handling:** Handle all error cases with appropriate custom error classes
3. **Validation:** Validate invitationId parameter (must be integer, must exist)
4. **Business Logic:** 
   - Check invitation exists (404 if not)
   - Check invitation not expired (400 if expired)
   - Check invitation status is 'pending' (409 if already accepted/cancelled)
   - Check user is the invitee (400 if trying to accept own invitation)
5. **Response Format:** Success direct (match object), errors with wrapper structure
6. **Field Naming:** Convert snake_case (database) to camelCase (API response)

**What NOT to Do:**
- ❌ Don't create match without updating invitation status (must be atomic)
- ❌ Don't skip transaction (race condition risk)
- ❌ Don't use ORM or query builder (SQL raw only)
- ❌ Don't return snake_case in API responses (use camelCase)
- ❌ Don't skip validation (always validate input)
- ❌ Don't create match with wrong player order (player1 = inviter, player2 = accepter)

**Transaction Pattern:**
```javascript
// backend/src/models/invitation-model.js
export async function acceptInvitation(invitationId, inviteeId) {
  const conn = await pool.getConnection();
  
  try {
    await conn.beginTransaction();
    
    try {
      // 1. Find and validate invitation
      // 2. Check expiration, status, ownership
      // 3. Update invitation status to 'accepted'
      // 4. Create match record
      // 5. Commit transaction
      await conn.commit();
      return { invitation, match };
    } catch (error) {
      await conn.rollback();
      throw error;
    }
  } finally {
    conn.release();
  }
}
```

**Match Model Pattern:**
```javascript
// backend/src/models/match-model.js
import pool from '../utils/database.js';

function toCamelCase(row) {
  return {
    id: row.id,
    player1Id: row.player1_id,
    player2Id: row.player2_id,
    status: row.status,
    winnerId: row.winner_id,
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : null
  };
}

export async function createMatch(player1Id, player2Id) {
  const conn = await pool.getConnection();
  try {
    const query = `
      INSERT INTO matches (player1_id, player2_id, status)
      VALUES (?, ?, 'pending')
    `;
    const result = await conn.query(query, [player1Id, player2Id]);
    
    // Fetch created match
    const selectQuery = `SELECT * FROM matches WHERE id = ?`;
    const match = await conn.query(selectQuery, [result.insertId]);
    
    return toCamelCase(match[0]);
  } finally {
    conn.release();
  }
}
```

**Route Handler Pattern:**
```javascript
// backend/src/routes/matches.js
router.post(
  '/invites/:invitationId/accept',
  authenticate,
  [
    param('invitationId')
      .isInt({ min: 1 })
      .withMessage('Invitation ID must be a positive integer')
  ],
  async (req, res, next) => {
    try {
      const invitationId = parseInt(req.params.invitationId);
      const inviteeId = req.user.id;
      
      // Accept invitation (returns { invitation, match })
      const result = await acceptInvitation(invitationId, inviteeId);
      
      return res.status(200).json(result.match);
    } catch (error) {
      next(error);
    }
  }
);
```

**Future Dependencies:**
- Story 3.2 (WebSocket Connection for Match Start) will use matches with status 'pending' to start games
- Future stories will update match status to 'active' when game starts

## Dev Agent Record

### Agent Model Used

Auto (Cursor AI Agent)

### Debug Log References

No errors encountered during implementation. All code files created and updated successfully.

### Completion Notes List

✅ **Task 1 Complete:** Created match model:
- Created `backend/src/models/match-model.js` with `createMatch(player1Id, player2Id)` function
- Uses SQL raw queries with prepared statements
- Returns match data with camelCase field names (converted from snake_case)
- Follows same pattern as invitation-model.js and user-model.js
- Handles database errors appropriately with try/finally

✅ **Task 2 Complete:** Extended invitation model:
- Added `findInvitationById(invitationId)` function for invitation lookup
- Added `acceptInvitation(invitationId, inviteeId)` function with transaction support
- Uses database transaction to ensure atomicity: invitation update and match creation both succeed or both fail
- Validates invitation exists, not expired, status is 'pending', and user is the invitee
- Updates invitation status to 'accepted' atomically with match creation
- Returns both updated invitation and created match data
- All validations follow acceptance criteria requirements

✅ **Task 3 Complete:** Added accept route handler:
- Added POST `/api/matches/invites/:invitationId/accept` route to `backend/src/routes/matches.js`
- Uses JWT authentication middleware (`authenticate`)
- Validates invitationId parameter using express-validator `param()` (must be positive integer)
- Calls `acceptInvitation` from invitation model
- Handles all error cases: 404 (not found), 400 (expired, own invitation, wrong user), 409 (already accepted/cancelled), 401 (not authenticated)
- Returns 200 OK with match data (camelCase format)

✅ **Task 4 Complete:** Created comprehensive tests:
- Added test suite in `backend/tests/routes/matches.test.js`
- 9 tests covering all scenarios:
  - ✅ Successful invitation acceptance (200 OK with match data)
  - ✅ 404 when invitation doesn't exist
  - ✅ 400 when invitation has expired
  - ✅ 409 when invitation already accepted
  - ✅ 409 when invitation is cancelled
  - ✅ 400 when trying to accept own invitation
  - ✅ 400 when trying to accept invitation sent to someone else
  - ✅ 401 when not authenticated
  - ✅ 400 when invitationId is invalid (not integer, zero, negative)
- Tests verify database state (invitation status updated, match created)
- Tests verify transaction atomicity (both operations succeed together)

**Implementation Approach:**
- Followed red-green-refactor cycle: wrote tests first, then implementation
- Used transaction pattern from Story 2.3 for atomic operations
- Followed error handling patterns from previous stories
- Used same code patterns established in Stories 2.2 and 2.3
- All code follows Architecture document patterns exactly

**Acceptance Criteria Verification:**
- ✅ AC #1: All requirements met - endpoint, authentication, validation, error handling, database operations, transaction atomicity

### File List

**Created Files:**
- `backend/src/models/match-model.js` (new - match database operations)

**Modified Files:**
- `backend/src/models/invitation-model.js` (updated - added findInvitationById and acceptInvitation functions)
- `backend/src/routes/matches.js` (updated - added POST /api/matches/invites/:invitationId/accept route)
- `backend/tests/routes/matches.test.js` (updated - added 9 tests for Story 2.4)

## Change Log

### 2026-01-16 - Code Review Fixes

- **CRITICAL:** Modified `createMatch` in `backend/src/models/match-model.js` to accept optional `conn` parameter for transaction support, eliminating code duplication.
- **CRITICAL:** Refactored `acceptInvitation` in `backend/src/models/invitation-model.js` to use `createMatch` function instead of duplicating match creation logic.
- **MEDIUM:** Modified `findInvitationById` in `backend/src/models/invitation-model.js` to accept optional `conn` parameter for transaction support.
- **MEDIUM:** Removed manual match data conversion in `acceptInvitation`, now using `createMatch` which handles conversion via `toCamelCase` helper.
- **IMPROVEMENT:** Added import of `createMatch` from `match-model.js` in `invitation-model.js` to enable code reuse.

**Impact:**
- Eliminated code duplication (DRY principle)
- Improved maintainability (single source of truth for match creation)
- Better transaction support (functions can participate in transactions)
- Reduced risk of bugs from inconsistent implementations
