# Battle With Friend - Specifiche MVP

**Data:** 2026-01-12  
**Tipo:** Web App Gioco Competitivo Real-Time  
**Modalità:** Sfide a coppia (1v1)

---

## 🎯 Visione

Web app dove giocatori registrati si sfidano a coppia in un gioco di riflessi basato su rotazione arma e fisica real-time.

---

## 🛠️ Stack Tecnologico

### Backend
- **Runtime:** Node.js + Express
- **API:** HTTP REST per setup/matchmaking
- **Real-time:** WebSocket (connessione solo durante partita)
- **Database:** MariaDB (SQL)
- **Auth:** JWT (scadenza 24h)

### Frontend
- **Tecnologie:** Vanilla JavaScript (HTML, CSS, JS puro)
- **Approccio:** Nessun framework, state management semplice

---

## 🎮 Gameplay

### Meccanica di Controllo
- **Tasto ←** : Rotazione arma sinistra di 45°
- **Tasto →** : Rotazione arma destra di 45°
- Ogni giocatore controlla solo la propria arma

### Fisica
- Figura circolare (palla) con arma si muove con **gravità**
- **Rimbalzo** su:
  - Bordi dell'area di gioco
  - Quando due figure si toccano
  - Quando arma colpisce arma avversaria (come bordo)

### Obiettivo
- **Vittoria:** Colpire la figura (palla) dell'avversario con la propria arma
- **NO Vittoria:** Colpire l'arma dell'avversario (solo rimbalzo)

### Implementazione Fisica
- Fisica **calcolata lato server** e inviata ai client
- **Hitbox:** Cerchi per figure, rettangoli per armi
- **Collisioni:** Rilevate e validate solo lato server

---

## 🖥️ Area di Gioco

- **Dimensioni:** 600x800 pixel (verticale/portrait)
- **Sfondo:** Nero
- **Figure:** Cerchi colorati (rosso vs blu)
- **Armi:** Bianco (entrambe)
- **Animazioni:** Nessuna

---

## 📋 Funzionalità MVP

### Core
1. ✅ Registrazione/Login (solo username, JWT)
2. ✅ Sistema inviti (timeout 3 minuti, entrambi online)
3. ✅ Partita real-time 1v1
4. ✅ Sistema punteggi (+10 vittoria, -5 sconfitta)
5. ✅ Classifica globale

### Gestione Partite
- Inviti attivi consultabili via API
- Accettazione sfida via API
- Possibilità di interrompere partita volontariamente
- **Disconnessione esplicita** → Vittoria avversario
- **Disconnessione tecnica** → Partita annullata

---

## 🗄️ Database Schema

### Tabella `users`
- `id` (PK)
- `username` (UNIQUE)
- `password_hash`
- `created_at`

### Tabella `matches`
- `id` (PK)
- `player1_id` (FK → users.id)
- `player2_id` (FK → users.id)
- `status` (waiting, active, finished)
- `winner_id` (FK → users.id, nullable)
- `created_at`

### Tabella `scores`
- `id` (PK)
- `match_id` (FK → matches.id)
- `player_id` (FK → users.id)
- `score` (INT)
- `created_at`

---

## 🔌 API REST Endpoints

### Autenticazione
- `POST /api/auth/register` - Registrazione
- `POST /api/auth/login` - Login
- `GET /api/user/profile` - Profilo utente

### Matchmaking
- `POST /api/matches/invite` - Invita amico
- `GET /api/matches/invites/active` - Consulta inviti attivi
- `POST /api/matches/invites/:id/accept` - Accetta sfida
- `POST /api/matches/:id/forfeit` - Interrompi partita volontariamente

### Storico e Classifica
- `GET /api/matches/history` - Storico partite
- `GET /api/leaderboard` - Classifica globale

---

## 🔄 WebSocket Events

### Eventi Client → Server
- `game_action` - Rotazione arma (← o →)

### Eventi Server → Client
- `match_start` - Partita inizia
- `game_state` - Stato completo gioco (per sync fisica)
- `match_end` - Partita finita (vincitore, punteggi)
- `player_disconnected` - Giocatore disconnesso

### Gestione Connessione
- WebSocket si connette **solo quando si entra in partita**
- Non connesso permanentemente dopo login
- Connessione chiusa al termine partita

---

## 🎨 UI/UX MVP

### Schermate

1. **Login/Registrazione**
   - Form semplice (solo username + password)
   - Nessuna email richiesta

2. **Dashboard**
   - Lista inviti attivi
   - Partite recenti
   - Link a classifica globale
   - Pulsante "Invita Amico"

3. **Schermata Gioco**
   - Countdown: 3, 2, 1 (senza "GO")
   - Area di gioco 600x800px
   - Due armi visibili simultaneamente
   - Figure rosso vs blu
   - Feedback visivo per collisioni armi
   - Feedback visivo vittoria/sconfitta

4. **Risultato Finale**
   - Vittoria/Sconfitta
   - Punteggi finali
   - Pulsante "Torna alla Dashboard"

---

## 🔒 Sicurezza MVP

- Validazione server-side di tutte le mosse
- Rate limiting naturale (max 1 evento ogni 20ms)
- JWT per autenticazione (24h)
- Errori "silenziati" per MVP (focus su funzionalità core)

---

## 💾 Persistenza

- Solo risultato finale salvato:
  - Vincitore (user_id)
  - Punteggio vincitore
  - Perdente (user_id)
  - Punteggio perdente
- Nessun replay salvato
- Storico ultime partite disponibile

---

## 📊 Sistema Punteggi

- **Vittoria:** +10 punti
- **Sconfitta:** -5 punti
- **Classifica:** Globale (non solo tra amici)
- Aggiornamento automatico dopo ogni partita

---

## 🚀 Prossimi Passi

1. Creare PRD dettagliato
2. Disegnare architettura tecnica completa
3. Definire schema database dettagliato
4. Creare wireframes UI/UX
5. Pianificare sviluppo in epiche e user stories
6. Setup ambiente sviluppo (Node.js, MariaDB, etc.)

---

**Documento generato da:** Sessione Brainstorming BMAD  
**Data:** 2026-01-12  
**Status:** ✅ MVP Completamente Definito
