import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar      from './Sidebar';
import OpForm       from './OpForm';
import Stats        from './Stats';
import HistoryModal from './HistoryModal';
import useCounts    from '../hooks/useCounts';
import styles from './Dashboard.module.css';

const OPS_META = {
  convert:  { icon:'⇄', label:'Convert'  },
  compare:  { icon:'⚖', label:'Compare'  },
  add:      { icon:'+', label:'Add'       },
  subtract: { icon:'−', label:'Subtract' },
  divide:   { icon:'÷', label:'Divide'   },
};

export default function Dashboard() {
  const nav = useNavigate();
  const [curOp,   setCurOp]   = useState('convert');
  const [modal,   setModal]   = useState(null);   // null | 'all' | 'CONVERT' | ...
  const { counts, refresh }   = useCounts();

  const username = localStorage.getItem('username') || 'User';

  useEffect(() => { refresh(); }, []);

  const logout = () => { localStorage.clear(); nav('/login'); };
  const meta   = OPS_META[curOp];

  return (
    <div className={styles.layout}>
      <Sidebar
        curOp={curOp}
        onOp={op => setCurOp(op)}
        onHistory={f => setModal(f)}
        onErrors={() => setModal('errored')}
        username={username}
        onLogout={logout}
      />

      <div className={styles.main}>
        <header className={styles.topbar}>
          <span className={styles.tbTitle}>{meta.icon} {meta.label}</span>
          <button className={styles.histBtn} onClick={() => setModal('all')}>📋 History</button>
        </header>

        <div className={styles.page}>
          <OpForm curOp={curOp} onCountRefresh={refresh} />
          <Stats counts={counts} onOpen={op => setModal(op)} />


        </div>
      </div>

      {modal && <HistoryModal initial={modal} onClose={() => setModal(null)} />}
    </div>
  );
}
