# Story 2.1: Database Schema - Invitations and Matches Tables

Status: approved

## Story

As a developer,
I want database tables for invitations and matches,
So that I can track game invitations and match state.

## Acceptance Criteria

1. **Given** The database connection is configured
   **When** I run the migration script `002_create_invitations_matches.sql`
   **Then** A table `invitations` exists with:
   - `id` INT PRIMARY KEY AUTO_INCREMENT
   - `inviter_id` INT NOT NULL (FK to users.id)
   - `invitee_id` INT NOT NULL (FK to users.id)
   - `status` ENUM('pending', 'accepted', 'expired', 'cancelled') NOT NULL DEFAULT 'pending'
   - `expires_at` TIMESTAMP NOT NULL
   - `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   - FOREIGN KEY constraints on inviter_id and invitee_id
   - INDEX `idx_invitations_invitee_status` on (invitee_id, status)
   - INDEX `idx_invitations_expires_at` on expires_at
   **And** A table `matches` exists with:
   - `id` INT PRIMARY KEY AUTO_INCREMENT
   - `player1_id` INT NOT NULL (FK to users.id)
   - `player2_id` INT NOT NULL (FK to users.id)
   - `status` ENUM('pending', 'active', 'completed', 'cancelled') NOT NULL
   - `winner_id` INT NULL (FK to users.id)
   - `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   - FOREIGN KEY constraints on player1_id, player2_id, winner_id
   - INDEX `idx_matches_status` on status
   - INDEX `idx_matches_player1` on player1_id
   - INDEX `idx_matches_player2` on player2_id
   **And** All naming follows snake_case convention
   **And** The migration file is versioned (002_create_invitations_matches.sql)

## Tasks / Subtasks

