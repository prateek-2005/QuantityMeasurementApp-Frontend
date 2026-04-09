import React, { useState, useEffect } from 'react';
import * as api from '../services/api';
import styles from './HistoryModal.module.css';

const FILTERS = ['all','CONVERT','COMPARE','ADD','SUBTRACT','DIVIDE','errored'];

export default function HistoryModal({ initial, onClose }) {
  const [filter, setFilter] = useState(initial || 'all');
  const [items,  setItems]  = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    load(filter);
  }, [filter]);

  const load = async (f) => {
    setLoading(true);
    try {
      let res;
      if (f === 'all')     res = await api.getHistory();
      else if (f === 'errored') res = await api.getErrorHistory();
      else                 res = await api.getHistoryByOp(f);
      setItems(res.data || []);
    } catch { setItems([]); }
    finally { setLoading(false); }
  };

  return (
    <div className={styles.bg} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>

        <div className={styles.hd}>
          <h2>📋 Measurement History</h2>
          <button className={styles.close} onClick={onClose}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className={styles.filters}>
          {FILTERS.map(f => (
            <button
              key={f}
              className={`${styles.pill} ${filter === f ? styles.active : ''}`}
              onClick={() => setFilter(f)}
            >
              {f === 'all' ? 'All' : f === 'errored' ? '⚠ Errors' : f[0]+f.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        <div className={styles.list}>
          {loading && <p className={styles.empty}>Loading…</p>}
          {!loading && items.length === 0 && <p className={styles.empty}>No records found.</p>}
          {!loading && items.map((item, i) => <HistoryItem key={i} item={item} />)}
        </div>

      </div>
    </div>
  );
}

function HistoryItem({ item }) {
  const time = item.createdAt ? new Date(item.createdAt).toLocaleString() : '';
  const op   = (item.operation || '').toUpperCase();

  let res;
  if (item.error || item.errorMessage) {
    res = <div className={styles.iErr}>⚠ {item.errorMessage || 'Error'}</div>;
  } else if (op === 'COMPARE') {
    const s  = String(item.resultString || '').toLowerCase();
    const eq = s === 'equal' || s === 'true';
    res = <div className={styles.iRes}>{eq ? '✅ Equal' : '❌ Not equal'}</div>;
  } else if (op === 'DIVIDE') {
    const n = parseFloat(item.resultString || item.resultValue || 0);
    res = <div className={styles.iRes}>{isNaN(n) ? '—' : +n.toFixed(4)}</div>;
  } else {
    const v = item.resultValue ?? item.resultString ?? '';
    res = <div className={styles.iRes}>{typeof v === 'number' ? +v.toFixed(4) : v}{item.resultUnit ? ' '+item.resultUnit : ''}</div>;
  }

  return (
    <div className={styles.item}>
      <div className={styles.iTop}>
        <span className={styles.iOp}>{item.operation || '?'}</span>
        <span className={styles.iType}>{item.thisMeasurementType || ''}</span>
        <span className={styles.iTime}>{time}</span>
      </div>
      <div className={styles.iVals}>
        {item.thisValue != null ? `${item.thisValue} ${item.thisUnit || ''}` : ''}
        {item.thatValue ? ` · ${item.thatValue} ${item.thatUnit || ''}` : ''}
      </div>
      {res}
    </div>
  );
}
