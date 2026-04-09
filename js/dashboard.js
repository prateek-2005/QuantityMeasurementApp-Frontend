const API = 'http://localhost:8080';

const UNITS = {
  LengthUnit:      ['FEET','INCHES','YARDS','CENTIMETERS'],
  WeightUnit:      ['MILLIGRAM','GRAM','KILOGRAM','POUND','TONNE'],
  VolumeUnit:      ['LITRE','MILLILITRE','GALLON'],
  TemperatureUnit: ['CELSIUS','FAHRENHEIT','KELVIN'],
};

const TYPE_LABEL = { LengthUnit:'Length', WeightUnit:'Weight', VolumeUnit:'Volume', TemperatureUnit:'Temperature' };

const OPS = {
  convert:  { label:'Convert',  icon:'⇄', sym:'→', hint:'Enter a value and choose target unit' },
  compare:  { label:'Compare',  icon:'⚖', sym:'≟', hint:'Check if two quantities are equal' },
  add:      { label:'Add',      icon:'+', sym:'+',  hint:'Sum two quantities together' },
  subtract: { label:'Subtract', icon:'−', sym:'−',  hint:'Subtract second value from first' },
  divide:   { label:'Divide',   icon:'÷', sym:'÷',  hint:'Divide first quantity by second' },
};

let curOp   = 'convert';
let curType = 'LengthUnit';

// ── Init ──────────────────────────────────────────────
(function () {
  if (!localStorage.getItem('jwt_token')) { location.href = 'index.html'; return; }
  const u = localStorage.getItem('username') || 'User';
  document.getElementById('sb-av').textContent    = u[0].toUpperCase();
  document.getElementById('sb-uname').textContent = u;
  fillSelects('LengthUnit');
  loadCounts();
})();

function doLogout() { localStorage.clear(); location.href = 'index.html'; }
function toggleSb() { document.getElementById('sidebar').classList.toggle('open'); }

// ── Selects ───────────────────────────────────────────
function fillSel(id, units) {
  document.getElementById(id).innerHTML = units.map(u => `<option>${u}</option>`).join('');
}
function fillSelects(type) {
  const u = UNITS[type];
  fillSel('u1', u); fillSel('u2', u); fillSel('u-target', u);
}

// ── Switch operation ──────────────────────────────────
function setOp(op, btn) {
  curOp = op;
  document.querySelectorAll('.sb-link').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  const m       = OPS[op];
  const twoQty  = ['compare','add','subtract','divide'].includes(op);
  const hasTgt  = ['convert','add','subtract'].includes(op);

  document.getElementById('tb-title').textContent  = `${m.icon} ${m.label}`;
  document.getElementById('form-ico').textContent  = m.icon;
  document.getElementById('form-title').textContent = `${m.label} — ${TYPE_LABEL[curType]}`;
  document.getElementById('form-sub').textContent  = m.hint;
  document.getElementById('run-lbl').textContent   = `Run ${m.label}`;
  document.getElementById('lbl1').textContent      = twoQty ? 'First Value' : 'Value';
  document.getElementById('op-sym').textContent    = m.sym;
  document.getElementById('lbl-tgt').textContent   = op === 'convert' ? 'Convert To Unit' : 'Result Unit (optional)';

  show('sym-row',    twoQty);
  show('qty2-grp',   twoQty);
  show('target-grp', hasTgt);
  clearRes();
}

// ── Switch type ───────────────────────────────────────
function setType(type, btn) {
  curType = type;
  document.querySelectorAll('.pill').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  fillSelects(type);
  document.getElementById('form-title').textContent = `${OPS[curOp].label} — ${TYPE_LABEL[type]}`;
  clearRes();
}

