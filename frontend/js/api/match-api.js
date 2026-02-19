import { fetchWithTimeout } from '../utils/fetch-utils.js';
import { getToken } from '../utils/token-storage.js';

const API_BASE_URL = '/api/matches';

function authHeaders() {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  };
}

async function handleResponse(res) {
  let data;
  try {
    data = await res.json();
  } catch {
    throw new Error('Invalid server response');
  }

  if (!res.ok) {
    throw new Error(data?.error?.message || 'Operation failed');
  }

  return data;
}

export async function getActiveInvitations() {
  const res = await fetchWithTimeout(
    `${API_BASE_URL}/invites/active`,
    { headers: authHeaders() }
  );
  return handleResponse(res);
}

export async function createInvitation(username) {
  const res = await fetchWithTimeout(
    `${API_BASE_URL}/invite`,
    {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ username })
    }
  );
  return handleResponse(res);
}

export async function acceptInvitation(invitationId) {
  const res = await fetchWithTimeout(
    `${API_BASE_URL}/invites/${invitationId}/accept`,
    {
      method: 'POST',
      headers: authHeaders()
    }
  );
  return handleResponse(res);
}
