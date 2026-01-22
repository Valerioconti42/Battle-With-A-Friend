# Story 1.1: Setup Project Structure

Status: approved

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a developer,
I want a well-organized project structure with backend, frontend, and database directories,
So that I can start implementing features with clear separation of concerns.

## Acceptance Criteria

1. **Given** I am starting a new project
   **When** I create the project structure following Architecture decisions
   **Then** The following directories exist:
   - `backend/src/routes/` for REST API route handlers
   - `backend/src/websocket/` for WebSocket handlers
   - `backend/src/game/` for game logic and physics
   - `backend/src/models/` for database models (SQL queries)
   - `backend/src/middleware/` for Express middleware
   - `backend/src/utils/` for shared utilities
   - `backend/tests/` for all tests (separate from src)
   - `backend/database/migrations/` for SQL migration files
   - `frontend/index.html` as entry point
   - `frontend/css/` for stylesheets
   - `frontend/js/api/` for REST API client
   - `frontend/js/websocket/` for WebSocket client
   - `frontend/js/game/` for game state and rendering
   - `frontend/js/state/` for state management
   - `frontend/js/ui/` for UI components
   - `frontend/js/utils/` for shared utilities
   - `frontend/assets/` for static assets
   **And** Each directory follows kebab-case naming for files
   **And** The structure matches the Architecture document specifications

2. **Given** The project structure is created
   **When** I initialize the backend package.json
   **Then** The `backend/package.json` exists with:
   - Basic Node.js project metadata (name, version, type: "module")
   - Scripts section (empty for now, will be added in future stories)
   - No dependencies yet (will be added in future stories)

3. **Given** The project structure is created
   **When** I create the environment configuration template
   **Then** The `backend/.env.example` file exists with:
   - Template variables for database connection (DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME)
   - Template variables for JWT secret (JWT_SECRET)
   - Template variables for server port (PORT)
   - Comments explaining each variable
   **And** The `backend/.env` file is gitignored (via .gitignore)

## Tasks / Subtasks

