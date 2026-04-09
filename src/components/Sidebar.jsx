import React from 'react';
import styles from './Sidebar.module.css';

const OPS = [
  { key: 'convert',  icon: '⇄', label: 'Convert',  bg: '#eef2ff', fg: '#6366f1' },
  { key: 'compare',  icon: '⚖', label: 'Compare',  bg: '#ecfdf5', fg: '#10b981' },
  { key: 'add',      icon: '+', label: 'Add',       bg: '#eff6ff', fg: '#3b82f6' },
  { key: 'subtract', icon: '−', label: 'Subtract',  bg: '#fff7ed', fg: '#f97316' },
  { key: 'divide',   icon: '÷', label: 'Divide',    bg: '#faf5ff', fg: '#a855f7' },
];

export default function Sidebar({ curOp, onOp, onHistory, onErrors, username, onLogout }) {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <div className={styles.brandIcon}>
          <svg width="20" height="20" viewBox="0 0 32 32" fill="none">
            <path d="M7 16h18M7 10h10M7 22h14" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
            <circle cx="25" cy="10" r="3" fill="white"/>
          </svg>
        </div>
        <span>QuantiMeasurement <br /> App</span>
      </div>

      <p className={styles.section}>Operations</p>
      <nav>
        {OPS.map(op => (
          <button
            key={op.key}
            className={`${styles.link} ${curOp === op.key ? styles.active : ''}`}
            onClick={() => onOp(op.key)}
          >
            <span className={styles.icon} style={{ background: op.bg, color: op.fg }}>{op.icon}</span>
            {op.label}
          </button>
        ))}
      </nav>

      <p className={styles.section} style={{ marginTop: 8 }}>History</p>
      <nav>
        <button className={styles.link} onClick={() => onHistory('all')}>
          <span className={styles.icon} style={{ background: '#fdf2f8', color: '#ec4899' }}>📋</span>
          All History
        </button>
        <button className={styles.link} onClick={() => onErrors()}>
          <span className={styles.icon} style={{ background: '#fff7ed', color: '#f97316' }}>⚠</span>
          Errors
        </button>
      </nav>

      <div className={styles.footer}>
        <div className={styles.avatar}>{username?.[0]?.toUpperCase() || 'U'}</div>
        <div className={styles.userInfo}>
          <span className={styles.uname}>{username}</span>
          <span className={styles.role}>Authenticated</span>
        </div>
        <button className={styles.logout} onClick={onLogout} title="Logout">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
        </button>
      </div>
    </aside>
  );
}
