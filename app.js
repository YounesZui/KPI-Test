/* ─── app.js – Dashboard Logic ─── */

/* ── State ── */
let activeYear  = null;   // "2025" | "2026" etc.
let activeIndex = 0;      // index within activeYear's array
let compareMode = false;  // YoY comparison toggle

/* ── Init ── */
document.addEventListener('DOMContentLoaded', () => {
  const years = Object.keys(KPI_DATA).sort();
  activeYear  = years[years.length - 1];          // latest year
  activeIndex = KPI_DATA[activeYear].length - 1;  // latest period
  render();
});

/* ── Helpers ── */
function currentData()  { return KPI_DATA[activeYear] || []; }
function allYears()     { return Object.keys(KPI_DATA).sort(); }

// Find same month in a different year
function comparePeriod(year) {
  const arr    = KPI_DATA[year];
  if (!arr) return null;
  const month  = KPI_DATA[activeYear][activeIndex].period.slice(5); // "MM-DD"
  return arr.find(d => d.period.slice(5) === month) || null;
}

/* ── Main Render ── */
function render() {
  renderYearTabs();
  renderCompareBtn();
  renderPeriodTabs();
  renderKpiCards();
  renderCharts();
  renderTable();
  updateTimestamp();
}

/* ── Year Tabs ── */
function renderYearTabs() {
  const container = document.getElementById('year-tabs');
  container.innerHTML = '';
  allYears().forEach(year => {
    const btn = document.createElement('button');
    btn.className = 'year-tab' + (year === activeYear ? ' active' : '');
    btn.textContent = year;
    btn.onclick = () => {
      activeYear  = year;
      activeIndex = KPI_DATA[year].length - 1;
      render();
    };
    container.appendChild(btn);
  });
}

/* ── Compare Button ── */
function renderCompareBtn() {
  const btn = document.getElementById('compare-btn');
  if (!btn) return;
  const years = allYears();
  // Only show if there are 2+ years
  btn.style.display = years.length >= 2 ? 'flex' : 'none';
  btn.classList.toggle('active', compareMode);
  btn.textContent = compareMode ? '✕ Vergleich aus' : '⇄ Vorjahresvergleich';
}

function toggleCompare() {
  compareMode = !compareMode;
  render();
}

/* ── Period Tabs ── */
function renderPeriodTabs() {
  const container = document.getElementById('period-tabs');
  container.innerHTML = '';
  currentData().forEach((entry, i) => {
    const btn = document.createElement('button');
    btn.className = 'period-tab' + (i === activeIndex ? ' active' : '');
    btn.textContent = entry.label;
    btn.onclick = () => { activeIndex = i; render(); };
    container.appendChild(btn);
  });
}

