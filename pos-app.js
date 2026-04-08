/* ─── pos-app.js – Shared Channel Dashboard Logic ───
   Used by both pos.html and otto.html.
   Each page injects: CHANNEL_DATA, CHANNEL_LABEL, CHANNEL_ICON
─── */

const MONTHS_DE = ["Jan","Feb","Mär","Apr","Mai","Jun","Jul","Aug","Sep","Okt","Nov","Dez"];

document.addEventListener('DOMContentLoaded', () => {
  renderSummary();
  renderChart();
  renderTable();
  updateTimestamp();
});

function allYears()    { return Object.keys(CHANNEL_DATA).sort(); }
function getYear(year) { return CHANNEL_DATA[year] || []; }

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
  const abs = Math.abs(val);
  const str = abs.toLocaleString('de-DE', {minimumFractionDigits: 2, maximumFractionDigits: 2});
  return (val < 0 ? '-' : '') + '€\u202f' + str;
}

function fmtShort(val) {
  if (val === null) return '';
  const sign = val < 0 ? '-' : '';
  const abs  = Math.abs(val);
  if (abs >= 1000000) return sign + '€' + (abs/1000000).toFixed(1) + 'M';
  if (abs >= 1000)    return sign + '€' + (abs/1000).toFixed(1) + 'k';
  return sign + '€' + abs.toFixed(0);
}

/* ── Summary Cards ── */
function renderSummary() {
  const years     = allYears();
  const container = document.getElementById('pos-summary');
  container.innerHTML = '';

  years.forEach(year => {
    const entries      = getYear(year);
    const vals         = entries.map(d => d.revenue);
    const total        = vals.reduce((a, b) => a + b, 0);
    const positiveVals = vals.filter(v => v > 0);
    const avg          = entries.length ? total / entries.length : 0;
    const best         = positiveVals.length ? Math.max(...positiveVals) : 0;

    const prevYear = String(parseInt(year) - 1);
    let deltaHtml  = '';
    if (CHANNEL_DATA[prevYear]) {
      const curMonths = entries.length;
      const prevComp  = getYear(prevYear).slice(0, curMonths).map(d => d.revenue).reduce((a,b) => a+b, 0);
      if (prevComp !== 0) {
        const diff = total - prevComp;
        const pct  = diff / Math.abs(prevComp) * 100;
        const cls  = diff >= 0 ? 'up' : 'down';
        const sign = diff >= 0 ? '+' : '';
        deltaHtml  = `<span class="kpi-trend ${cls}" style="font-size:0.7rem">${sign}${pct.toFixed(1)}% vs. ${prevYear}</span>`;
      }
    }

    container.innerHTML += `
      <div class="pos-card">
        <div class="kpi-icon-label">
          <span class="kpi-icon">${CHANNEL_ICON}</span>
          <span class="kpi-label">${CHANNEL_LABEL} ${year}</span>
        </div>
        <div style="display:flex;align-items:center;gap:0.7rem;flex-wrap:wrap;margin-top:0.4rem;">
          <div class="kpi-value" style="font-size:1.9rem;">${fmtEur(total)}</div>
          ${deltaHtml}
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.5rem;margin-top:0.8rem;">
          <div class="pos-stat">
            <span class="pos-stat-label">Ø / Monat</span>
            <span class="pos-stat-val">${fmtEur(avg)}</span>
          </div>
          <div class="pos-stat">
            <span class="pos-stat-label">Bester Monat</span>
            <span class="pos-stat-val">${fmtEur(best)}</span>
          </div>
        </div>
      </div>`;
  });
}

/* ── Comparison Chart ── */
function renderChart() {
  const years     = allYears();
  const container = document.getElementById('pos-chart');
  const legend    = document.getElementById('pos-legend');

  const yearColors = {};
  years.forEach((y, i) => yearColors[y] = i === years.length - 1 ? '#e8540a' : '#111111');

  legend.innerHTML = years.map(y =>
    `<span class="pos-legend-item">
      <span class="pos-legend-dot" style="background:${yearColors[y]};opacity:${y === years[years.length-1] ? 1 : 0.3}"></span>
      ${y}
    </span>`
  ).join('');

  const W = 900, H = 260, padL = 65, padB = 30, padT = 20, padR = 20;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;
  const slot   = innerW / 12;
  const nYears = years.length;
  const barW   = Math.max(6, slot / (nYears + 0.8) - 2);

  const allVals = years.flatMap(y => fullYear(y).filter(v => v !== null));
  const maxVal  = Math.max(...allVals, 0) * 1.15 || 1;
  const minVal  = Math.min(...allVals, 0);
  const range   = maxVal - minVal;
  const zeroY   = padT + innerH - ((0 - minVal) / range) * innerH;

  let bars = '';
  years.forEach((year, yi) => {
    const vals  = fullYear(year);
    const color = yearColors[year];
    const op    = year === years[years.length-1] ? 1 : 0.28;
    vals.forEach((val, mi) => {
      if (val === null) return;
      const bH  = Math.abs((val / range) * innerH);
      const x   = padL + mi * slot + (slot - nYears * (barW + 2)) / 2 + yi * (barW + 2);
      const y   = val >= 0 ? zeroY - bH : zeroY;
      const clr = val < 0 ? '#c0392b' : color;
      bars += `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${barW}" height="${Math.max(1,bH).toFixed(1)}"
        fill="${clr}" rx="2" opacity="${val < 0 ? 0.7 : op}"/>`;
    });
  });

  let ticks = '';
  for (let i = 0; i <= 5; i++) {
    const t    = i / 5;
    const val  = minVal + t * range;
    const yPos = padT + innerH - t * innerH;
    const zero = Math.abs(val) < range * 0.02;
    ticks += `<line x1="${padL}" y1="${yPos}" x2="${W-padR}" y2="${yPos}"
      stroke="${zero ? '#aaa' : '#e8e8e8'}" stroke-width="${zero ? 1.5 : 1}"/>
      <text x="${padL-6}" y="${yPos+4}" fill="#aaa" font-size="10" text-anchor="end">${fmtShort(val)}</text>`;
  }

  const xlabels = MONTHS_DE.map((m, i) => {
    const x = padL + i * slot + slot / 2;
    return `<text x="${x}" y="${H-8}" fill="#888" font-size="10" text-anchor="middle">${m}</text>`;
  }).join('');

  container.innerHTML = `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;">
    ${ticks}${bars}${xlabels}
  </svg>`;
}

