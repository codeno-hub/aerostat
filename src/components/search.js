// ============================================
// AeroStat — Search Component
// ============================================

const Search = (() => {
  function setup() {
    const inp = document.getElementById('search-input');
    const ac = document.getElementById('autocomplete');
    let idx = -1;

    inp.addEventListener('input', () => {
      const q = inp.value.trim().toLowerCase();
      const countries = window.AeroStat?.countries || [];
      if (q.length < 1) { ac.style.display = 'none'; return; }

      const results = countries.filter(c =>
        c.name?.common?.toLowerCase().includes(q) ||
        c.name?.official?.toLowerCase().includes(q) ||
        c.cca3?.toLowerCase().includes(q) ||
        c.cca2?.toLowerCase().includes(q) ||
        c.capital?.[0]?.toLowerCase().includes(q)
      ).slice(0, 8);

      if (!results.length) { ac.style.display = 'none'; return; }

      ac.innerHTML = results.map((c, i) => `
        <div class="ac-item" data-idx="${i}">
          <span class="ac-flag">${c.flags?.emoji || '🌐'}</span>
          <div>
            <div class="ac-name">${c.name?.common}</div>
            <div class="ac-sub">${c.capital?.[0] || ''} · ${c.region || ''}</div>
          </div>
        </div>`).join('');

      ac.style.display = 'block';
      idx = -1;

      ac.querySelectorAll('.ac-item').forEach((el, i) => {
        el.addEventListener('click', () => {
          AeroStat.selectCountry(results[i]);
          inp.value = results[i].name?.common || '';
          ac.style.display = 'none';
        });
      });
    });

    inp.addEventListener('keydown', e => {
      const items = ac.querySelectorAll('.ac-item');
      if (e.key === 'ArrowDown') idx = Math.min(idx + 1, items.length - 1);
      else if (e.key === 'ArrowUp') idx = Math.max(idx - 1, 0);
      else if (e.key === 'Enter' && idx >= 0) { items[idx].click(); return; }
      else if (e.key === 'Escape') { ac.style.display = 'none'; return; }
      items.forEach((el, i) => el.classList.toggle('sel', i === idx));
    });

    document.addEventListener('click', e => {
      if (!e.target.closest('#search-wrap')) ac.style.display = 'none';
    });
  }

  return { setup };
})();
