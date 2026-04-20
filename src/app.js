// ============================================
// AeroStat — Main App
// ============================================

window.AeroStat = {
  countries: [],
  favorites: Helpers.load('aerostat_favs', []),
  compareList: Helpers.load('aerostat_cmp', []),
  currentCountry: null,

  async init() {
    // Init globe
    Globe.init(document.getElementById('globe-container'), country => {
      this.selectCountry(country);
    });

    // Fetch countries
    try {
      this.countries = await API.fetchAllCountries();
      document.getElementById('country-count').textContent = `${this.countries.length} countries`;
    } catch (e) {
      document.getElementById('country-count').textContent = 'Offline mode';
      console.error('Failed to load countries:', e);
    }

    // Setup components
    Search.setup();
    Compare.setupSearch();
    Rates.setup();

    // Nav tab listeners
    document.querySelectorAll('[data-view]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('[data-view]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const v = btn.dataset.view;
        if (v === 'rankings') { this.openOverlay('rankings'); Rankings.render(); }
        else if (v === 'compare') { this.openOverlay('compare'); Compare.render(); }
        else if (v === 'rates') { this.openOverlay('rates'); Rates.load(); }
        else { this.closeAllOverlays(); }
      });
    });

    // Heatmap toggle
    document.getElementById('heatmap-btn').addEventListener('click', () => {
      const active = Globe.toggleHeatmap(this.countries);
      document.getElementById('heatmap-btn').classList.toggle('active', active);
    });

    // Close panel
    document.getElementById('close-panel').addEventListener('click', () => {
      Panel.close();
      this.currentCountry = null;
    });

    // Hide loading screen
    setTimeout(() => {
      const ld = document.getElementById('loading');
      ld.style.transition = 'opacity .5s';
      ld.style.opacity = '0';
      setTimeout(() => ld.style.display = 'none', 500);
    }, 800);
  },

  selectCountry(country) {
    this.currentCountry = country;
    document.getElementById('tooltip').style.display = 'none';
    if (country.latlng?.length >= 2) {
      Globe.spinTo(country.latlng[0], country.latlng[1]);
    }
    Panel.open(country);
  },

  openOverlay(name) {
    this.closeAllOverlays();
    document.getElementById('ov-' + name).classList.add('show');
  },

  closeOverlay(name) {
    document.getElementById('ov-' + name).classList.remove('show');
    document.querySelectorAll('[data-view]').forEach(b => b.classList.remove('active'));
    document.querySelector('[data-view="globe"]')?.classList.add('active');
  },

  closeAllOverlays() {
    ['rankings', 'compare', 'rates'].forEach(n => {
      document.getElementById('ov-' + n).classList.remove('show');
    });
  },
};

// Start the app
AeroStat.init();
