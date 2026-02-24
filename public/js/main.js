/* async function postJSON(url, data) {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data || {}),
      credentials: 'same-origin'
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Request failed');
    return res.json();
  }
  
  async function getJSON(url) {
    const res = await fetch(url, { credentials: 'same-origin' });
    if (!res.ok) throw new Error('Request failed');
    return res.json();
  }
  
  // Login page script
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;
      try {
        const out = await postJSON('/api/login', { email, password });
        if (out.role === 'admin') location.href = '/admin.html';
        else if (out.role === 'police') location.href = '/police.html';
        else location.href = '/user.html';
      } catch (err) {
        alert(err.message || 'Login failed');
      }
    });
  }
  
  window._helpers = { postJSON, getJSON };
  */