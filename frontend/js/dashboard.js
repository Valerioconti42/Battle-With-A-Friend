import {
  getActiveInvitations,
  createInvitation,
  acceptInvitation
} from './api/match-api.js';

import { setState, getState, subscribe } from './state/invitation-state.js';
import {
  renderInvitationsList,
  renderInviteForm,
  showInvitationError,
  showInvitationSuccess
} from './ui/invitation-ui.js';

import { getToken } from './utils/token-storage.js';

const POLLING_INTERVAL = 10000;

const listEl = document.getElementById('invitations-list');
const inviteBtn = document.getElementById('invite-btn');
const inviteForm = document.getElementById('invite-form');
const usernameInput = document.getElementById('invite-username');
const messageEl = document.getElementById('message');

let pollId;

if (!getToken()) {
  window.location.href = 'login.html';
}

subscribe(state => {
  renderInvitationsList(listEl, state.invitations);
});

async function loadInvitations() {
  setState({ isFetchingInvitations: true });
  try {
    const invitations = await getActiveInvitations();
    setState({ invitations });
  } catch (err) {
    showInvitationError(messageEl, err.message);
  } finally {
    setState({ isFetchingInvitations: false });
  }
}

inviteBtn.addEventListener('click', () => {
  renderInviteForm(inviteForm, true);
});

inviteForm.addEventListener('submit', async e => {
  e.preventDefault();
  setState({ isCreatingInvitation: true });

  try {
    await createInvitation(usernameInput.value.trim());
    showInvitationSuccess(messageEl, 'Invitation sent');
    inviteForm.reset();
    renderInviteForm(inviteForm, false);
    loadInvitations();
  } catch (err) {
    showInvitationError(messageEl, err.message);
  } finally {
    setState({ isCreatingInvitation: false });
  }
});

listEl.addEventListener('click', async e => {
  if (!e.target.classList.contains('accept-invite-btn')) return;

  const id = e.target.dataset.inviteId;
  setState({ isAcceptingInvitation: true });

  try {
    const match = await acceptInvitation(id);
    window.location.href = `/match.html?id=${match.id}`;
  } catch (err) {
    showInvitationError(messageEl, err.message);
  } finally {
    setState({ isAcceptingInvitation: false });
  }
});

loadInvitations();
pollId = setInterval(loadInvitations, POLLING_INTERVAL);

window.addEventListener('beforeunload', () => {
  clearInterval(pollId);
});
// frontend/js/dashboard.js

import { getLeaderboard } from './api/match-api.js';
import {
    renderLeaderboard,
    showLeaderboardLoading,
    showLeaderboardError
} from './ui/leaderboard-ui.js';

const leaderboardContainer = document.getElementById('leaderboard-container');

let leaderboardInterval;

function getCurrentUserId() {
    const user = JSON.parse(localStorage.getItem('user'));
    return user ? user.id : null;
}

async function loadLeaderboard() {
    try {
        showLeaderboardLoading(leaderboardContainer);

        const leaderboard = await getLeaderboard();
        const currentUserId = getCurrentUserId();

        renderLeaderboard(leaderboardContainer, leaderboard, currentUserId);
    } catch (error) {
        console.error('Failed to load leaderboard:', error);
        showLeaderboardError(leaderboardContainer, 'Failed to load leaderboard.');
    }
}

function startLeaderboardPolling() {
    leaderboardInterval = setInterval(loadLeaderboard, 10000);
}

document.addEventListener('DOMContentLoaded', () => {
    loadLeaderboard();
    startLeaderboardPolling();
});
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Dashboard</title>
    <link rel="stylesheet" href="css/dashboard.css" />
</head>
<body>

    <h1>Dashboard</h1>

    <section class="leaderboard-section">
        <h2>Global Leaderboard</h2>
        <div id="leaderboard-container"></div>
    </section>

    <script type="module" src="js/dashboard.js"></script>
</body>
</html>
body {
    font-family: Arial, sans-serif;
    margin: 20px;
}

.leaderboard-section {
    margin-top: 30px;
}

.leaderboard-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 15px;
}

.leaderboard-table th,
.leaderboard-table td {
    padding: 10px;
    text-align: left;
    border-bottom: 1px solid #ddd;
}

.leaderboard-table th {
    background-color: #f4f4f4;
}

.leaderboard-table tr:hover {
    background-color: #f9f9f9;
}

.leaderboard-row-current-user {
    background-color: #e6f0ff;
    font-weight: bold;
}

.leaderboard-loading,
.leaderboard-error,
.leaderboard-empty {
    padding: 15px;
    margin-top: 10px;
}

.leaderboard-error {
    color: red;
}

@media (max-width: 600px) {
    .leaderboard-table th,
    .leaderboard-table td {
        padding: 6px;
        font-size: 14px;
    }
}
