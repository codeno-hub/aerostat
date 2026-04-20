// ============================================
// AeroStat — Compare Component
// ============================================

const Compare = (() => {
  function render() {
    const countries = window.AeroStat?.countries || [];
    const compareList = window.AeroStat?.compareList || [];
    const cs = compareList.map(id => countries.find(c => c.cca3 === id)).filter(Boolean);
    const el = document.getElementById('cmp-list');

    if (!cs.length) {
      el.innerHTML = '<div style="text-align:center;padding:40px;color:var(--dim);font-size:13px">Search and add countries above to compare them.</div>';
      return;
    }

    el.innerHTML = `<div class="cmp-grid">${cs.map(c => `
      <div class="cmp-card">
        <div class="cmp-head">
          <div class="cmp-flag">${c.flags?.emoji || '🌐'}</div>
          <div>
            <div class="cmp-cname">${c.name?.common}</div>
            <div class="cmp-region">${c.subregion || c.region || ''}</div>
          </div>
        </div>
        <div class="cmp-stats">
          <div class="cs">
            <div class="cs-l">Population</div>
            <div class="cs-v">${Helpers.fmtPop(c.population)}</div>
          </div>
          <div class="cs">
            <div class="cs-l">Area</div>
            <div class="cs-v">${c.area ? c.area.toLocaleString() + ' km²' : 'N/A'}</div>
          </div>
          <div class="cs">
            <div class="cs-l">Capital</div>
            <div class="cs-v">${c.capital?.[0] || 'N/A'}</div>
          </div>
          <div class="cs">
            <div class="cs-l">Region</div>
            <div class="cs-v">${c.region || 'N/A'}</div>
          </div>
        </div>
        <button class="rm-btn" data-id="${c.cca3}">✕ Remove</button>
      </div>`).join('')}</div>`;

    el.querySelectorAll('.rm-btn').forEach(b => {
      b.addEventListener('click', () => {
        window.AeroStat.compareList = window.AeroStat.compareList.filter(x => x !== b.dataset.id);
        Helpers.store('aerostat_cmp', window.AeroStat.compareList);
        render();
      });
    });
  }

  function setupSearch() {
    const inp = document.getElementById('cmp-input');
    const ac = document.getElementById('cmp-autocomplete');

    inp.addEventListener('input', () => {
      const q = inp.value.trim().toLowerCase();
      const countries = window.AeroStat?.countries || [];
      if (q.length < 1) { ac.style.display = 'none'; return; }

      const res = countries.filter(c =>
        c.name?.common?.toLowerCase().includes(q) ||
        c.cca3?.toLowerCase().includes(q)
      ).slice(0, 6);

      if (!res.length) { ac.style.display = 'none'; return; }

      ac.innerHTML = res.map((c, i) => `
        <div class="ac-item" data-idx="${i}">
          <span class="ac-flag">${c.flags?.emoji || '🌐'}</span>
          <div>
            <div class="ac-name">${c.name?.common}</div>
            <div class="ac-sub">${c.capital?.[0] || ''} · ${c.region || ''}</div>
          </div>
        </div>`).join('');

      ac.style.display = 'block';

      ac.querySelectorAll('.ac-item').forEach((el, i) => {
        el.addEventListener('click', () => {
          const cmp = window.AeroStat.compareList;
          if (!cmp.includes(res[i].cca3)) {
            if (cmp.length >= 4) { alert('Max 4 countries. Remove one first.'); return; }
            cmp.push(res[i].cca3);
            Helpers.store('aerostat_cmp', cmp);
          }
          inp.value = '';
          ac.style.display = 'none';
          render();
        });
      });
    });

    document.addEventListener('click', e => {
      if (!e.target.closest('#search-wrap-cmp')) ac.style.display = 'none';
    });
  }

  return { render, setupSearch };
})();
