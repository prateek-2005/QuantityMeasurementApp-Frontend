import React, { useState } from 'react';
import * as api from '../services/api';
import styles from './OpForm.module.css';

const UNITS = {
  LengthUnit:      ['FEET','INCHES','YARDS','CENTIMETERS'],
  WeightUnit:      ['MILLIGRAM','GRAM','KILOGRAM','POUND','TONNE'],
  VolumeUnit:      ['LITRE','MILLILITRE','GALLON'],
  TemperatureUnit: ['CELSIUS','FAHRENHEIT','KELVIN'],
};

const TYPE_LABEL = { LengthUnit:'Length', WeightUnit:'Weight', VolumeUnit:'Volume', TemperatureUnit:'Temperature' };

const OPS_META = {
  convert:  { label:'Convert',  icon:'⇄', hint:'Enter a value and choose target unit' },
  compare:  { label:'Compare',  icon:'⚖', hint:'Check if two quantities are equal' },
  add:      { label:'Add',      icon:'+', hint:'Sum two quantities together' },
  subtract: { label:'Subtract', icon:'−', hint:'Subtract second value from first' },
  divide:   { label:'Divide',   icon:'÷', hint:'Divide first quantity by second' },
};

const TYPES = ['LengthUnit','WeightUnit','VolumeUnit','TemperatureUnit'];
const TYPE_ICONS = { LengthUnit:'📏', WeightUnit:'⚖️', VolumeUnit:'💧', TemperatureUnit:'🌡️' };

export default function OpForm({ curOp, onCountRefresh }) {
  const [curType, setCurType] = useState('LengthUnit');
  const [v1, setV1] = useState('');
  const [u1, setU1] = useState('FEET');
  const [v2, setV2] = useState('');
  const [u2, setU2] = useState('FEET');
  const [target, setTarget] = useState('FEET');
  const [result, setResult] = useState(null);
  const [error,  setError]  = useState('');
  const [busy,   setBusy]   = useState(false);

  const twoQty = ['compare','add','subtract','divide'].includes(curOp);
  const hasTgt = ['convert','add','subtract'].includes(curOp);
  const meta   = OPS_META[curOp];

  // When type changes, reset unit selects to first unit of that type
  const changeType = (type) => {
    setCurType(type);
    const first = UNITS[type][0];
    setU1(first); setU2(first); setTarget(first);
    setResult(null); setError('');
  };

  const qty = (val, unit) => ({ value: parseFloat(val), unit, measurementType: curType });

  const run = async () => {
    if (!v1) { setError('Please enter a value.'); return; }
    if (twoQty && !v2) { setError('Please enter the second value.'); return; }
    setError(''); setResult(null); setBusy(true);
    try {
      let res;
      const q1 = qty(v1, u1);
      const q2 = qty(v2, u2);

      if (curOp === 'convert')  res = await api.convert({ thisQuantity: q1, targetUnit: target });
      if (curOp === 'compare')  res = await api.compare({ thisQuantity: q1, thatQuantity: q2 });
      if (curOp === 'add')      res = await api.add({ thisQuantity: q1, thatQuantity: q2, ...(target && { targetUnit: target }) });
      if (curOp === 'subtract') res = await api.subtract({ thisQuantity: q1, thatQuantity: q2, ...(target && { targetUnit: target }) });
      if (curOp === 'divide')   res = await api.divide({ thisQuantity: q1, thatQuantity: q2 });

      setResult(res.data);
      onCountRefresh();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Something went wrong');
    } finally { setBusy(false); }
  };

  return (
    <div className={styles.wrap}>

      {/* Type pills */}
      <div className={styles.card}>
        <div className={styles.cardHead}>
          <div className={styles.chIcon}>📐</div>
          <div>
            <div className={styles.chTitle}>Measurement Type</div>
            <div className={styles.chSub}>Choose what you want to measure</div>
          </div>
        </div>
        <div className={styles.pills}>
          {TYPES.map(t => (
            <button
              key={t}
              className={`${styles.pill} ${curType === t ? styles.pillActive : ''}`}
              onClick={() => changeType(t)}
            >
              {TYPE_ICONS[t]} {TYPE_LABEL[t]}
            </button>
          ))}
        </div>
      </div>

      {/* Operation form */}
      <div className={styles.card}>
        <div className={styles.cardHead}>
          <div className={styles.chIcon}>{meta.icon}</div>
          <div>
            <div className={styles.chTitle}>{meta.label} — {TYPE_LABEL[curType]}</div>
            <div className={styles.chSub}>{meta.hint}</div>
          </div>
        </div>

        <div className={styles.formBody}>

          <div className={styles.field}>
            <label>{twoQty ? 'First Value' : 'Value'}</label>
            <div className={styles.row}>
              <input
                type="number" step="any" placeholder="0.00"
                value={v1} onChange={e => { setV1(e.target.value); setResult(null); }}
              />
              <select value={u1} onChange={e => { setU1(e.target.value); setResult(null); }}>
                {UNITS[curType].map(u => <option key={u}>{u}</option>)}
              </select>
            </div>
          </div>

          {twoQty && (
            <>
              <div className={styles.opSym}>{meta.icon}</div>
              <div className={styles.field}>
                <label>Second Value</label>
                <div className={styles.row}>
                  <input
                    type="number" step="any" placeholder="0.00"
                    value={v2} onChange={e => { setV2(e.target.value); setResult(null); }}
                  />
                  <select value={u2} onChange={e => { setU2(e.target.value); setResult(null); }}>
                    {UNITS[curType].map(u => <option key={u}>{u}</option>)}
                  </select>
                </div>
              </div>
            </>
          )}

          {hasTgt && (
            <div className={styles.field}>
              <label>{curOp === 'convert' ? 'Convert To Unit' : 'Result Unit (optional)'}</label>
              <select className={styles.wide} value={target} onChange={e => { setTarget(e.target.value); setResult(null); }}>
                {UNITS[curType].map(u => <option key={u}>{u}</option>)}
              </select>
            </div>
          )}

          {error && <div className={styles.errBox}>{error}</div>}

          <button className={styles.runBtn} onClick={run} disabled={busy}>
            {busy ? <span className={styles.spinner} /> : `Run ${meta.label}`}
          </button>
        </div>
      </div>

      {/* Result */}
      {result && <Result data={result} op={curOp} />}

    </div>
  );
}

