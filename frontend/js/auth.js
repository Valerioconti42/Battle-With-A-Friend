const form = document.getElementById('login-form') || document.getElementById('register-form');
const errorEl = document.getElementById('error-message');
const isLogin = !!document.getElementById('login-form');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  errorEl.textContent = '';

  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;
  const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (!res.ok) {
      errorEl.textContent = data?.error?.message || 'Error';
      return;
    }

    if (isLogin) {
      localStorage.setItem('token', data.token);
      window.location.href = 'dashboard.html';
    } else {
      window.location.href = 'login.html';
    }
  } catch {
    errorEl.textContent = 'Network error, try again.';
  }
});