/* ── KPI Cards ── */
function renderKpiCards() {
  const data      = currentData();
  const current   = enrichKpis(data[activeIndex].kpis);
  const prevPer   = data[activeIndex - 1] ? enrichKpis(data[activeIndex - 1].kpis) : null;

  // YoY: same month last year
  const years     = allYears();
  const yearIdx   = years.indexOf(activeYear);
  const prevYear  = yearIdx > 0 ? years[yearIdx - 1] : null;
  const yoyEntry  = prevYear ? comparePeriod(prevYear) : null;
  const yoyKpis   = yoyEntry ? enrichKpis(yoyEntry.kpis) : null;

  const container = document.getElementById('kpi-grid');
  container.innerHTML = '';

  Object.keys(KPI_META).forEach(key => {
    const meta = KPI_META[key];
    const val  = current[key];
    if (val === undefined || val === null) return;

    // MoM trend
    const prevVal  = prevPer ? prevPer[key] : null;
    const deltaRaw = prevVal !== null ? val - prevVal : null;
    const deltaPct = (prevVal && prevVal !== 0) ? ((val - prevVal) / Math.abs(prevVal) * 100) : null;
    const betterUp = meta.trend === 'higher_better';
    let trendClass = 'neutral', trendIcon = '—';
    if (deltaRaw !== null && deltaRaw !== 0) {
      const isPos  = deltaRaw > 0;
      const isGood = betterUp ? isPos : !isPos;
      trendClass   = isGood ? 'up' : 'down';
      trendIcon    = isPos ? '↑' : '↓';
    }

    // YoY badge
    let yoyHtml = '';
    if (compareMode && yoyKpis) {
      const yoyVal = yoyKpis[key];
      if (yoyVal !== null && yoyVal !== undefined) {
        const diff    = val - yoyVal;
        const diffPct = yoyVal !== 0 ? (diff / Math.abs(yoyVal) * 100) : 0;
        const isGood  = betterUp ? diff > 0 : diff < 0;
        const cls     = isGood ? 'up' : 'down';
        const sign    = diff > 0 ? '+' : '';
        yoyHtml = `<div class="kpi-yoy ${cls}">
          vs. ${yoyEntry.label}: ${sign}${diffPct.toFixed(1)}%
        </div>`;
      }
    }

    const sparkData = currentData().slice(0, activeIndex + 1).map(d => enrichKpis(d.kpis)[key] ?? 0);

    const card = document.createElement('div');
    card.className = 'kpi-card';
    card.innerHTML = `
      <div class="kpi-card-top">
        <div class="kpi-icon-label">
          <span class="kpi-icon">${meta.icon}</span>
          <span class="kpi-label">${meta.label}</span>
        </div>
        ${deltaRaw !== null && deltaRaw !== 0 ? `
        <span class="kpi-trend ${trendClass}">
          ${trendIcon} ${deltaPct !== null ? Math.abs(deltaPct).toFixed(1) + '%' : ''}
        </span>` : '<span class="kpi-trend neutral">—</span>'}
      </div>
      <div class="kpi-value">${formatValue(val, meta)}</div>
      <svg class="kpi-sparkline" viewBox="0 0 200 40" preserveAspectRatio="none">
        ${buildSparkline(sparkData, trendClass)}
      </svg>
      ${yoyHtml}
      <div class="kpi-desc">${meta.description}</div>
    `;
    container.appendChild(card);
  });
}

/* ── Sparkline ── */
function buildSparkline(data, trendClass) {
  if (data.length < 2) return '';
  const min   = Math.min(...data);
  const max   = Math.max(...data);
  const range = max - min || 1;
  const pts   = data.map((v, i) => {
    const x = (i / (data.length - 1)) * 200;
    const y = 38 - ((v - min) / range) * 34;
    return `${x},${y}`;
  });
  const color    = trendClass === 'up' ? '#1a7a4a' : trendClass === 'down' ? '#c0392b' : '#aaaaaa';
  const polyline = pts.join(' ');
  const area     = `${pts[0].split(',')[0]},40 ${polyline} ${pts[pts.length-1].split(',')[0]},40`;
  const uid      = Math.random().toString(36).slice(2);
  return `
    <defs>
      <linearGradient id="sg${uid}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${color}" stop-opacity="0.25"/>
        <stop offset="100%" stop-color="${color}" stop-opacity="0"/>
      </linearGradient>
    </defs>
    <polygon points="${area}" fill="url(#sg${uid})"/>
    <polyline points="${polyline}" fill="none" stroke="${color}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="${pts[pts.length-1].split(',')[0]}" cy="${pts[pts.length-1].split(',')[1]}" r="3" fill="${color}"/>
  `;
}