- [x] Task 1: Create Migration File (AC: #1)
  - [x] Create `backend/database/migrations/002_create_invitations_matches.sql`
  - [x] Define `invitations` table schema with all required columns
  - [x] Define `matches` table schema with all required columns
  - [x] Add FOREIGN KEY constraints
  - [x] Add required indexes
  - [x] Use snake_case naming convention

- [x] Task 2: Update Migration Script (AC: #1)
  - [x] Update `run-migration.js` to support multiple migrations
  - [x] Add script in `package.json` for migration 002

- [x] Task 3: Test Migration (AC: #1)
  - [x] Run migration script
  - [x] Verify tables are created correctly
  - [x] Verify foreign keys are set up
  - [x] Verify indexes are created

## Dev Notes

### Relevant Architecture Patterns and Constraints

**Database Patterns (from Architecture Document):**
- **SQL Raw Queries:** No ORM, use raw SQL
- **Manual Migrations:** SQL files in `database/migrations/`
- **Naming Convention:** snake_case for tables, columns, indexes
- **Engine:** InnoDB with utf8mb4 charset

**Key Architectural Decisions:**
- Foreign keys with CASCADE for invitations/matches (delete when user deleted)
- Foreign key with SET NULL for winner_id (preserve match if winner deleted)
- Composite index on (invitee_id, status) for efficient querying of active invitations
- Index on expires_at for efficient expiration cleanup queries

**Source Tree Components to Touch:**
- `backend/database/migrations/002_create_invitations_matches.sql` (new)
- `backend/src/utils/run-migration.js` (update to support multiple migrations)
- `backend/package.json` (add migrate:002 script)

### Project Structure Notes

**Alignment with Unified Project Structure:**
- ✅ Migration file in `backend/database/migrations/` as specified
- ✅ Versioned migration file (002_)
- ✅ snake_case naming convention

**Detected Conflicts or Variances:**
- None - follows Architecture document structure exactly

### Testing Standards Summary

**For This Story:**
- Manual testing: Run migration and verify tables
- Verify foreign key constraints
- Verify indexes are created
- Verify ENUM values are correct

**Testing Approach:**
- Run migration script: `npm run migrate:002`
- Check database schema: `DESCRIBE invitations`, `DESCRIBE matches`
- Verify foreign keys: `SHOW CREATE TABLE invitations`
- Verify indexes: `SHOW INDEX FROM invitations`

### References

- **Architecture Document:** `_bmad-output/planning-artifacts/architecture.md`
  - Section: "Database & Query Strategy" → "Manual Migrations", "snake_case naming"
- **Epics:** `_bmad-output/planning-artifacts/epics.md`
  - Story 2.1 Acceptance Criteria (lines 325-357)
  - Epic 2 context: Matchmaking & Invitation System
- **Previous Stories:**
  - Story 1.2: Database Schema - Users Table (migration pattern)

## Code Review

### Review Date
2026-01-16

### Reviewer
Auto (Cursor AI Agent)

### Overall Assessment
✅ **APPROVED** - Story implementation meets all acceptance criteria and follows architecture patterns correctly. Migration script works correctly and tables are created with all required constraints and indexes.

### Acceptance Criteria Verification

**AC #1: Database Schema - Invitations and Matches Tables**
- ✅ Migration script `002_create_invitations_matches.sql` exists and is versioned
- ✅ Table `invitations` created with all required columns:
  - ✅ `id` INT PRIMARY KEY AUTO_INCREMENT
  - ✅ `inviter_id` INT NOT NULL with FOREIGN KEY to users.id
  - ✅ `invitee_id` INT NOT NULL with FOREIGN KEY to users.id
  - ✅ `status` ENUM('pending', 'accepted', 'expired', 'cancelled') NOT NULL DEFAULT 'pending'
  - ✅ `expires_at` TIMESTAMP NOT NULL
  - ✅ `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  - ✅ FOREIGN KEY constraints on inviter_id and invitee_id (ON DELETE CASCADE)
  - ✅ INDEX `idx_invitations_invitee_status` on (invitee_id, status)
  - ✅ INDEX `idx_invitations_expires_at` on expires_at
- ✅ Table `matches` created with all required columns:
  - ✅ `id` INT PRIMARY KEY AUTO_INCREMENT
  - ✅ `player1_id` INT NOT NULL with FOREIGN KEY to users.id
  - ✅ `player2_id` INT NOT NULL with FOREIGN KEY to users.id
  - ✅ `status` ENUM('pending', 'active', 'completed', 'cancelled') NOT NULL
  - ✅ `winner_id` INT NULL with FOREIGN KEY to users.id (ON DELETE SET NULL)
  - ✅ `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  - ✅ FOREIGN KEY constraints on player1_id, player2_id, winner_id
  - ✅ INDEX `idx_matches_status` on status
  - ✅ INDEX `idx_matches_player1` on player1_id
  - ✅ INDEX `idx_matches_player2` on player2_id
- ✅ All naming follows snake_case convention
- ✅ Migration file is versioned (002_create_invitations_matches.sql)

### Code Quality Assessment

**Strengths:**
1. ✅ **Architecture Compliance:**
   - SQL raw queries (no ORM)
   - Manual migrations in `database/migrations/`
   - snake_case naming convention throughout
   - InnoDB engine with utf8mb4 charset
   - Follows Architecture document structure exactly

2. ✅ **Database Design:**
   - Proper foreign key constraints with appropriate ON DELETE actions
   - CASCADE for invitations/matches (cleanup when user deleted)
   - SET NULL for winner_id (preserve match history if winner deleted)
   - Composite index on (invitee_id, status) for efficient querying
   - Index on expires_at for expiration cleanup queries
   - All required indexes created

3. ✅ **Migration Script:**
   - Updated `run-migration.js` to support multiple migrations
   - Handles multi-line SQL statements correctly
   - Properly manages FOREIGN_KEY_CHECKS
   - Added `migrate:002` script in package.json
   - Good error handling and logging

4. ✅ **SQL Quality:**
   - Clean, readable SQL syntax
   - Proper use of ENUM types
   - Appropriate default values
   - Foreign key constraints properly defined
   - Indexes optimized for query patterns

**Issues Found:**
None - implementation is complete and correct.

### Architecture Conformance

**Database Patterns:**
- ✅ SQL raw queries (no ORM)
- ✅ Manual migrations in `database/migrations/`
- ✅ snake_case naming convention (tables, columns, indexes)
- ✅ InnoDB engine with utf8mb4 charset
- ✅ Proper foreign key constraints
- ✅ Indexes for performance optimization

**Project Structure:**
- ✅ Migration file in `backend/database/migrations/002_create_invitations_matches.sql`
- ✅ Versioned migration file (002_)
- ✅ Updated migration script in `backend/src/utils/run-migration.js`
- ✅ Added npm script in `backend/package.json`

### Test Coverage

**Manual Testing Completed:**
- ✅ Migration script executed successfully: `npm run migrate:002`
- ✅ Tables created: `invitations` and `matches` verified in database
- ✅ All columns present with correct types
- ✅ Foreign key constraints verified (ON DELETE CASCADE for inviter_id, invitee_id, player1_id, player2_id; ON DELETE SET NULL for winner_id)
- ✅ Indexes created: All required indexes verified
- ✅ ENUM values correct: All status values match requirements

**Test Results:**
```
✅ Dropped existing matches table (if existed)
✅ Dropped existing invitations table (if existed)
✅ Created invitations table
✅ Created matches table
✅ Migration completed successfully!
```

### Recommendations

**No blocking issues found.** Story is ready for approval.

**Optional Improvements (Future):**
1. Consider adding migration rollback scripts (if needed in future)
2. Consider adding migration version tracking table (if needed for production)
3. Consider adding data validation constraints (if needed)

### Final Verdict

✅ **APPROVED** - Story implementation is complete, functional, and follows all architecture patterns. All acceptance criteria met. Migration script works correctly. Tables created with all required constraints, indexes, and foreign keys. Ready for next story.

## Dev Agent Record

### Agent Model Used

Auto (Cursor AI Agent)

### Completion Notes List

✅ **Task 1 Complete:** Created migration file:
- Created `backend/database/migrations/002_create_invitations_matches.sql`
- Defined `invitations` table with all required columns, foreign keys, and indexes
- Defined `matches` table with all required columns, foreign keys, and indexes
- Used snake_case naming convention throughout
- Added proper foreign key constraints with appropriate ON DELETE actions

✅ **Task 2 Complete:** Updated migration script:
- Updated `run-migration.js` to support multiple migrations via command-line argument
- Improved SQL parsing to handle multi-line statements correctly
- Added proper handling of FOREIGN_KEY_CHECKS
- Added `migrate:002` script in `package.json`

✅ **Task 3 Complete:** Tested migration:
- Executed migration script successfully
- Verified tables created with correct schema
- Verified foreign key constraints
- Verified indexes created

**Acceptance Criteria Verification:**
- ✅ AC #1: All requirements met - tables, columns, foreign keys, indexes, naming conventions

**File List:**
- `backend/database/migrations/002_create_invitations_matches.sql` (new)
- `backend/src/utils/run-migration.js` (updated)
- `backend/package.json` (updated - added migrate:002 script)