/* ── Detail Table ── */
function renderTable() {
  const years    = allYears();
  const table    = document.getElementById('pos-table');
  const thStyle  = `padding:0.9rem 1rem;font-family:var(--font-display);font-size:0.56rem;letter-spacing:0.18em;text-transform:uppercase;font-weight:600;`;
  const tdStyle  = `padding:0.82rem 1rem;font-variant-numeric:tabular-nums;white-space:nowrap;`;

  const thead = `<thead style="background:var(--black)"><tr>
    <th style="${thStyle}color:#fff;">Monat</th>
    ${years.map(y => `<th style="${thStyle}color:#fff;">${y}</th>`).join('')}
    ${years.length >= 2 ? `<th style="${thStyle}color:var(--orange);">Differenz</th>` : ''}
  </tr></thead>`;

  const yearData = {};
  const totals   = {};
  years.forEach(y => { yearData[y] = fullYear(y); totals[y] = 0; });

  let rows = '';
  for (let i = 0; i < 12; i++) {
    if (!years.some(y => yearData[y][i] !== null)) continue;
    years.forEach(y => { if (yearData[y][i] !== null) totals[y] += yearData[y][i]; });

    const cells = years.map(y => {
      const val = yearData[y][i];
      if (val === null) return `<td style="${tdStyle}color:var(--text-faint)">–</td>`;
      const color = val < 0 ? 'color:var(--down)' : 'color:var(--text)';
      return `<td style="${tdStyle}${color}">${fmtEur(val)}</td>`;
    }).join('');

    let diffCell = '';
    if (years.length >= 2) {
      const cur  = yearData[years[years.length-1]][i];
      const prev = yearData[years[years.length-2]][i];
      if (cur !== null && prev !== null && prev !== 0) {
        const diff = cur - prev;
        const pct  = diff / Math.abs(prev) * 100;
        const cls  = diff >= 0 ? 'pos' : 'neg';
        const sign = diff >= 0 ? '+' : '';
        diffCell = `<td style="${tdStyle}">
          <span class="delta ${cls}" style="font-family:var(--font-display);font-size:0.65rem;font-weight:700;">${sign}${pct.toFixed(1)}%</span>
          <span style="font-size:0.72rem;color:var(--text-muted);margin-left:0.3rem;">(${sign}${fmtEur(diff)})</span>
        </td>`;
      } else {
        diffCell = `<td style="${tdStyle}color:var(--text-faint)">–</td>`;
      }
    }

    rows += `<tr style="border-bottom:1px solid var(--border);">
      <td style="${tdStyle}font-family:var(--font-display);font-weight:700;font-size:0.72rem;color:var(--orange);letter-spacing:0.08em;text-transform:uppercase;">${MONTHS_DE[i]}</td>
      ${cells}${diffCell}
    </tr>`;
  }

  const totalCells = years.map(y => {
    const neg = totals[y] < 0 ? 'color:var(--down)' : '';
    return `<td class="total-cell" style="${neg}">${fmtEur(totals[y])}</td>`;
  }).join('');

  let totalDiff = '';
  if (years.length >= 2) {
    const cur  = totals[years[years.length-1]];
    const prev = totals[years[years.length-2]];
    if (prev !== 0) {
      const diff = cur - prev;
      const pct  = diff / Math.abs(prev) * 100;
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

  table.innerHTML = thead + `<tbody>${rows}
    <tr class="total-row">
      <td class="total-label">Gesamt</td>
      ${totalCells}${totalDiff}
    </tr>
  </tbody>`;
}

function updateTimestamp() {
  const el = document.getElementById('last-updated');
  if (el) el.textContent = 'Stand: ' + new Date().toLocaleDateString('de-DE', {
    day: '2-digit', month: '2-digit', year: 'numeric'
  });
}