/* ── Charts ── */
function renderCharts() {
  const container = document.getElementById('charts-grid');
  container.innerHTML = '';
  const chartKeys = ['traffic', 'conversion_rate', 'revenue', 'aov'];

  chartKeys.forEach(key => {
    if (!KPI_META[key]) return;
    const meta     = KPI_META[key];
    const curVals  = currentData().map((d, i) => ({ label: d.label, val: enrichKpis(d.kpis)[key] ?? 0, active: i === activeIndex }));

    // YoY overlay data
    const years   = allYears();
    const yearIdx = years.indexOf(activeYear);
    const prevYear = yearIdx > 0 ? years[yearIdx - 1] : null;
    const prevVals = (compareMode && prevYear)
      ? KPI_DATA[prevYear].map(d => ({ label: d.label, val: enrichKpis(d.kpis)[key] ?? 0 }))
      : null;

    const card = document.createElement('div');
    card.className = 'chart-card';
    card.innerHTML = `
      <div class="chart-card-title">${meta.icon} ${meta.label} – Verlauf ${activeYear}${compareMode && prevYear ? ` vs. ${prevYear}` : ''}</div>
      <div class="chart-area">${buildBarChart(curVals, prevVals, meta)}</div>
    `;
    container.appendChild(card);
  });
}

function buildBarChart(data, prevData, meta) {
  if (!data.length) return '';
  const W = 400, H = 160, padL = 46, padB = 22, padT = 10, padR = 10;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;

  const allVals = [...data.map(d => d.val), ...(prevData ? prevData.map(d => d.val) : [])].filter(v => v > 0);
  const max     = Math.max(...allVals) * 1.15 || 1;
  const n       = data.length;
  const slot    = innerW / n;
  const barW    = prevData ? Math.max(5, slot * 0.38) : Math.max(8, slot - 6);

  const bars = data.map((d, i) => {
    const bH = (d.val / max) * innerH;
    const x  = padL + i * slot + (prevData ? slot * 0.08 : (slot - barW) / 2);
    const y  = padT + innerH - bH;
    return `<rect x="${x}" y="${y}" width="${barW}" height="${bH}"
      fill="${d.active ? '#e8540a' : '#cccccc'}" rx="2" opacity="${d.active ? 1 : 0.6}"/>`;
  }).join('');

  let prevBars = '';
  if (prevData) {
    prevBars = prevData.slice(0, data.length).map((d, i) => {
      const bH = (d.val / max) * innerH;
      const x  = padL + i * slot + slot * 0.08 + barW + 2;
      const y  = padT + innerH - bH;
      return `<rect x="${x}" y="${y}" width="${barW}" height="${bH}"
        fill="#111111" rx="2" opacity="0.25"/>`;
    }).join('');
  }

  const ticks = [0, 0.5, 1].map(t => {
    const yPos = padT + innerH - t * innerH;
    const val  = t * max;
    return `
      <line x1="${padL}" y1="${yPos}" x2="${W-padR}" y2="${yPos}" stroke="#e8e8e8" stroke-width="1"/>
      <text x="${padL-5}" y="${yPos+4}" fill="#aaaaaa" font-size="9" text-anchor="end">${formatShort(val, meta)}</text>`;
  }).join('');

  const xLabels = data.map((d, i) => {
    if (n > 8 && i % 2 !== 0) return '';
    const x = padL + i * slot + slot / 2;
    const lbl = d.label.replace(/\s\d{2}$/, ''); // strip year suffix
    return `<text x="${x}" y="${H-4}" fill="#aaaaaa" font-size="8" text-anchor="middle">${lbl}</text>`;
  }).join('');

  // Legend if compare
  const legend = prevData ? `
    <rect x="${padL}" y="2" width="8" height="8" fill="#cccccc" rx="1"/>
    <text x="${padL+11}" y="10" fill="#888" font-size="8">${activeYear}</text>
    <rect x="${padL+42}" y="2" width="8" height="8" fill="#111111" rx="1" opacity="0.3"/>
    <text x="${padL+53}" y="10" fill="#888" font-size="8">${Object.keys(KPI_DATA).sort()[Object.keys(KPI_DATA).sort().indexOf(activeYear)-1]}</text>
  ` : '';

  return `<svg class="chart-svg" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
    ${ticks}${bars}${prevBars}${xLabels}${legend}
  </svg>`;
}