// ── Result component ──────────────────────────────────
function Result({ data, op }) {
  const isCompare = op === 'compare';
  const isDivide  = op === 'divide';

  let body;
  if (isCompare) {
    const s  = String(data.resultString || '').toLowerCase();
    const eq = s === 'equal' || s === 'true';
    body = (
      <div className={`${styles.cmpBox} ${eq ? styles.eq : styles.neq}`}>
        <span style={{ fontSize: 22 }}>{eq ? '✅' : '❌'}</span>
        <span>The two quantities are <strong>{eq ? 'EQUAL' : 'NOT EQUAL'}</strong></span>
      </div>
    );
  } else if (isDivide) {
    const num  = parseFloat(data.resultString || data.resultValue || 0);
    const disp = isNaN(num) ? '—' : +num.toFixed(6);
    body = (
      <div className={styles.resultNum}>
        <span className={styles.rVal}>{disp}</span>
        <span className={styles.rUnit}>ratio</span>
      </div>
    );
  } else {
    const val  = data.resultValue ?? data.resultString ?? '—';
    const disp = typeof val === 'number' ? +val.toFixed(6) : val;
    body = (
      <div className={styles.resultNum}>
        <span className={styles.rVal}>{disp}</span>
        {data.resultUnit && <span className={styles.rUnit}>{data.resultUnit}</span>}
      </div>
    );
  }

  return (
    <div className={`${styles.card} ${styles.resultCard}`}>
      <div className={styles.cardHead}>
        <div className={styles.chIcon}>✨</div>
        <div>
          <div className={styles.chTitle}>Result</div>
          <div className={styles.chSub}>Operation completed</div>
        </div>
      </div>
      {body}
      <div className={styles.chips}>
        {data.operation && <span className={styles.chip}>Op: {data.operation}</span>}
        {data.thisMeasurementType && <span className={styles.chip}>{data.thisMeasurementType}</span>}
        <span className={`${styles.chip} ${data.error ? styles.chipBad : styles.chipOk}`}>
          {data.error ? 'ERROR' : '✓ SUCCESS'}
        </span>
      </div>
    </div>
  );
}
