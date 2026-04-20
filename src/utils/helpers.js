// ============================================
// AeroStat — Helper Utilities
// ============================================

const Helpers = {
  /**
   * Format a population number into readable string
   */
  fmtPop(n) {
    if (!n) return 'N/A';
    if (n >= 1e9) return (n / 1e9).toFixed(2) + 'B';
    if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
    return n.toLocaleString();
  },

  /**
   * Format a GDP/monetary value
   */
  fmtMoney(n) {
    if (!n) return 'N/A';
    if (n >= 1e12) return '$' + (n / 1e12).toFixed(2) + 'T';
    if (n >= 1e9)  return '$' + (n / 1e9).toFixed(1) + 'B';
    if (n >= 1e6)  return '$' + (n / 1e6).toFixed(1) + 'M';
    return '$' + n.toLocaleString();
  },

  /**
   * Format area with km² suffix
   */
  fmtArea(n) {
    if (!n) return 'N/A';
    return n.toLocaleString() + ' km²';
  },

  /**
   * Format growth percentage with +/- sign
   */
  fmtGrowth(n) {
    if (n === null || n === undefined) return 'N/A';
    return (n > 0 ? '+' : '') + n.toFixed(2) + '%';
  },

  /**
   * Format GNI per capita
   */
  fmtGni(n) {
    if (!n) return 'N/A';
    return '$' + Math.round(n).toLocaleString();
  },

  /**
   * Format life expectancy
   */
  fmtLife(n) {
    if (!n) return 'N/A';
    return n.toFixed(1) + ' yrs';
  },

  /**
   * Convert lat/lng to Three.js Vector3 on sphere surface
   */
  ll3(lat, lng, r = 1, THREE) {
    const phi   = (90 - lat) * Math.PI / 180;
    const theta = (lng + 180) * Math.PI / 180;
    return new THREE.Vector3(
      -r * Math.sin(phi) * Math.cos(theta),
       r * Math.cos(phi),
       r * Math.sin(phi) * Math.sin(theta)
    );
  },

  /**
   * Find the nearest country to a lat/lng point
   */
  nearestCountry(lat, lng, countries, maxDist = 22) {
    let best = null, bestD = Infinity;
    for (const c of countries) {
      if (!c.latlng?.length) continue;
      const d = Math.hypot(c.latlng[0] - lat, c.latlng[1] - lng);
      if (d < bestD) { bestD = d; best = c; }
    }
    return bestD < maxDist ? best : null;
  },

  /**
   * Persist to localStorage safely
   */
  store(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) {}
  },

  /**
   * Load from localStorage safely
   */
  load(key, fallback = null) {
    try { return JSON.parse(localStorage.getItem(key) || 'null') ?? fallback; } catch (e) { return fallback; }
  },
};