- [x] Task 1: Create Backend Directory Structure (AC: #1)
  - [x] Create `backend/` root directory
  - [x] Create `backend/src/` directory
  - [x] Create `backend/src/routes/` directory
  - [x] Create `backend/src/websocket/` directory
  - [x] Create `backend/src/game/` directory
  - [x] Create `backend/src/models/` directory
  - [x] Create `backend/src/middleware/` directory
  - [x] Create `backend/src/utils/` directory
  - [x] Create `backend/tests/` directory (separate from src)
  - [x] Create `backend/database/` directory
  - [x] Create `backend/database/migrations/` directory

- [x] Task 2: Create Frontend Directory Structure (AC: #1)
  - [x] Create `frontend/` root directory
  - [x] Create `frontend/index.html` file (empty for now)
  - [x] Create `frontend/css/` directory
  - [x] Create `frontend/js/` directory
  - [x] Create `frontend/js/api/` directory
  - [x] Create `frontend/js/websocket/` directory
  - [x] Create `frontend/js/game/` directory
  - [x] Create `frontend/js/state/` directory
  - [x] Create `frontend/js/ui/` directory
  - [x] Create `frontend/js/utils/` directory
  - [x] Create `frontend/assets/` directory

- [x] Task 3: Initialize Backend Package Configuration (AC: #2)
  - [x] Create `backend/package.json` with:
    - name: "battle-with-friend-backend"
    - version: "1.0.0"
    - type: "module" (for ES6 modules support)
    - description: "Backend server for Battle With Friend game"
    - main: "src/server.js"
    - scripts: {} (empty for now)
    - keywords: ["game", "websocket", "real-time"]
    - author: (from config or leave empty)
    - license: "ISC" (or appropriate license)

- [x] Task 4: Create Environment Configuration Template (AC: #3)
  - [x] Create `backend/.env.example` file with template variables:
    - `DB_HOST=localhost`
    - `DB_PORT=3306`
    - `DB_USER=your_db_user`
    - `DB_PASSWORD=your_db_password`
    - `DB_NAME=battle_with_friend`
    - `JWT_SECRET=your_jwt_secret_key_here`
    - `PORT=3000`
  - [x] Add comments explaining each variable
  - [x] Create or update `backend/.gitignore` to include `.env`

- [x] Task 5: Verify Structure Compliance (AC: #1)
  - [x] Verify all directories match Architecture document specifications
  - [x] Verify kebab-case naming convention is documented (for future file creation)
  - [x] Verify structure follows the exact pattern from Architecture document

## Dev Notes

### Relevant Architecture Patterns and Constraints

**Project Structure (from Architecture Document):**
- **Backend:** Separated into `src/` (source code) and `tests/` (test files separate)
- **Frontend:** Vanilla JavaScript with ES6 modules, no build step required
- **Database:** Migrations in `database/migrations/` directory
- **Naming:** kebab-case for file names, camelCase for code, PascalCase for classes

**Key Architectural Decisions:**
- **Setup Manuale Custom:** No boilerplate generators, full control over structure
- **ES6 Modules:** Backend uses `type: "module"` in package.json
- **No Build Step:** Frontend uses native ES6 modules (no bundler for MVP)
- **Test Organization:** Tests in separate `tests/` directory (not co-located)

**Source Tree Components to Touch:**
- Root project directory (create `backend/` and `frontend/` subdirectories)
- `backend/package.json` (initialize with ES6 modules support)
- `backend/.env.example` (template for environment variables)
- `backend/.gitignore` (ensure .env is ignored)

### Project Structure Notes

**Alignment with Unified Project Structure:**
- ✅ Matches Architecture document structure exactly
- ✅ Backend: `src/` for source, `tests/` separate, `database/migrations/` for SQL
- ✅ Frontend: `js/` organized by feature (api, websocket, game, state, ui, utils)
- ✅ Naming: kebab-case for files (will be enforced in future stories)

**Detected Conflicts or Variances:**
- None - this is the foundation story establishing the structure

### Testing Standards Summary

**For This Story:**
- No code to test yet (structure setup only)
- Manual verification: Check that all directories exist
- Future stories will add Jest for backend testing

**Testing Approach:**
- Manual verification of directory structure
- Verify package.json syntax (can use `npm install --dry-run` to validate)
- Verify .gitignore includes .env

### References

- **Architecture Document:** `_bmad-output/planning-artifacts/architecture.md`
  - Section: "Starter Template Evaluation" → "Struttura Progetto Consigliata"
  - Section: "Structure Patterns" → "Project Organization"
  - Section: "Naming Patterns" → "Code Naming Conventions" (kebab-case files)
- **PRD:** `_bmad-output/planning-artifacts/prd.md`
  - Section: "Vincoli Tecnici" → Project structure requirements
- **Epics:** `_bmad-output/planning-artifacts/epics.md`
  - Story 1.1 Acceptance Criteria (lines 130-160)

### Implementation Guidelines

**Critical Requirements:**
1. **Directory Creation:** Create all directories as empty (no placeholder files needed)
2. **package.json:** Must include `"type": "module"` for ES6 modules support
3. **.env.example:** Template only, no actual secrets
4. **.gitignore:** Must include `.env` to prevent committing secrets

**What NOT to Do:**
- ❌ Don't create placeholder files in directories (they'll be created in future stories)
- ❌ Don't add dependencies to package.json yet (will be added in Story 1.2+)
- ❌ Don't create actual .env file (only .env.example template)
- ❌ Don't create any source code files yet (structure only)

**File Naming Reminder:**
- All future files must use kebab-case (e.g., `user-model.js`, `game-state.js`)
- This story doesn't create files yet, but structure supports this convention

## Code Review

### Review Date
2026-01-15

### Reviewer
Auto (Cursor AI Agent)

### Overall Assessment
✅ **APPROVED** - Story implementation meets all acceptance criteria and follows architecture patterns correctly.

### Acceptance Criteria Verification

**AC #1: Project Structure**
- ✅ All backend directories exist: `src/routes/`, `src/websocket/`, `src/game/`, `src/models/`, `src/middleware/`, `src/utils/`, `tests/`, `database/migrations/`
- ✅ All frontend directories exist: `index.html`, `css/`, `js/api/`, `js/websocket/`, `js/game/`, `js/state/`, `js/ui/`, `js/utils/`, `assets/`
- ✅ Directory structure matches Architecture document specifications exactly
- ✅ kebab-case naming convention documented for future file creation

**AC #2: Backend Package Configuration**
- ✅ `backend/package.json` exists with:
  - `name`: "battle-with-friend-backend"
  - `version`: "1.0.0"
  - `type`: "module" (ES6 modules support)
  - `description`: "Backend server for Battle With Friend game"
  - `main`: "src/server.js"
  - Scripts section (populated in later stories)
  - Keywords: ["game", "websocket", "real-time"]
  - License: "ISC"

**AC #3: Environment Configuration**
- ✅ `backend/.env.example` exists with all required template variables:
  - DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME
  - JWT_SECRET
  - PORT
- ✅ Comments explaining each variable
- ✅ `backend/.gitignore` includes `.env` to prevent committing secrets

### Code Quality Assessment

**Strengths:**
1. ✅ **Structure Organization:**
   - Clear separation: backend, frontend, database
   - Backend: `src/` for source, `tests/` separate
   - Frontend: Feature-based organization in `js/` subdirectories
   - Database: Migrations in dedicated directory

2. ✅ **Configuration:**
   - `package.json` properly configured for ES6 modules
   - `.env.example` provides clear template
   - `.gitignore` properly excludes sensitive files

3. ✅ **Architecture Compliance:**
   - Structure matches Architecture document exactly
   - Naming conventions documented
   - No deviations from specifications

**Issues Found:**
None - Story is foundational and correctly establishes project structure.

### Architecture Conformance

**Project Structure:**
- ✅ Backend: `src/` (source), `tests/` (separate), `database/migrations/`
- ✅ Frontend: `index.html`, `css/`, `js/` (feature-organized), `assets/`
- ✅ Naming: kebab-case documented for files

**Configuration:**
- ✅ ES6 modules: `type: "module"` in package.json
- ✅ Environment: `.env.example` template with all required variables
- ✅ Security: `.env` gitignored

### Test Coverage

**For This Story:**
- Manual verification: All directories exist ✅
- package.json syntax validated ✅
- .gitignore verified ✅

**Note:** This is a foundational story with no code to test. Structure verification is sufficient.

### Manual Testing Results

**Verified:**
1. ✅ All backend directories exist
2. ✅ All frontend directories exist
3. ✅ `package.json` syntax valid
4. ✅ `.env.example` contains all required variables
5. ✅ `.gitignore` excludes `.env`

### Recommendations

**No blocking issues found.** Story is ready for approval.

**Note:** This story establishes the foundation. All subsequent stories build upon this structure.

### Final Verdict

✅ **APPROVED** - Story implementation is complete and follows all architecture patterns. All acceptance criteria met. Project structure correctly established. Ready for merge.

## Dev Agent Record

### Agent Model Used

Auto (Cursor AI Agent)

### Debug Log References

No errors encountered during implementation. All directory creation and file operations completed successfully.

### Completion Notes List

✅ **Task 1 Complete:** Created all backend directory structure following Architecture document specifications:
- All required directories created: `backend/src/` with subdirectories (routes, websocket, game, models, middleware, utils)
- Tests directory created separately: `backend/tests/`
- Database migrations directory: `backend/database/migrations/`

✅ **Task 2 Complete:** Created all frontend directory structure:
- Root `frontend/` directory with `index.html` entry point
- All required subdirectories: `css/`, `js/` with feature-based organization (api, websocket, game, state, ui, utils)
- Assets directory: `frontend/assets/`

✅ **Task 3 Complete:** Initialized `backend/package.json` with:
- ES6 modules support (`"type": "module"`)
- Basic project metadata (name, version, description, keywords)
- Empty scripts section (to be populated in future stories)
- No dependencies (as specified)

✅ **Task 4 Complete:** Created environment configuration:
- `backend/.env.example` with all required template variables (DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME, JWT_SECRET, PORT)
- Comments added explaining each variable
- `backend/.gitignore` created with `.env` entry to prevent committing secrets

✅ **Task 5 Complete:** Verified structure compliance:
- All directories match Architecture document specifications exactly
- Structure follows the pattern: backend (src/, tests/, database/), frontend (index.html, css/, js/, assets/)
- kebab-case naming convention documented in Dev Notes (for future file creation)

**Implementation Approach:**
- Used `mkdir -p` to create directory structure recursively
- Created minimal `index.html` with basic HTML5 structure
- Validated `package.json` syntax using `npm install --dry-run`
- Verified `.gitignore` includes `.env` pattern

**Acceptance Criteria Verification:**
- ✅ AC #1: All directories exist and match Architecture specifications
- ✅ AC #2: `package.json` created with ES6 modules support and correct metadata
- ✅ AC #3: `.env.example` template created with all required variables and comments; `.env` gitignored

### File List

**Created Directories:**
- `backend/`
- `backend/src/`
- `backend/src/routes/`
- `backend/src/websocket/`
- `backend/src/game/`
- `backend/src/models/`
- `backend/src/middleware/`
- `backend/src/utils/`
- `backend/tests/`
- `backend/database/`
- `backend/database/migrations/`
- `frontend/`
- `frontend/css/`
- `frontend/js/`
- `frontend/js/api/`
- `frontend/js/websocket/`
- `frontend/js/game/`
- `frontend/js/state/`
- `frontend/js/ui/`
- `frontend/js/utils/`
- `frontend/assets/`

**Created Files:**
- `frontend/index.html`
- `backend/package.json`
- `backend/.env.example`
- `backend/.gitignore`
