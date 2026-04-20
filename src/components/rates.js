// ============================================
// AeroStat — Exchange Rates Component
// ============================================

const Rates = (() => {
  const PAIRS = ['EUR','GBP','JPY','CNY','INR','AUD','CAD','CHF','SGD','MXN','BRL','KRW','ZAR','AED','SAR','NGN','EGP','PKR'];

  async function load(base = 'USD') {
    const el = document.getElementById('rates-grid');
    el.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:20px">
      <svg class="mini-spin" viewBox="0 0 16 16"><circle cx="8" cy="8" r="6"/></svg>
    </div>`;

    try {
      const data = await API.fetchRates(base);
      const rates = data.rates;
      const pairs = PAIRS.filter(k => k !== base && rates[k]);

      document.getElementById('rates-updated').textContent = `Updated: ${data.date} · Base: ${base}`;

      el.innerHTML = pairs.map(k => `
        <div class="ex-item">
          <div class="ex-pair">1 ${base} =</div>
          <div class="ex-rate">${rates[k].toFixed(4)}</div>
          <div style="font-size:11px;color:var(--muted);margin-top:2px">${k}</div>
        </div>`).join('');
    } catch (e) {
      el.innerHTML = `<div style="grid-column:1/-1;color:var(--red);font-size:12px;padding:12px">
        Failed to load exchange rates. Check your connection.
      </div>`;
    }
  }

  function setup() {
    document.getElementById('base-currency').addEventListener('change', e => load(e.target.value));
  }

  return { load, setup };
})();
