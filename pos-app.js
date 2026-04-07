/* ─── pos-app.js – POS Dashboard Logic ─── */

const MONTHS_DE = ["Jan","Feb","Mär","Apr","Mai","Jun","Jul","Aug","Sep","Okt","Nov","Dez"];

document.addEventListener('DOMContentLoaded', () => {
  renderSummary();
  renderChart();
  renderTable();
  updateTimestamp();
});

function allYears() {
  return Object.keys(POS_DATA).sort();
}

function getYear(year) {
  return POS_DATA[year] || [];
}

// Build a full 12-month array (null for missing months)
function fullYear(year) {
  const arr = getYear(year);
  return Array.from({length: 12}, (_, i) => {
    const month = String(i + 1).padStart(2, '0');
    const found = arr.find(d => d.period.slice(5,7) === month);
    return found ? found.revenue : null;
  });
}

function fmtEur(val) {
  if (val === null || val === undefined) return '–';
  return '€\u202f' + val.toLocaleString('de-DE', {minimumFractionDigits: 2, maximumFractionDigits: 2});
}

function fmtShort(val) {
  if (!val) return '€0';
  if (val >= 1000000) return '€' + (val/1000000).toFixed(1) + 'M';
  if (val >= 1000)    return '€' + (val/1000).toFixed(1) + 'k';
  return '€' + val.toFixed(0);
}

/* ── Summary Cards ── */
function renderSummary() {
  const years   = allYears();
  const container = document.getElementById('pos-summary');
  container.innerHTML = '';

  years.forEach(year => {
    const vals  = getYear(year).map(d => d.revenue).filter(v => v > 0);
    const total = vals.reduce((a, b) => a + b, 0);
    const avg   = vals.length ? total / vals.length : 0;
    const best  = vals.length ? Math.max(...vals) : 0;

    // YoY delta for total
    const prevYear = String(parseInt(year) - 1);
    let deltaHtml  = '';
    if (POS_DATA[prevYear]) {
      const prevTotal = getYear(prevYear).map(d => d.revenue).filter(v => v > 0).reduce((a,b) => a+b, 0);
      // only compare if same number of months available
      const curMonths  = getYear(year).filter(d => d.revenue > 0).length;
      const prevSliced = getYear(prevYear).slice(0, curMonths).map(d => d.revenue).filter(v => v > 0);
      const prevComp   = prevSliced.reduce((a,b) => a+b, 0);
      if (prevComp > 0) {
        const diff = total - prevComp;
        const pct  = (diff / prevComp * 100);
        const cls  = diff >= 0 ? 'up' : 'down';
        const sign = diff >= 0 ? '+' : '';
        deltaHtml  = `<span class="kpi-trend ${cls}" style="font-size:0.7rem">${sign}${pct.toFixed(1)}% vs. ${prevYear}</span>`;
      }
    }

    container.innerHTML += `
      <div class="pos-card">
        <div class="kpi-icon-label">
          <span class="kpi-icon">🏪</span>
          <span class="kpi-label">POS Umsatz ${year}</span>
        </div>
        <div style="display:flex;align-items:center;gap:0.7rem;flex-wrap:wrap;margin-top:0.4rem;">
          <div class="kpi-value" style="font-size:2rem;">${fmtEur(total)}</div>
          ${deltaHtml}
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.5rem;margin-top:0.8rem;">
          <div class="pos-stat"><span class="pos-stat-label">Ø / Monat</span><span class="pos-stat-val">${fmtEur(avg)}</span></div>
          <div class="pos-stat"><span class="pos-stat-label">Bester Monat</span><span class="pos-stat-val">${fmtEur(best)}</span></div>
        </div>
      </div>`;
  });
}

/* ── Main Comparison Chart ── */
function renderChart() {
  const years     = allYears();
  const container = document.getElementById('pos-chart');
  const legend    = document.getElementById('pos-legend');

  const colors = { primary: '#e8540a', secondary: '#111111' };
  const yearColors = {};
  years.forEach((y, i) => yearColors[y] = i === years.length - 1 ? colors.primary : colors.secondary);

  // Legend
  legend.innerHTML = years.map(y =>
    `<span class="pos-legend-item">
      <span class="pos-legend-dot" style="background:${yearColors[y]};opacity:${y === years[years.length-1] ? 1 : 0.3}"></span>
      ${y}
    </span>`
  ).join('');

  // Build SVG
  const W = 900, H = 260, padL = 60, padB = 30, padT = 20, padR = 20;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;
  const n      = 12;
  const slot   = innerW / n;
  const nYears = years.length;
  const barW   = Math.max(6, slot / (nYears + 0.8) - 2);

  // Max across all years
  const allVals = years.flatMap(y => fullYear(y).filter(v => v !== null));
  const max     = Math.max(...allVals) * 1.15 || 1;

  // Bars
  let bars = '';
  years.forEach((year, yi) => {
    const vals  = fullYear(year);
    const color = yearColors[year];
    const op    = year === years[years.length - 1] ? 1 : 0.28;
    vals.forEach((val, mi) => {
      if (val === null) return;
      const bH = (val / max) * innerH;
      const x  = padL + mi * slot + (slot - nYears * (barW + 2)) / 2 + yi * (barW + 2);
      const y  = padT + innerH - bH;
      bars += `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${barW}" height="${bH.toFixed(1)}"
        fill="${color}" rx="2" opacity="${op}"/>`;
    });
  });

  // Y ticks
  let ticks = '';
  [0, 0.25, 0.5, 0.75, 1].forEach(t => {
    const yPos = padT + innerH - t * innerH;
    const val  = t * max;
    ticks += `<line x1="${padL}" y1="${yPos}" x2="${W-padR}" y2="${yPos}" stroke="#e8e8e8" stroke-width="1"/>
      <text x="${padL-6}" y="${yPos+4}" fill="#aaa" font-size="10" text-anchor="end">${fmtShort(val)}</text>`;
  });

  // X labels
  let xlabels = '';
  MONTHS_DE.forEach((m, i) => {
    const x = padL + i * slot + slot / 2;
    xlabels += `<text x="${x}" y="${H-8}" fill="#888" font-size="10" text-anchor="middle">${m}</text>`;
  });

  container.innerHTML = `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;">
    ${ticks}${bars}${xlabels}
  </svg>`;
}

