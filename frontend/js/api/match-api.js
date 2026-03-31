import { getToken } from '../utils/token-storage.js';

const API_BASE = '/api';

function authHeaders() {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getToken()}`
  };
}

async function handleResponse(res) {
  let data;
  try { data = await res.json(); } catch { throw new Error('Invalid server response'); }
  if (res.status === 401) {
    localStorage.removeItem('token');
    window.location.href = '/login.html';
    return;
  }
  if (!res.ok) throw new Error(data?.error?.message || 'Operation failed');
  return data;
}

export async function getActiveInvitations() {
  const res = await fetch(`${API_BASE}/matches/invites/active`, { headers: authHeaders() });
  return handleResponse(res);
}

export async function createInvitation(username) {
  const res = await fetch(`${API_BASE}/matches/invite`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ username })
  });
  return handleResponse(res);
}

export async function acceptInvitation(invitationId) {
  const res = await fetch(`${API_BASE}/matches/invites/${invitationId}/accept`, {
    method: 'POST',
    headers: authHeaders()
  });
  return handleResponse(res);
}

export async function getLeaderboard() {
  const res = await fetch(`${API_BASE}/leaderboard`, { headers: authHeaders() });
  return handleResponse(res);
}
