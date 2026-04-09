// js/auth.js  —  talks to Spring Boot at http://localhost:8080
const API = 'http://localhost:8080';

if (localStorage.getItem('jwt_token')) location.href = 'dashboard.html';

/* ── Tab switch ── */
function showTab(t) {
  const isLogin = t === 'login';
  document.getElementById('f-login').style.display  = isLogin ? 'flex' : 'none';
  document.getElementById('f-signup').style.display = isLogin ? 'none' : 'flex';
  document.getElementById('tab-login').classList.toggle('active',  isLogin);
  document.getElementById('tab-signup').classList.toggle('active', !isLogin);
  hide('alert');
}

/* ── Eye toggle ── */
function togglePw(id, btn) {
  const inp = document.getElementById(id);
  const show = inp.type === 'password';
  inp.type = show ? 'text' : 'password';
  btn.innerHTML = show
    ? `<svg viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`
    : `<svg viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`;
}

/* ── Alert ── */
function showAlert(msg, type = 'err') {
  const el = document.getElementById('alert');
  el.textContent = msg; el.className = 'alert ' + type; el.style.display = 'block';
}
function hide(id) { document.getElementById(id).style.display = 'none'; }

/* ── Spinner ── */
function busy(id, on) {
  const b = document.getElementById(id);
  b.disabled = on;
  b.querySelector('.bl').style.display = on ? 'none' : 'inline';
  b.querySelector('.bs').style.display = on ? 'inline' : 'none';
}

/* ── POST helper ── */
async function post(path, body) {
  const res  = await fetch(API + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  if (!res.ok) {
    let msg = text;
    try { msg = JSON.parse(text).message || text; } catch (_) {}
    throw new Error(msg || `HTTP ${res.status}`);
  }
  return text;
}

/* ════ LOGIN  →  POST /auth/login ════ */
async function doLogin(e) {
  e.preventDefault(); hide('alert');
  const username = document.getElementById('l-user').value.trim();
  const password = document.getElementById('l-pass').value;
  if (!username || !password) { showAlert('Please fill in all fields.'); return; }
  busy('btn-login', true);
  try {
    const jwt = await post('/auth/login', { username, password });
    localStorage.setItem('jwt_token', jwt.trim());
    localStorage.setItem('username',  username);
    location.href = 'dashboard.html';
  } catch (err) {
    showAlert(err.message.includes('fetch')
      ? ' Backend unreachable — start Spring Boot on port 8080, and add CorsConfig.java.'
      : err.message);
  } finally { busy('btn-login', false); }
}

/* ════ SIGNUP  →  POST /auth/signup ════ */
async function doSignup(e) {
  e.preventDefault(); hide('alert');
  const username = document.getElementById('s-user').value.trim();
  const password = document.getElementById('s-pass').value;
  if (!username || !password) { showAlert('Email/Username and Password are required.'); return; }
  busy('btn-signup', true);
  try {
    await post('/auth/signup', { username, password });
    showAlert('Account created! Redirecting to login…', 'ok');
    setTimeout(() => {
      document.getElementById('s-user').value = '';
      document.getElementById('s-pass').value = '';
      showTab('login');
    }, 1300);
  } catch (err) {
    showAlert(err.message.includes('fetch')
      ? '⚠️ Backend unreachable — start Spring Boot on port 8080, and add CorsConfig.java.'
      : err.message);
  } finally { busy('btn-signup', false); }
}