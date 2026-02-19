let state = {
  invitations: [],
  isFetchingInvitations: false,
  isCreatingInvitation: false,
  isAcceptingInvitation: false
};

const listeners = new Set();

function notify() {
  listeners.forEach(cb => cb(getState()));
}

export function subscribe(cb) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function getState() {
  return { ...state };
}

export function setState(partial) {
  state = { ...state, ...partial };
  notify();
}