/* ── History Table ── */
function renderTable() {
  const thead   = document.getElementById('table-head');
  const tbody   = document.getElementById('table-body');
  const keys    = Object.keys(KPI_META);
  const sumKeys = ['traffic', 'revenue'];
  const avgKeys = ['conversion_rate', 'social_cr', 'aov', 'rps', 'cart_abandon', 'checkout_abandon', 'returning'];

  // Year filter tabs inside table
  const yearFilterHtml = allYears().map(y =>
    `<button class="table-year-btn${y === activeYear ? ' active' : ''}" onclick="switchTableYear('${y}')">${y}</button>`
  ).join('');

  document.getElementById('table-year-filter').innerHTML = yearFilterHtml;

  thead.innerHTML = `<tr>
    <th>Monat</th>
    ${keys.map(k => `<th>${KPI_META[k].label}</th>`).join('')}
  </tr>`;

  const data = currentData();

  const rows = data.map((entry, i) => {
    const enriched = enrichKpis(entry.kpis);
    const prev     = i > 0 ? enrichKpis(data[i-1].kpis) : null;

    // YoY compare
    const years    = allYears();
    const yearIdx  = years.indexOf(activeYear);
    const prevYear = yearIdx > 0 ? years[yearIdx - 1] : null;
    const yoyEntry = (compareMode && prevYear) ? comparePeriod(prevYear) : null;

    // temporarily set activeIndex to i to use comparePeriod correctly
    const savedIdx = activeIndex;
    activeIndex = i;
    const yoyE  = (compareMode && prevYear) ? comparePeriod(prevYear) : null;
    activeIndex = savedIdx;
    const yoyK  = yoyE ? enrichKpis(yoyE.kpis) : null;

    const cells = keys.map(key => {
      const val     = enriched[key];
      const prevVal = prev ? prev[key] : null;
      if (val === undefined || val === null) {
        // show YoY value in grey if available
        const yv = yoyK ? yoyK[key] : null;
        return `<td><span style="color:var(--text-faint)">–</span>${compareMode && yv !== null && yv !== undefined ? `<br/><span class="yoy-ref">${formatPlain(yv, KPI_META[key])}</span>` : ''}</td>`;
      }

      let deltaHtml = '';
      if (prevVal !== undefined && prevVal !== null) {
        const delta  = val - prevVal;
        const pct    = prevVal !== 0 ? (delta / Math.abs(prevVal) * 100) : 0;
        const better = KPI_META[key].trend === 'higher_better' ? delta > 0 : delta < 0;
        const cls    = better ? 'pos' : 'neg';
        const sign   = delta > 0 ? '+' : '';
        deltaHtml    = `<span class="delta ${cls}">${sign}${pct.toFixed(1)}%</span>`;
      }

      let yoyHtml = '';
      if (compareMode && yoyK) {
        const yv = yoyK[key];
        if (yv !== null && yv !== undefined) {
          const diff   = val - yv;
          const diffP  = yv !== 0 ? (diff / Math.abs(yv) * 100) : 0;
          const isGood = KPI_META[key].trend === 'higher_better' ? diff > 0 : diff < 0;
          const cls    = isGood ? 'pos' : 'neg';
          const sign   = diff > 0 ? '+' : '';
          yoyHtml = `<br/><span class="yoy-ref">${formatPlain(yv, KPI_META[key])} <span class="delta ${cls}">${sign}${diffP.toFixed(1)}%</span></span>`;
        }
      }

      return `<td>${formatValue(val, KPI_META[key])}${deltaHtml}${yoyHtml}</td>`;
    }).join('');

    const activeClass = i === activeIndex ? ' class="active-row"' : '';
    return `<tr${activeClass}><td class="period-cell">${entry.label}</td>${cells}</tr>`;
  }).join('');

  // Totals row
  const totalCells = keys.map(key => {
    const meta   = KPI_META[key];
    const values = data.map(d => enrichKpis(d.kpis)[key]).filter(v => v !== null && v !== undefined);
    if (!values.length) return `<td class="total-cell">–</td>`;
    let total;
    if (sumKeys.includes(key))      total = values.reduce((a,b) => a+b, 0);
    else if (avgKeys.includes(key)) total = values.reduce((a,b) => a+b, 0) / values.length;
    else return `<td class="total-cell">–</td>`;

    let yoyTotalHtml = '';
    if (compareMode) {
      const years   = allYears();
      const yi      = years.indexOf(activeYear);
      const py      = yi > 0 ? years[yi-1] : null;
      if (py) {
        const pyVals = KPI_DATA[py].map(d => enrichKpis(d.kpis)[key]).filter(v => v !== null && v !== undefined);
        if (pyVals.length) {
          let pyTotal;
          if (sumKeys.includes(key))      pyTotal = pyVals.reduce((a,b) => a+b, 0);
          else if (avgKeys.includes(key)) pyTotal = pyVals.reduce((a,b) => a+b, 0) / pyVals.length;
          if (pyTotal !== undefined) {
            const diff  = total - pyTotal;
            const diffP = pyTotal !== 0 ? (diff / Math.abs(pyTotal) * 100) : 0;
            const good  = meta.trend === 'higher_better' ? diff > 0 : diff < 0;
            const cls   = good ? 'pos' : 'neg';
            const sign  = diff > 0 ? '+' : '';
            yoyTotalHtml = `<br/><span class="yoy-ref" style="color:#aaa">${formatPlain(pyTotal, meta)} <span class="delta ${cls}">${sign}${diffP.toFixed(1)}%</span></span>`;
          }
        }
      }
    }

    return `<td class="total-cell">${formatValue(total, meta)}${yoyTotalHtml}</td>`;
  }).join('');

  tbody.innerHTML = rows + `
    <tr class="total-row">
      <td class="total-label">${activeYear} · Gesamt</td>
      ${totalCells}
    </tr>`;
}

