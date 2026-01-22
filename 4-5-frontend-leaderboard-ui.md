# Story 4.5: Frontend Leaderboard UI

## Overview
Implementazione dell'interfaccia utente per visualizzare la classifica globale nella dashboard.

## Acceptance Criteria
✅ **Given** I am logged in and on the dashboard  
✅ **When** I navigate to the leaderboard section  
✅ **Then** I see a table/list showing:
- Rank number
- Username
- Total score
- My row is highlighted if I'm in the leaderboard
✅ **And** The leaderboard is fetched from `/api/leaderboard` on page load  
✅ **And** The leaderboard shows top players (e.g., top 100 or all if < 100)  
✅ **And** Loading state (isLoading) is shown while fetching  
✅ **And** Error handling displays message if fetch fails  
✅ **And** The UI uses ES6 modules and DOM manipulation  
✅ **And** The leaderboard updates after I complete a match (refresh or auto-update)

## Implementation

### Task 1: Create API function for Leaderboard ✅
**File:** `frontend/js/api/match-api.js`

Aggiunta funzione `getLeaderboard()` che:
- Chiama `GET /api/leaderboard`
- Gestisce autenticazione JWT
- Gestisce errori e retry
- Restituisce array di leaderboard entries

### Task 2: Create Leaderboard UI Component ✅
**File:** `frontend/js/ui/leaderboard-ui.js`

Creato componente UI con funzioni:
- `renderLeaderboard(container, leaderboard, currentUserId)` - Renderizza tabella leaderboard
- `showLeaderboardLoading(container)` - Mostra stato di caricamento
- `showLeaderboardError(container, message)` - Mostra messaggio di errore

**Features:**
- Tabella HTML con thead e tbody
- Evidenziazione riga utente corrente con classe CSS `leaderboard-row-current-user`
- Gestione stato vuoto (nessun giocatore)
- Formattazione rank, username, total score

### Task 3: Integrate Leaderboard in Dashboard ✅
**Files:** `frontend/dashboard.html`, `frontend/js/dashboard.js`, `frontend/css/dashboard.css`

**HTML (`dashboard.html`):**
- Aggiunta sezione `<section class="leaderboard-section">`
- Container `<div id="leaderboard-container">` per il rendering

**JavaScript (`dashboard.js`):**
- Import funzioni API e UI
- Aggiunta variabile `leaderboardContainer`
- Funzione `loadLeaderboard()` per caricare dati
- Chiamata `loadLeaderboard()` all'inizializzazione
- Aggiornamento polling per ricaricare leaderboard ogni 10 secondi

**CSS (`dashboard.css`):**
- Stili per `.leaderboard-section`
- Stili per `.leaderboard-table` (thead, tbody, tr, td)
- Stili per `.leaderboard-row-current-user` (evidenziazione utente corrente)
- Stili responsive per mobile

## Files Modified

### Frontend
- `frontend/js/api/match-api.js`
  - Aggiunta funzione `getLeaderboard()`
  
- `frontend/js/ui/leaderboard-ui.js`
  - Nuovo file con componenti UI per leaderboard
  
- `frontend/dashboard.html`
  - Aggiunta sezione leaderboard
  
- `frontend/js/dashboard.js`
  - Integrazione caricamento leaderboard
  - Aggiornamento polling
  
- `frontend/css/dashboard.css`
  - Stili per leaderboard section e table

## UI Features

### Leaderboard Table
- Header con colonne: Rank, Username, Score
- Righe evidenziate per utente corrente (sfondo blu chiaro)
- Hover effect sulle righe
- Responsive design per mobile

### Loading State
- Indicatore "Loading leaderboard..." durante il fetch

### Error Handling
- Messaggio di errore se il fetch fallisce
- Gestione errori di autenticazione (redirect a login)

### Empty State
- Messaggio "No players found in leaderboard" se nessun giocatore

## Testing

### Manual Testing
1. Login come utente
2. Navigare alla dashboard
3. Verificare che la sezione leaderboard sia visibile
4. Verificare che i dati vengano caricati correttamente
5. Verificare che la propria riga sia evidenziata
6. Giocare una partita e verificare che il leaderboard si aggiorni

### Browser Compatibility
- Testato su Chrome, Firefox, Safari
- Responsive design per mobile

## Status
✅ **COMPLETED** - Story 4.5 implementata e integrata nella dashboard
