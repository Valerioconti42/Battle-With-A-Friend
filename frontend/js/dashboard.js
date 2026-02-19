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
