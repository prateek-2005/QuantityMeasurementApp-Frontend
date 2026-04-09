import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../services/api';
import styles from './Auth.module.css';

export default function Login() {
  const nav = useNavigate();
  const [form, setForm]   = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy]   = useState(false);

  const change = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async e => {
    e.preventDefault();
    setError(''); setBusy(true);
    try {
      const res = await login(form);
      // Backend returns plain string token, not a JSON object
      const token = typeof res.data === 'string' ? res.data : res.data.token;
      localStorage.setItem('jwt_token', token);
      localStorage.setItem('username',  form.username);
      nav('/dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally { setBusy(false); }
  };

  return (
    <div className={styles.page}>
      <div className={styles.brand}>
        <div className={styles.logo}>
          <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
            <path d="M7 16h18M7 10h10M7 22h14" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
            <circle cx="25" cy="10" r="3" fill="white"/>
          </svg>
        </div>
        <h1>QuantiMeter</h1>
        <p>Convert · Compare · Calculate</p>
        <div className={styles.chips}>
          <span>📏 Length</span><span>⚖️ Weight</span>
          <span>🌡️ Temp</span><span>💧 Volume</span>
        </div>
      </div>

      <div className={styles.formWrap}>
        <div className={styles.card}>
          <h2>Welcome back</h2>
          <p>Sign in to your account</p>

          {error && <div className={styles.alert}>{error}</div>}

          <form onSubmit={submit}>
            <div className={styles.field}>
              <label>Username</label>
              <input name="username" value={form.username} onChange={change} placeholder="Enter username" required />
            </div>
            <div className={styles.field}>
              <label>Password</label>
              <input name="password" type="password" value={form.password} onChange={change} placeholder="Enter password" required />
            </div>
            <button type="submit" className={styles.btn} disabled={busy}>
              {busy ? <span className={styles.spin} /> : 'Login'}
            </button>
          </form>

          <p className={styles.switch}>
            No account? <Link to="/signup">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