function switchTableYear(year) {
  activeYear  = year;
  activeIndex = KPI_DATA[year].length - 1;
  render();
}

/* ── UI helpers ── */
function updateTimestamp() {
  const el = document.getElementById('last-updated');
  if (el) el.textContent = 'Stand: ' + new Date().toLocaleDateString('de-DE', {
    day: '2-digit', month: '2-digit', year: 'numeric'
  });
}

/* ── Auto-calculate derived KPIs ── */
function enrichKpis(kpis) {
  const k = Object.assign({}, kpis);
  if ((k.rps === null || k.rps === undefined) && k.revenue !== null && k.revenue !== undefined && k.traffic) {
    k.rps = k.revenue / k.traffic;
  }
  return k;
}

/* ── Formatters ── */
function formatValue(val, meta) {
  if (val === undefined || val === null) return '–';
  switch (meta.format) {
    case 'currency': return `<span class="unit-prefix">€</span>${val.toLocaleString('de-DE', {minimumFractionDigits:2, maximumFractionDigits:2})}`;
    case 'percent':  return `${val.toLocaleString('de-DE', {minimumFractionDigits:1, maximumFractionDigits:1})}<span class="unit">%</span>`;
    case 'number':   return val.toLocaleString('de-DE');
    case 'roas':     return `${val.toLocaleString('de-DE', {minimumFractionDigits:1, maximumFractionDigits:1})}<span class="unit">x</span>`;
    default:         return String(val);
  }
}

function formatPlain(val, meta) {
  if (val === undefined || val === null) return '–';
  switch (meta.format) {
    case 'currency': return `€${val.toLocaleString('de-DE', {minimumFractionDigits:2, maximumFractionDigits:2})}`;
    case 'percent':  return `${val.toLocaleString('de-DE', {minimumFractionDigits:1, maximumFractionDigits:1})}%`;
    case 'number':   return val.toLocaleString('de-DE');
    default:         return String(val);
  }
}

function formatShort(val, meta) {
  if (meta.format === 'currency') return '€' + (val >= 1000 ? (val/1000).toFixed(1)+'k' : val.toFixed(0));
  if (meta.format === 'percent')  return val.toFixed(1) + '%';
  if (val >= 1000000) return (val/1000000).toFixed(1) + 'M';
  if (val >= 1000)    return (val/1000).toFixed(1) + 'k';
  return val.toFixed(0);
}
