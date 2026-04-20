// ============================================
// AeroStat — Side Panel Component
// ============================================

const Panel = (() => {
  let panelChart = null;

  function open(country) {
    const panel = document.getElementById('side-panel');
    document.getElementById('p-flag').textContent = country.flags?.emoji || '🌐';
    document.getElementById('p-name').textContent = country.name?.common || '';
    document.getElementById('p-official').textContent = country.name?.official || '';

    const tags = document.getElementById('p-tags');
    tags.innerHTML = `
      <span class="tag iso">${country.cca3}</span>
      ${country.region ? `<span class="tag">${country.region}</span>` : ''}
      ${country.subregion ? `<span class="tag">${country.subregion}</span>` : ''}
    `;

    panel.classList.add('open');
    document.getElementById('panel-body').innerHTML = `
      <div style="display:flex;align-items:center;justify-content:center;padding:30px;flex-direction:column;gap:10px">
        <svg class="mini-spin" viewBox="0 0 16 16"><circle cx="8" cy="8" r="6"/></svg>
        <span style="font-size:11px;color:var(--dim)">Fetching live data…</span>
      </div>`;

    _loadData(country);
  }

  function close() {
    document.getElementById('side-panel').classList.remove('open');
    if (panelChart) { panelChart.destroy(); panelChart = null; }
  }

  async function _loadData(c) {
    let stats = { gdp: null, growth: null, life: null, gni: null, gdpHist: null, inflHist: null };
    try {
      stats = await API.fetchCountryStats(c.cca2);
    } catch (e) {
      console.warn('World Bank fetch failed', e);
    }

    const { gdp, growth, life, gni, gdpHist, inflHist } = stats;
    const pop = c.population;
    const area = c.area;
    const curs = c.currencies || {};
    const ck = Object.keys(curs)[0];
    const cur = ck ? curs[ck] : null;
    const langs = c.languages ? Object.values(c.languages).join(', ') : 'N/A';

    const fmtPop = Helpers.fmtPop(pop);
    const fmtArea = Helpers.fmtArea(area);
    const fmtGdp = Helpers.fmtMoney(gdp);
    const fmtGrw = Helpers.fmtGrowth(growth);
    const fmtGni = Helpers.fmtGni(gni);
    const fmtLife = Helpers.fmtLife(life);
    const grwCls = growth ? (growth > 0 ? 'pos' : 'neg') : '';
    const isFav = (window.AeroStat?.favorites || []).includes(c.cca3);

    document.getElementById('panel-body').innerHTML = `
      <div style="display:flex;gap:2px;margin-bottom:14px;background:rgba(255,255,255,0.03);border-radius:8px;padding:3px">
        <button class="ptab active" data-t="overview">Overview</button>
        <button class="ptab" data-t="charts">Charts</button>
        <button class="ptab" data-t="details">Details</button>
      </div>

      <div id="ptab-overview">
        <div class="stat-grid">
          <div class="stat-card"><div class="stat-label">Population</div><div class="stat-value">${fmtPop}</div></div>
          <div class="stat-card"><div class="stat-label">Area</div><div class="stat-value" style="font-size:15px">${fmtArea}</div></div>
          <div class="stat-card hl"><div class="stat-label">GDP</div><div class="stat-value">${fmtGdp}</div><div class="stat-sub">World Bank</div></div>
          <div class="stat-card hl"><div class="stat-label">GDP Growth</div><div class="stat-value ${grwCls}">${fmtGrw}</div></div>
          <div class="stat-card"><div class="stat-label">GNI / Capita</div><div class="stat-value" style="font-size:15px">${fmtGni}</div></div>
          <div class="stat-card"><div class="stat-label">Life Expectancy</div><div class="stat-value" style="font-size:15px">${fmtLife}</div></div>
        </div>
        ${cur ? `
          <div class="sec-title">Currency</div>
          <div class="cur-card">
            <div class="cur-sym">${cur.symbol || ck}</div>
            <div><div class="cur-name">${cur.name}</div><div class="cur-rate">Code: ${ck}</div></div>
          </div>` : ''}
        <button class="fav-btn ${isFav ? 'saved' : ''}" id="fav-toggle">${isFav ? '★ Saved to favorites' : '☆ Save to favorites'}</button>
        <button class="fav-btn" id="add-compare" style="margin-top:6px">＋ Add to Compare</button>
      </div>

      <div id="ptab-charts" style="display:none">
        <div class="chart-tabs">
          <button class="ctab active" data-m="GDP">GDP</button>
          <button class="ctab" data-m="Growth">Growth %</button>
          <button class="ctab" data-m="Inflation">Inflation</button>
        </div>
        <div class="chart-wrap"><canvas id="panel-chart-cvs"></canvas></div>
        <div class="chart-label" id="chart-desc">GDP (USD) — last 10 years</div>
      </div>

      <div id="ptab-details" style="display:none">
        <div class="info-row"><span class="info-key">Capital</span><span class="info-val">${c.capital?.[0] || 'N/A'}</span></div>
        <div class="info-row"><span class="info-key">Languages</span><span class="info-val">${langs}</span></div>
        <div class="info-row"><span class="info-key">Timezone</span><span class="info-val">${c.timezones?.[0] || 'N/A'}</span></div>
        <div class="info-row"><span class="info-key">ISO Codes</span><span class="info-val">${c.cca3} / ${c.cca2}</span></div>
        <div class="info-row"><span class="info-key">Continent</span><span class="info-val">${c.continents?.[0] || 'N/A'}</span></div>
        <div class="info-row"><span class="info-key">Independent</span><span class="info-val">${c.independent ? 'Yes' : 'No'}</span></div>
        ${c.borders?.length ? `<div class="info-row"><span class="info-key">Borders</span><span class="info-val">${c.borders.slice(0, 6).join(', ')}${c.borders.length > 6 ? '…' : ''}</span></div>` : ''}
      </div>`;

    _setupPanelTabs({ gdpHist, inflHist });
    _setupFavBtn(c);
    _setupAddCompare(c);
  }

  function _setupPanelTabs(chartData) {
    document.querySelectorAll('.ptab').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.ptab').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        ['overview', 'charts', 'details'].forEach(t => {
          document.getElementById('ptab-' + t).style.display = btn.dataset.t === t ? '' : 'none';
        });
        if (btn.dataset.t === 'charts') _renderChart(chartData, 'GDP');
      });
    });

    document.querySelectorAll('.ctab').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.ctab').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        _renderChart(chartData, btn.dataset.m);
      });
    });
  }

  function _renderChart(data, metric) {
    if (panelChart) { panelChart.destroy(); panelChart = null; }
    const cvs = document.getElementById('panel-chart-cvs');
    if (!cvs) return;

    let pts = [], label = '';

    if (metric === 'GDP' && data.gdpHist?.length) {
      pts = data.gdpHist.map(d => ({ x: d.date, y: +(d.value / 1e9).toFixed(2) }));
      label = 'GDP (USD Billions)';
    } else if (metric === 'Growth' && data.gdpHist?.length) {
      const h = data.gdpHist;
      for (let i = 1; i < h.length; i++) {
        if (h[i - 1].value && h[i].value) {
          const g = (h[i].value - h[i - 1].value) / h[i - 1].value * 100;
          pts.push({ x: h[i].date, y: parseFloat(g.toFixed(2)) });
        }
      }
      label = 'GDP Growth (%)';
    } else if (metric === 'Inflation' && data.inflHist?.length) {
      pts = data.inflHist.map(d => ({ x: d.date, y: parseFloat(d.value.toFixed(2)) }));
      label = 'Inflation Rate (%)';
    }

    document.getElementById('chart-desc').textContent = label;

    if (!pts.length) {
      cvs.style.display = 'none';
      cvs.insertAdjacentHTML('afterend', '<div style="text-align:center;padding:20px;font-size:12px;color:var(--dim)">No historical data available</div>');
      return;
    }

    cvs.style.display = '';
    panelChart = new Chart(cvs, {
      type: 'line',
      data: {
        labels: pts.map(p => p.x),
        datasets: [{
          data: pts.map(p => p.y),
          borderColor: '#7dd3fc',
          backgroundColor: 'rgba(125,211,252,0.08)',
          borderWidth: 2,
          pointRadius: 3,
          pointBackgroundColor: '#7dd3fc',
          tension: 0.35,
          fill: true,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(17,18,20,0.95)',
            titleColor: '#f5f5f5',
            bodyColor: '#9ca3af',
            borderColor: 'rgba(255,255,255,0.1)',
            borderWidth: 1,
          }
        },
        scales: {
          x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#6b7280', font: { size: 10 }, maxTicksLimit: 6 } },
          y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#6b7280', font: { size: 10 }, maxTicksLimit: 5 } }
        }
      }
    });
  }

  function _setupFavBtn(c) {
    document.getElementById('fav-toggle').addEventListener('click', () => {
      const favs = window.AeroStat.favorites;
      const idx = favs.indexOf(c.cca3);
      if (idx >= 0) favs.splice(idx, 1); else favs.push(c.cca3);
      Helpers.store('aerostat_favs', favs);
      const btn = document.getElementById('fav-toggle');
      const is = favs.includes(c.cca3);
      btn.className = 'fav-btn' + (is ? ' saved' : '');
      btn.textContent = is ? '★ Saved to favorites' : '☆ Save to favorites';
    });
  }

  function _setupAddCompare(c) {
    document.getElementById('add-compare').addEventListener('click', () => {
      const cmp = window.AeroStat.compareList;
      if (!cmp.includes(c.cca3)) {
        if (cmp.length >= 4) { alert('Max 4 countries. Remove one first.'); return; }
        cmp.push(c.cca3);
        Helpers.store('aerostat_cmp', cmp);
      }
      AeroStat.openOverlay('compare');
      Compare.render();
    });
  }

  return { open, close };
})();
