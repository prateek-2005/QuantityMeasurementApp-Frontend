import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signup } from '../services/api';
import styles from './Auth.module.css';

export default function Signup() {
  const nav = useNavigate();
  const [form, setForm]   = useState({ username: '', password: '', name: '', mobile: '' });
  const [error, setError] = useState('');
  const [busy, setBusy]   = useState(false);

  const change = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async e => {
    e.preventDefault();
    setError(''); setBusy(true);
    try {
      // Backend AuthRequest only needs username + password
      await signup({ username: form.username, password: form.password });
      nav('/login', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data || 'Signup failed');
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
          <h2>Create account</h2>
          <p>Start measuring smarter</p>

          {error && <div className={styles.alert}>{error}</div>}

          <form onSubmit={submit}>
            <div className={styles.field}>
              <label>Full Name</label>
              <input name="name" value={form.name} onChange={change} placeholder="Your name" />
            </div>
            <div className={styles.field}>
              <label>Username / Email</label>
              <input name="username" value={form.username} onChange={change} placeholder="Enter email or username" required />
            </div>
            <div className={styles.field}>
              <label>Password</label>
              <input name="password" type="password" value={form.password} onChange={change} placeholder="Create password" required />
            </div>
            <div className={styles.field}>
              <label>Mobile</label>
              <input name="mobile" type="tel" value={form.mobile} onChange={change} placeholder="Mobile number" />
            </div>
            <button type="submit" className={styles.btn} disabled={busy}>
              {busy ? <span className={styles.spin} /> : 'Sign Up'}
            </button>
          </form>

          <p className={styles.switch}>
            Have an account? <Link to="/login">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
