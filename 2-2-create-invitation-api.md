# Story 2.2: Create Invitation API

Status: approved

## Story

As a player,
I want to invite a friend to play by their username,
So that we can start a match together.

## Acceptance Criteria

1. **Given** I am authenticated (JWT token valid)
   **When** I send a POST request to `/api/matches/invite` with:
   ```json
   {
     "username": "player2"
   }
   ```
   **Then** The server responds with status 201 Created
   **And** The response contains:
   ```json
   {
     "id": 1,
     "inviterId": 1,
     "inviteeId": 2,
     "status": "pending",
     "expiresAt": "2026-01-12T10:33:00Z",
     "createdAt": "2026-01-12T10:30:00Z"
   }
   ```
   **And** An invitation record is created in the database with:
   - inviter_id = current user id
   - invitee_id = user id of the username provided
   - status = 'pending'
   - expires_at = current time + 3 minutes
   **And** If the username doesn't exist, server responds with 404 Not Found using NotFoundError class
   **And** If I try to invite myself, server responds with 400 Bad Request using ValidationError class
   **And** If there's already a pending invitation between these users, server responds with 409 Conflict
   **And** express-validator validates the username input
   **And** The endpoint requires authentication (JWT middleware)

## Tasks / Subtasks

- [x] Task 1: Create Invitation Model (AC: #1)
  - [x] Create `backend/src/models/invitation-model.js`
  - [x] Implement `findUserByUsername(username)` helper (reuses from user-model)
  - [x] Implement `createInvitation(inviterId, inviteeId)` function
  - [x] Check for existing pending invitations
  - [x] Set expires_at to current time + 3 minutes
  - [x] Return invitation data with camelCase field names

- [x] Task 2: Create Matches Route (AC: #1)
  - [x] Create `backend/src/routes/matches.js` file
  - [x] Implement POST `/api/matches/invite` route handler
  - [x] Add express-validator validation for username
  - [x] Use JWT authentication middleware
  - [x] Handle all error cases (404, 400, 409)

- [x] Task 3: Update Server Configuration (AC: #1)
  - [x] Add matches routes to `backend/src/server.js`
  - [x] Ensure error handling middleware is configured
  - [x] Add NotFoundError handling to error handler

- [x] Task 4: Create Tests (AC: #1)
  - [x] Create `backend/tests/routes/matches.test.js`
  - [x] Test successful invitation creation
  - [x] Test 404 when username doesn't exist
  - [x] Test 400 when inviting yourself
  - [x] Test 409 when invitation already exists
  - [x] Test 401 when not authenticated
  - [x] Test validation errors

## Dev Notes

### Relevant Architecture Patterns and Constraints

**API Patterns (from Architecture Document):**
- **Endpoints:** `/api/matches/invite` (POST)
- **Request Format:** JSON with camelCase fields
- **Response Format:** Success direct, errors with wrapper
- **Error Format:** `{ error: { message, code, status, details } }`
- **Authentication:** JWT middleware required

**Database Patterns:**
- **SQL Raw Queries:** No ORM, use raw SQL
- **Naming Convention:** snake_case in database, camelCase in API
- **Date Format:** ISO 8601 strings (YYYY-MM-DDTHH:mm:ssZ)

**Error Handling:**
- **NotFoundError:** Username doesn't exist (404)
- **ValidationError:** Inviting yourself, validation failures (400)
- **ConflictError:** Pending invitation already exists (409)
- **AuthenticationError:** Missing/invalid JWT token (401)

**Key Architectural Decisions:**
- Invitation expires after 3 minutes (expires_at = now + 3 minutes)
- Check for existing pending invitations before creating new one
- Use JWT middleware to get current user from token
- Convert snake_case database fields to camelCase in API response

**Source Tree Components to Touch:**
- `backend/src/models/invitation-model.js` (new)
- `backend/src/routes/matches.js` (new)
- `backend/src/server.js` (update - add matches routes)
- `backend/tests/routes/matches.test.js` (new)

### Project Structure Notes

**Alignment with Unified Project Structure:**
- ✅ Models in `backend/src/models/`
- ✅ Routes in `backend/src/routes/`
- ✅ Tests in `backend/tests/routes/`
- ✅ snake_case in database, camelCase in API

**Detected Conflicts or Variances:**
- None - follows Architecture document structure exactly

### Testing Standards Summary

**For This Story:**
- Unit tests for invitation model functions
- Integration tests for API endpoint
- Test all error cases (404, 400, 409, 401)
- Test validation errors
- Test authentication requirement

**Testing Approach:**
- Use Jest and supertest for API tests
- Create test users in database
- Clean up test data after tests
- Test with valid and invalid JWT tokens

### References

- **Architecture Document:** `_bmad-output/planning-artifacts/architecture.md`
  - Section: "API & Communication Patterns" → "REST endpoints", "Error Handling"
- **Epics:** `_bmad-output/planning-artifacts/epics.md`
  - Story 2.2 Acceptance Criteria (lines 359-395)
  - Epic 2 context: Matchmaking & Invitation System
- **Previous Stories:**
  - Story 1.3: User Registration API (validation pattern)
  - Story 1.4: User Login API (JWT pattern)
  - Story 1.5: Authentication Middleware (JWT middleware)
  - Story 2.1: Database Schema - Invitations and Matches Tables (database schema)

## Dev Agent Record

### Agent Model Used

Auto (Cursor AI Agent)

### Completion Notes List

✅ **Task 1 Complete:** Created invitation model:
- Created `backend/src/models/invitation-model.js`
- Implemented `createInvitation(inviterId, inviteeId)` function
- Checks for existing pending invitations before creating new one
- Sets expires_at to current time + 3 minutes
- Returns invitation data with camelCase field names (converted from snake_case)
- Reuses `findByUsername` from user-model via `findUserByUsername` helper

✅ **Task 2 Complete:** Created matches route:
- Created `backend/src/routes/matches.js` file
- Implemented POST `/api/matches/invite` route handler
- Added express-validator validation for username (required, string, 3-50 chars)
- Uses JWT authentication middleware (`authenticate`)
- Handles all error cases:
  - 404: Username not found (NotFoundError)
  - 400: Inviting yourself (ValidationError)
  - 409: Pending invitation already exists (ConflictError from model)
  - 401: Not authenticated (handled by middleware)

✅ **Task 3 Complete:** Updated server configuration:
- Added matches routes to `backend/src/server.js` (`/api/matches`)
- Added NotFoundError handling to error handler middleware
- Error handling middleware properly configured

✅ **Task 4 Complete:** Created comprehensive tests:
- Created `backend/tests/routes/matches.test.js`
- 8 tests covering all scenarios:
  - ✅ Successful invitation creation (201)
  - ✅ 404 when username doesn't exist
  - ✅ 400 when inviting yourself
  - ✅ 409 when pending invitation already exists
  - ✅ 401 when not authenticated
  - ✅ 400 when username is missing
  - ✅ 400 when username is empty
  - ✅ 400 when username is too short
- All tests passing ✅

**Acceptance Criteria Verification:**
- ✅ AC #1: All requirements met - endpoint, authentication, validation, error handling, database operations

**File List:**
- `backend/src/models/invitation-model.js` (new)
- `backend/src/routes/matches.js` (new)
- `backend/src/server.js` (updated - added matches routes)
- `backend/src/middleware/error-handler.js` (updated - added NotFoundError handling)
- `backend/tests/routes/matches.test.js` (new)

## Code Review

### Review Date
2026-01-16

### Reviewer
Auto (Cursor AI Agent)

### Overall Assessment
✅ **APPROVED** - Story implementation meets all acceptance criteria and follows architecture patterns correctly. API endpoint is secure, well-tested, and handles all error cases appropriately.

### Acceptance Criteria Verification

**AC #1: Create Invitation API**
- ✅ Endpoint `POST /api/matches/invite` implemented
- ✅ Requires JWT authentication (middleware `authenticate`)
- ✅ Returns 201 Created on success
- ✅ Response contains all required fields: id, inviterId, inviteeId, status, expiresAt, createdAt
- ✅ Response format uses camelCase (converted from snake_case database)
- ✅ Invitation record created with:
  - ✅ inviter_id = current user id (from JWT token)
  - ✅ invitee_id = user id from username lookup
  - ✅ status = 'pending'
  - ✅ expires_at = current time + 3 minutes
- ✅ Returns 404 Not Found when username doesn't exist (NotFoundError)
- ✅ Returns 400 Bad Request when inviting yourself (ValidationError)
- ✅ Returns 409 Conflict when pending invitation already exists (ConflictError)
- ✅ express-validator validates username input (required, string, 3-50 chars)
- ✅ JWT middleware required and working correctly

### Code Quality Assessment

**Strengths:**
1. ✅ **Architecture Compliance:**
   - RESTful endpoint naming (`/api/matches/invite`)
   - camelCase in API, snake_case in database
   - ISO 8601 date format in responses
   - Error format follows Architecture document
   - JWT authentication middleware used correctly

2. ✅ **Database Operations:**
   - SQL raw queries (no ORM) as specified
   - Prepared statements for security
   - Proper connection pool usage
   - Transaction safety (connection released in finally block)
   - Check for existing pending invitations (bidirectional)

3. ✅ **Error Handling:**
   - All error cases handled correctly (404, 400, 409, 401)
   - Appropriate error classes used (NotFoundError, ValidationError, ConflictError)
   - Error messages are user-friendly
   - Error format consistent with Architecture document

4. ✅ **Security:**
   - JWT authentication required
   - Input validation with express-validator
   - SQL injection prevention (prepared statements)
   - Self-invitation prevention
   - Username lookup before invitation creation

5. ✅ **Business Logic:**
   - Expiration time correctly set (3 minutes from now)
   - Bidirectional invitation check (prevents duplicate invitations)
   - Proper status management ('pending')
   - User lookup before invitation creation

6. ✅ **Code Organization:**
   - Clear separation of concerns (model, route, middleware)
   - Reusable helper functions
   - Proper error propagation
   - Clean code structure

**Issues Found:**
None - implementation is complete and correct.

### Architecture Conformance

**API Patterns:**
- ✅ Endpoint: `/api/matches/invite` (POST)
- ✅ Request format: JSON with camelCase fields
- ✅ Response format: Direct success, error wrapper
- ✅ Error format: `{ error: { message, code, status, details } }`
- ✅ Authentication: JWT middleware required

**Database Patterns:**
- ✅ SQL raw queries (no ORM)
- ✅ snake_case in database, camelCase in API
- ✅ Prepared statements for security
- ✅ Connection pool usage

**Error Handling:**
- ✅ NotFoundError for missing username (404)
- ✅ ValidationError for self-invitation and validation failures (400)
- ✅ ConflictError for existing pending invitations (409)
- ✅ AuthenticationError for missing/invalid JWT (401)

**Project Structure:**
- ✅ Model in `backend/src/models/invitation-model.js`
- ✅ Route in `backend/src/routes/matches.js`
- ✅ Tests in `backend/tests/routes/matches.test.js`
- ✅ Error handler updated with NotFoundError support

### Test Coverage

**Test Results:**
- ✅ 8 tests, all passing
- ✅ Successful invitation creation (201)
- ✅ 404 when username doesn't exist
- ✅ 400 when inviting yourself
- ✅ 409 when pending invitation already exists
- ✅ 401 when not authenticated
- ✅ 400 when username is missing
- ✅ 400 when username is empty
- ✅ 400 when username is too short

**Test Quality:**
- ✅ Comprehensive coverage of all scenarios
- ✅ Proper test data setup and cleanup
- ✅ JWT token generation for authenticated tests
- ✅ Database state verification
- ✅ Edge cases covered (empty, too short, missing)

**Test Execution:**
```
Test Suites: 1 passed, 1 total
Tests:       8 passed, 8 total
```

### Security Review

**Authentication & Authorization:**
- ✅ JWT authentication required (middleware)
- ✅ User ID extracted from JWT token (not from request body)
- ✅ Self-invitation prevented (business rule)

**Input Validation:**
- ✅ express-validator validates username
- ✅ Username length constraints (3-50 chars)
- ✅ Username type validation (string)
- ✅ Empty username rejected

**SQL Injection Prevention:**
- ✅ Prepared statements used throughout
- ✅ No string concatenation in SQL queries
- ✅ Parameterized queries for all database operations

**Data Integrity:**
- ✅ Foreign key constraints enforced (database level)
- ✅ Duplicate invitation prevention (application level)
- ✅ Expiration time correctly calculated

### Recommendations

**No blocking issues found.** Story is ready for approval.

**Optional Improvements (Future):**
1. Consider adding rate limiting for invitation creation (prevent spam)
2. Consider adding invitation cancellation endpoint (if needed)
3. Consider adding invitation history/listing endpoint (Story 2.3)
4. Consider adding notification system for invitations (future epic)

### Final Verdict

✅ **APPROVED** - Story implementation is complete, functional, secure, and follows all architecture patterns. All acceptance criteria met. Comprehensive test coverage. Error handling is robust. Code quality is excellent. Ready for merge and next story.