// ── API ───────────────────────────────────────────────
async function api(path, method = 'POST', body = null) {
  const opts = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`,
    },
  };
  if (body) opts.body = JSON.stringify(body);

  const res  = await fetch(API + path, opts);
  const text = await res.text();

  if (res.status === 401 || res.status === 403) {
    localStorage.clear(); location.href = 'index.html';
    throw new Error('Session expired');
  }
  if (!res.ok) {
    let msg = text;
    try { msg = JSON.parse(text).message || text; } catch (_) {}
    throw new Error(msg || `HTTP ${res.status}`);
  }
  try { return JSON.parse(text); } catch (_) { return text; }
}

function qty(valId, unitId) {
  return {
    value:           parseFloat(document.getElementById(valId).value),
    unit:            document.getElementById(unitId).value,
    measurementType: curType,
  };
}

// ── Run ───────────────────────────────────────────────
async function runOp() {
  hideErr(); clearRes();

  if (!document.getElementById('v1').value) { showErr('Please enter a value.'); return; }

  const twoQty = ['compare','add','subtract','divide'].includes(curOp);
  if (twoQty && !document.getElementById('v2').value) { showErr('Please enter the second value.'); return; }

  setBusy(true);
  try {
    const q1  = qty('v1', 'u1');
    const q2  = qty('v2', 'u2');
    const tgt = document.getElementById('u-target').value;
    let result;

    if (curOp === 'convert') {
      result = await api('/api/measurements/convert', 'POST', { thisQuantity: q1, targetUnit: tgt });
    } else if (curOp === 'compare') {
      result = await api('/api/measurements/compare', 'POST', { thisQuantity: q1, thatQuantity: q2 });
    } else if (curOp === 'add') {
      result = await api('/api/measurements/add', 'POST', { thisQuantity: q1, thatQuantity: q2, ...(tgt && { targetUnit: tgt }) });
    } else if (curOp === 'subtract') {
      result = await api('/api/measurements/subtract', 'POST', { thisQuantity: q1, thatQuantity: q2, ...(tgt && { targetUnit: tgt }) });
    } else if (curOp === 'divide') {
      result = await api('/api/measurements/divide', 'POST', { thisQuantity: q1, thatQuantity: q2 });
    }

    showResult(result);
    loadCounts();
  } catch (err) {
    showErr(err.message.includes('fetch')
      ? '⚠️ Cannot reach backend. Make sure Spring Boot is running on port 8080.'
      : err.message);
  } finally { setBusy(false); }
}

// ── Render result ─────────────────────────────────────
// FIX 1 — Compare: backend returns "Equal"/"Not Equal" not "true"/"false"
// FIX 2 — Divide:  backend stores result in resultString, not resultValue
function showResult(r) {
  const card = document.getElementById('result-card');
  const body = document.getElementById('result-body');
  card.style.display = 'block';

  if (curOp === 'compare') {
    const s  = String(r.resultString || '').toLowerCase();
    const eq = s === 'equal' || s === 'true';
    body.innerHTML = `
      <div class="cmp-box ${eq ? 'eq' : 'neq'}">
        <span style="font-size:20px">${eq ? '✅' : '❌'}</span>
        <span>The two quantities are <strong>${eq ? 'EQUAL' : 'NOT EQUAL'}</strong></span>
      </div>`;
  } else if (curOp === 'divide') {
    const num  = parseFloat(r.resultString || r.resultValue || 0);
    const disp = isNaN(num) ? '—' : +num.toFixed(6);
    body.innerHTML = `
      <div class="result-num">
        <span class="r-val">${disp}</span>
        <span class="r-unit">ratio</span>
      </div>`;
  } else {
    const val  = r.resultValue ?? r.resultString ?? '—';
    const unit = r.resultUnit ?? '';
    const disp = typeof val === 'number' ? +val.toFixed(6) : val;
    body.innerHTML = `
      <div class="result-num">
        <span class="r-val">${disp}</span>
        ${unit ? `<span class="r-unit">${unit}</span>` : ''}
      </div>`;
  }

  const ch = [];
  if (r.operation)            ch.push(`<span class="chip">Op: ${r.operation}</span>`);
  if (r.thisMeasurementType)  ch.push(`<span class="chip">${r.thisMeasurementType}</span>`);
  ch.push(r.error ? `<span class="chip bad">ERROR</span>` : `<span class="chip ok">✓ SUCCESS</span>`);
  document.getElementById('result-chips').innerHTML = ch.join('');
}

function clearRes() { document.getElementById('result-card').style.display = 'none'; }

// ── Stats ─────────────────────────────────────────────
async function loadCounts() {
  for (const op of ['CONVERT','COMPARE','ADD','SUBTRACT','DIVIDE']) {
    try {
      const d  = await api(`/api/measurements/count/${op}`, 'GET');
      const el = document.getElementById(`cnt-${op.toLowerCase()}`);
      if (el) el.textContent = d.count ?? '0';
    } catch (_) {
      const el = document.getElementById(`cnt-${op.toLowerCase()}`);
      if (el) el.textContent = '–';
    }
  }
}

// ── History modal ─────────────────────────────────────
function openModal(filter) {
  document.getElementById('modal-bg').classList.add('open');
  loadHist(filter, null);
}
function closeModal() { document.getElementById('modal-bg').classList.remove('open'); }
function closeBg(e)   { if (e.target === document.getElementById('modal-bg')) closeModal(); }

async function loadHist(filter, btn) {
  if (btn) {
    document.querySelectorAll('.mf').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  }
  const list = document.getElementById('modal-list');
  list.innerHTML = '<div class="ml-empty">Loading…</div>';
  try {
    const path = filter === 'all' ? '/api/measurements/history'
               : filter === 'errored' ? '/api/measurements/history/errored'
               : `/api/measurements/history/${filter}`;
    const data = await api(path, 'GET');
    renderHist(data);
  } catch (err) {
    list.innerHTML = `<div class="ml-empty">Error: ${err.message}</div>`;
  }
}

function renderHist(items) {
  const list = document.getElementById('modal-list');
  if (!items?.length) { list.innerHTML = '<div class="ml-empty">No records found.</div>'; return; }
  list.innerHTML = items.map(item => {
    const time = item.createdAt ? new Date(item.createdAt).toLocaleString() : '';
    let res;
    if (item.error || item.errorMessage) {
      res = `<div class="ml-err">⚠ ${item.errorMessage || 'Error'}</div>`;
    } else if ((item.operation||'').toUpperCase() === 'COMPARE') {
      const s = String(item.resultString||'').toLowerCase();
      res = `<div class="ml-res">${(s==='equal'||s==='true') ? '✅ Equal' : '❌ Not equal'}</div>`;
    } else if ((item.operation||'').toUpperCase() === 'DIVIDE') {
      const n = parseFloat(item.resultString || item.resultValue || 0);
      res = `<div class="ml-res">${isNaN(n) ? '—' : +n.toFixed(4)}</div>`;
    } else {
      const v = item.resultValue ?? item.resultString ?? '';
      res = `<div class="ml-res">${typeof v==='number' ? +v.toFixed(4) : v}${item.resultUnit ? ' '+item.resultUnit : ''}</div>`;
    }
    return `
      <div class="ml-item">
        <div class="ml-top">
          <span class="ml-op">${item.operation||'?'}</span>
          <span class="ml-type">${item.thisMeasurementType||''}</span>
          <span class="ml-time">${time}</span>
        </div>
        <div class="ml-vals">
          ${item.thisValue!=null ? `${item.thisValue} ${item.thisUnit||''}` : ''}
          ${item.thatValue ? ` · ${item.thatValue} ${item.thatUnit||''}` : ''}
        </div>
        ${res}
      </div>`;
  }).join('');
}

// ── Helpers ───────────────────────────────────────────
function show(id, visible) { document.getElementById(id).style.display = visible ? 'block' : 'none'; }
function showErr(msg) { const e = document.getElementById('err-box'); e.innerHTML = msg; e.style.display = 'block'; }
function hideErr()    { document.getElementById('err-box').style.display = 'none'; }
function setBusy(on) {
  document.getElementById('run-btn').disabled   = on;
  document.getElementById('run-lbl').style.display = on ? 'none' : 'inline';
  document.getElementById('spinner').style.display  = on ? 'inline-block' : 'none';
}