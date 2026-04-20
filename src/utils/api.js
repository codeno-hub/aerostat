// ============================================
// AeroStat — API Layer
// ============================================

const API = {
  REST_COUNTRIES: 'https://restcountries.com/v3.1/all?fields=name,cca3,cca2,capital,population,area,region,subregion,currencies,flags,latlng,languages,continents,timezones,borders,independent',
  WORLD_BANK: 'https://api.worldbank.org/v2/country',
  FRANKFURTER: 'https://api.frankfurter.app/latest?from=',

  /**
   * Fetch all countries from REST Countries API
   */
  async fetchAllCountries() {
    const res = await fetch(this.REST_COUNTRIES);
    if (!res.ok) throw new Error('Failed to fetch countries');
    return res.json();
  },

  /**
   * Fetch a World Bank indicator for a country
   * @param {string} iso2 - 2-letter country code
   * @param {string} indicator - World Bank indicator code
   * @param {number} mrv - Most recent values count
   */
  async fetchWBIndicator(iso2, indicator, mrv = 1) {
    const url = `${this.WORLD_BANK}/${iso2}/indicator/${indicator}?format=json&mrv=${mrv}`;
    const res = await fetch(url);
    const data = await res.json();
    return data[1] || [];
  },

  /**
   * Fetch all relevant World Bank data for a country panel
   */
  async fetchCountryStats(iso2) {
    const indicators = {
      gdp:      'NY.GDP.MKTP.CD',
      gdpGrowth:'NY.GDP.MKTP.KD.ZG',
      life:     'SP.DYN.LE00.IN',
      gni:      'NY.GNP.PCAP.CD',
      gdpHist:  'NY.GDP.MKTP.CD',
      inflation:'FP.CPI.TOTL.ZG',
    };

    const [r1, r2, r3, r4, r5, r6] = await Promise.all([
      fetch(`${this.WORLD_BANK}/${iso2}/indicator/${indicators.gdp}?format=json&mrv=1`),
      fetch(`${this.WORLD_BANK}/${iso2}/indicator/${indicators.gdpGrowth}?format=json&mrv=5`),
      fetch(`${this.WORLD_BANK}/${iso2}/indicator/${indicators.life}?format=json&mrv=1`),
      fetch(`${this.WORLD_BANK}/${iso2}/indicator/${indicators.gni}?format=json&mrv=1`),
      fetch(`${this.WORLD_BANK}/${iso2}/indicator/${indicators.gdpHist}?format=json&mrv=10`),
      fetch(`${this.WORLD_BANK}/${iso2}/indicator/${indicators.inflation}?format=json&mrv=5`),
    ]);

    const [d1, d2, d3, d4, d5, d6] = await Promise.all([
      r1.json(), r2.json(), r3.json(), r4.json(), r5.json(), r6.json()
    ]);

    return {
      gdp:      d1[1]?.[0]?.value ?? null,
      growth:   d2[1]?.[0]?.value ?? null,
      life:     d3[1]?.[0]?.value ?? null,
      gni:      d4[1]?.[0]?.value ?? null,
      gdpHist:  (d5[1] || []).filter(x => x.value).reverse(),
      inflHist: (d6[1] || []).filter(x => x.value).reverse(),
    };
  },

  /**
   * Fetch live exchange rates from Frankfurter (ECB data)
   */
  async fetchRates(base = 'USD') {
    const res = await fetch(`${this.FRANKFURTER}${base}`);
    if (!res.ok) throw new Error('Failed to fetch rates');
    return res.json();
  },
};
