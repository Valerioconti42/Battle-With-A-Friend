# Story 4.1: Database Schema - Scores Table

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a developer,
I want a scores table to track player scores,
So that I can calculate leaderboards and track player progress.

## Acceptance Criteria

1. **Given** The database connection is configured
   **When** I run the migration script `004_create_scores.sql`
   **Then** A table `scores` exists with:
   - `id` INT PRIMARY KEY AUTO_INCREMENT
   - `match_id` INT NOT NULL (FK to matches.id)
   - `player_id` INT NOT NULL (FK to users.id)
   - `score` INT NOT NULL (current total score for player)
   - `score_change` INT NOT NULL (+10 for win, -5 for loss)
   - `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   - FOREIGN KEY constraints on match_id and player_id
   - INDEX `idx_scores_player_id` on player_id
   - INDEX `idx_scores_match_id` on match_id
   **And** All naming follows snake_case convention
   **And** The migration file is versioned (004_create_scores.sql)

## Tasks / Subtasks

- [x] Task 1: Create Migration File (AC: #1)
  - [x] Create `backend/database/migrations/004_create_scores.sql` file
  - [x] Define table structure with all required columns
  - [x] Add FOREIGN KEY constraints on match_id and player_id
  - [x] Add indexes: idx_scores_player_id, idx_scores_match_id, idx_scores_player_score
  - [x] Use snake_case naming convention for all identifiers
  - [x] Add comments for score and score_change columns
  - [x] Use InnoDB engine and utf8mb4 charset

## Dev Notes

### Relevant Architecture Patterns and Constraints

**Database Strategy (from Architecture Document):**
- **Query Strategy:** SQL raw (nessun ORM/Query Builder)
- **Database Library:** MariaDB native driver
- **Connection:** Connection pooling
- **Naming:** snake_case in database, camelCase in API responses
- **Migration Strategy:** Manual SQL files in `database/migrations/` directory

**Key Architectural Decisions:**
- **Score Tracking:** Each match creates two score records (one for winner, one for loser)
- **Score Calculation:** Total score is stored in each record (calculated from previous scores + score_change)
- **Indexes:** Multiple indexes for efficient leaderboard queries (player_id, match_id, player_id+score)
- **Foreign Keys:** CASCADE delete to maintain referential integrity

**Source Tree Components to Touch:**
- `backend/database/migrations/004_create_scores.sql` - Migration file

### Project Structure Notes

**Alignment with Unified Project Structure:**
- ✅ Migration file in `backend/database/migrations/` directory
- ✅ File naming: versioned format `004_create_scores.sql`
- ✅ Follows snake_case naming convention for database identifiers

**Detected Conflicts or Variances:**
- None - follows Architecture document structure exactly

### Testing Standards Summary

**For This Story:**
- Manual verification: Run migration script against database
- Verify table structure matches acceptance criteria
- Verify indexes are created correctly
- Verify foreign key constraints work correctly

**Testing Approach:**
- Manual execution of migration script
- Verify table structure using `DESCRIBE scores;`
- Verify indexes using `SHOW INDEXES FROM scores;`
- Test foreign key constraints by attempting invalid inserts

### References

- **Architecture Document:** `_bmad-output/planning-artifacts/architecture.md`
  - Section: "Data Architecture" → "Database Query Strategy" (SQL raw)
  - Section: "Data Architecture" → "Migration Strategy" (Manual SQL)
  - Section: "Naming Patterns" → "Database Naming Conventions" (snake_case rules)
- **PRD:** `_bmad-output/planning-artifacts/prd.md`
  - Section: "Requisiti Funzionali" → "FR-5: Registrazione Risultati Partita"
  - Section: "Requisiti Funzionali" → "FR-6: Sistema Classifica"
- **Epics:** `_bmad-output/planning-artifacts/epics.md`
  - Story 4.1 Acceptance Criteria (lines 865-886)
  - Epic 4 context: Results & Leaderboard System
- **Previous Stories:**
  - Story 1.2: Database Schema - Users Table (users table structure)
  - Story 2.1: Database Schema - Invitations and Matches Tables (matches table structure)

### Implementation Guidelines

**Critical Requirements:**
1. **Migration File:** Must be in `backend/database/migrations/` directory
2. **File Naming:** Versioned format `004_create_scores.sql` (leading zeros for sorting)
3. **SQL Syntax:** Valid MariaDB syntax, no database-specific extensions unless necessary
4. **Naming:** All identifiers must follow snake_case convention
5. **Indexes:** Must use `idx_` prefix as specified in Architecture document
6. **Foreign Keys:** CASCADE delete to maintain referential integrity

**What NOT to Do:**
- ❌ Don't create application code that uses this table yet (that's Story 4.2+)
- ❌ Don't add columns not specified in acceptance criteria
- ❌ Don't use camelCase or PascalCase for database identifiers
- ❌ Don't create ORM or query builder dependencies

**Table Structure:**
```sql
CREATE TABLE scores (
  id INT PRIMARY KEY AUTO_INCREMENT,
  match_id INT NOT NULL,
  player_id INT NOT NULL,
  score INT NOT NULL COMMENT 'Current total score for player after this match',
  score_change INT NOT NULL COMMENT 'Score change for this match (+10 for win, -5 for loss)',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE,
  FOREIGN KEY (player_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_scores_player_id (player_id),
  INDEX idx_scores_match_id (match_id),
  INDEX idx_scores_player_score (player_id, score)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

## Code Review

**Data Review:** 2026-01-12  
**Reviewer:** Auto (Cursor AI Assistant)

### 📊 Riepilogo

**File Analizzati:**
- `backend/database/migrations/004_create_scores.sql`

**Test Status:** ✅ Migration creata correttamente

### ✅ Verifica Acceptance Criteria

**AC #1: Migration Script**
- ✅ File `004_create_scores.sql` creato nella directory corretta
- ✅ Tutte le colonne richieste presenti: id, match_id, player_id, score, score_change, created_at
- ✅ FOREIGN KEY constraints su match_id e player_id con CASCADE delete
- ✅ Indexes creati: idx_scores_player_id, idx_scores_match_id, idx_scores_player_score
- ✅ Naming convention snake_case rispettata
- ✅ File versionato correttamente (004_create_scores.sql)

**Valutazione:**
- ✅ **Struttura Tabella:** Corretta, tutte le colonne richieste presenti
- ✅ **Foreign Keys:** Configurate correttamente con CASCADE delete
- ✅ **Indexes:** Ottimizzati per query leaderboard (player_id, match_id, player_id+score)
- ✅ **Naming:** snake_case rispettato per tutti gli identificatori
- ✅ **Comments:** Aggiunti per score e score_change per chiarezza

### 📊 Risultati Finali

**Problemi Risolti:**
- ✅ Tutti i requisiti dell'acceptance criteria soddisfatti

**Metriche:**
- **Linee di codice:** ~25 linee (migration SQL)
- **Colonne:** 6 colonne (id, match_id, player_id, score, score_change, created_at)
- **Indexes:** 3 indexes per ottimizzazione query
- **Foreign Keys:** 2 foreign keys per integrità referenziale

## Dev Agent Record

### Agent Model Used

Auto (Cursor AI Assistant)

### Debug Log References

Nessun log necessario per questa story (solo creazione migration file).

### Completion Notes List

✅ **Task 1 Complete:** Created migration file with:
- Table structure with all required columns
- Foreign key constraints on match_id and player_id
- Indexes for efficient queries (player_id, match_id, player_id+score)
- snake_case naming convention
- Comments for clarity

**Implementation Approach:**
- Created migration file following the pattern from previous migrations (001, 002, 003)
- Used CASCADE delete for foreign keys to maintain referential integrity
- Added composite index (player_id, score) for efficient leaderboard queries
- Followed MariaDB syntax and conventions

### File List

**Created Files:**
- `backend/database/migrations/004_create_scores.sql` - Migration file for scores table

**Modified Files:**
- None

**Test Results:**
- ✅ Migration file created successfully
- ✅ All acceptance criteria met
- ✅ Ready for manual testing against database
