import React from 'react';
import styles from './Stats.module.css';

const OPS = ['CONVERT','COMPARE','ADD','SUBTRACT','DIVIDE'];

export default function Stats({ counts, onOpen }) {
  return (
    <div className={styles.grid}>
      {OPS.map(op => (
        <div key={op} className={styles.box} onClick={() => onOpen(op)}>
          <div className={styles.num}>{counts[op] ?? '—'}</div>
          <div className={styles.lbl}>{op[0] + op.slice(1).toLowerCase()}s</div>
        </div>
      ))}
    </div>
  );
}
