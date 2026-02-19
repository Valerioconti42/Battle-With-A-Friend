export function renderInvitationsList(container, invitations) {
  container.innerHTML = '';

  if (!invitations.length) {
    container.textContent = 'No active invitations';
    return;
  }

  invitations.forEach(invite => {
    container.appendChild(renderInvitationItem(invite));
  });
}

export function renderInvitationItem(invite) {
  const item = document.createElement('div');
  item.className = 'invitation-item';

  const user = document.createElement('div');
  user.textContent = `From: ${invite.inviterUsername}`;

  const time = document.createElement('div');
  time.textContent = formatRemainingTime(invite.expiresAt);

  const btn = document.createElement('button');
  btn.textContent = 'Accept';
  btn.dataset.inviteId = invite.id;
  btn.className = 'accept-invite-btn';

  item.append(user, time, btn);
  return item;
}

export function renderInviteForm(formEl, isVisible) {
  formEl.style.display = isVisible ? 'block' : 'none';
}

export function showInvitationError(container, message) {
  container.textContent = message;
  container.className = 'error';
}

export function showInvitationSuccess(container, message) {
  container.textContent = message;
  container.className = 'success';
}

function formatRemainingTime(expiresAt) {
  const diff = new Date(expiresAt) - new Date();
  if (diff <= 0) return 'Expired';

  const mins = Math.floor(diff / 60000);
  const secs = Math.floor((diff % 60000) / 1000);
  return `${mins} min ${secs} sec`;
}
