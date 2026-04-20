// ============================================
// AeroStat — Rankings Component
// ============================================

const Rankings = (() => {
  let currentMetric = 'population';

  const METRICS = [
    {
      id: 'population',
      label: 'Population',
      fn: c => c.population || 0,
      fmt: v => v >= 1e9 ? (v / 1e9).toFixed(2) + 'B' : v >= 1e6 ? (v / 1e6).toFixed(1) + 'M' : v.toLocaleString(),
    },
    {
      id: 'area',
      label: 'Area',
      fn: c => c.area || 0,
      fmt: v => v.toLocaleString() + ' km²',
    },
    {
      id: 'density',
      label: 'Pop. Density',
      fn: c => (c.population && c.area) ? c.population / c.area : 0,
      fmt: v => v.toFixed(1) + '/km²',
    },
  ];

  function render() {
    _buildFilters();
    _renderList();
  }

  function _buildFilters() {
    const fc = document.getElementById('rank-filters');
    if (fc.children.length) return; // already built

    METRICS.forEach(m => {
      const b = document.createElement('button');
      b.className = 'rf' + (m.id === currentMetric ? ' active' : '');
      b.textContent = m.label;
      b.dataset.m = m.id;
      b.addEventListener('click', () => {
        currentMetric = m.id;
        document.querySelectorAll('.rf').forEach(x => x.classList.toggle('active', x.dataset.m === m.id));
        _renderList();
      });
      fc.appendChild(b);
    });
  }

  function _renderList() {
    const countries = window.AeroStat?.countries || [];
    const met = METRICS.find(m => m.id === currentMetric);
    if (!met || !countries.length) return;

    const sorted = [...countries]
      .filter(c => met.fn(c) > 0)
      .sort((a, b) => met.fn(b) - met.fn(a))
      .slice(0, 50);

    const max = met.fn(sorted[0]);
    const el = document.getElementById('rank-list');

    el.innerHTML = sorted.map((c, i) => {
      const val = met.fn(c);
      const pct = Math.round(val / max * 100);
      const numCls = i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : '';
      return `
        <div class="rank-item" data-cca3="${c.cca3}">
          <div class="rank-num ${numCls}">${i + 1}</div>
          <div class="rank-flag">${c.flags?.emoji || '🌐'}</div>
          <div class="rank-info">
            <div class="rank-name">${c.name?.common || ''}</div>
            <div class="rank-detail">${c.region || ''}</div>
          </div>
          <div class="rank-bar-wrap">
            <div class="rank-bar-bg"><div class="rank-bar-fill" style="width:${pct}%"></div></div>
            <div class="rank-val">${met.fmt(val)}</div>
          </div>
        </div>`;
    }).join('');

    el.querySelectorAll('.rank-item').forEach(el => {
      el.addEventListener('click', () => {
        const c = countries.find(x => x.cca3 === el.dataset.cca3);
        if (c) {
          AeroStat.closeOverlay('rankings');
          AeroStat.selectCountry(c);
        }
      });
    });
  }

  return { render };
})();