/* ── Detail Table ── */
function renderTable() {
  const years = allYears();
  const table = document.getElementById('pos-table');

  // Header
  let thead = `<thead style="background:var(--black)"><tr>
    <th style="padding:0.9rem 1rem;font-family:var(--font-display);font-size:0.56rem;letter-spacing:0.18em;text-transform:uppercase;color:#fff;font-weight:600;">Monat</th>
    ${years.map(y => `<th style="padding:0.9rem 1rem;font-family:var(--font-display);font-size:0.56rem;letter-spacing:0.18em;text-transform:uppercase;color:#fff;font-weight:600;">${y}</th>`).join('')}
    ${years.length >= 2 ? `<th style="padding:0.9rem 1rem;font-family:var(--font-display);font-size:0.56rem;letter-spacing:0.18em;text-transform:uppercase;color:var(--orange);font-weight:600;">Differenz</th>` : ''}
  </tr></thead>`;

  // Body
  const yearData = {};
  years.forEach(y => yearData[y] = fullYear(y));

  let rows = '';
  let totals = {};
  years.forEach(y => totals[y] = 0);

  for (let i = 0; i < 12; i++) {
    const hasAnyData = years.some(y => yearData[y][i] !== null);
    if (!hasAnyData) continue;

    const cells = years.map(y => {
      const val = yearData[y][i];
      if (val !== null) totals[y] += val;
      return `<td style="padding:0.82rem 1rem;font-variant-numeric:tabular-nums;color:var(--text);white-space:nowrap;">${val !== null ? fmtEur(val) : '<span style="color:var(--text-faint)">–</span>'}</td>`;
    }).join('');

    let diffCell = '';
    if (years.length >= 2) {
      const cur  = yearData[years[years.length-1]][i];
      const prev = yearData[years[years.length-2]][i];
      if (cur !== null && prev !== null && prev > 0) {
        const diff = cur - prev;
        const pct  = (diff / prev * 100);
        const cls  = diff >= 0 ? 'pos' : 'neg';
        const sign = diff >= 0 ? '+' : '';
        diffCell = `<td style="padding:0.82rem 1rem;white-space:nowrap;">
          <span style="font-family:var(--font-display);font-size:0.65rem;font-weight:700;" class="delta ${cls}">${sign}${pct.toFixed(1)}%</span>
          <span style="font-size:0.72rem;color:var(--text-muted);margin-left:0.3rem;">(${sign}${fmtEur(diff)})</span>
        </td>`;
      } else {
        diffCell = `<td style="padding:0.82rem 1rem;color:var(--text-faint);">–</td>`;
      }
    }

    rows += `<tr style="border-bottom:1px solid var(--border);">
      <td style="padding:0.82rem 1rem;font-family:var(--font-display);font-weight:700;font-size:0.72rem;color:var(--orange);letter-spacing:0.08em;text-transform:uppercase;">${MONTHS_DE[i]}</td>
      ${cells}${diffCell}
    </tr>`;
  }

  // Totals row
  const totalCells = years.map(y =>
    `<td class="total-cell">${fmtEur(totals[y])}</td>`
  ).join('');

  let totalDiff = '';
  if (years.length >= 2) {
    const cur  = totals[years[years.length-1]];
    const prev = totals[years[years.length-2]];
    if (prev > 0) {
      const diff = cur - prev;
      const pct  = (diff / prev * 100);
      const cls  = diff >= 0 ? 'pos' : 'neg';
      const sign = diff >= 0 ? '+' : '';
      totalDiff = `<td class="total-cell">
        <span class="delta ${cls}" style="font-size:0.7rem">${sign}${pct.toFixed(1)}%</span>
        <span style="font-size:0.7rem;color:#aaa;margin-left:0.3rem;">(${sign}${fmtEur(diff)})</span>
      </td>`;
    } else {
      totalDiff = `<td class="total-cell">–</td>`;
    }
  }

  const tbody = `<tbody>${rows}
    <tr class="total-row">
      <td class="total-label">Gesamt</td>
      ${totalCells}${totalDiff}
    </tr>
  </tbody>`;

  table.innerHTML = thead + tbody;
}

function updateTimestamp() {
  const el = document.getElementById('last-updated');
  if (el) el.textContent = 'Stand: ' + new Date().toLocaleDateString('de-DE', {
    day: '2-digit', month: '2-digit', year: 'numeric'
  });
}
