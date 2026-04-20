# AeroStat — Geographic Intelligence Platform

A premium 3D geographic intelligence platform with live country data, rankings, exchange rates, and historical charts.

![AeroStat Preview](https://i.imgur.com/placeholder.png)

## Features

- **3D Interactive Globe** — Three.js powered, drag/zoom/spin with smooth physics
- **Country Data Panel** — Live stats from REST Countries + World Bank APIs
- **Historical Charts** — GDP, Growth %, and Inflation trends via Chart.js
- **Rankings Dashboard** — Top 50 countries by population, area, or density
- **Compare Mode** — Side-by-side comparison of up to 4 countries
- **Live Exchange Rates** — Real ECB data via Frankfurter API
- **Heatmap Mode** — Population density visualization on globe
- **Persistent Favorites** — Saved to localStorage

## Tech Stack

| Layer     | Technology                        |
|-----------|-----------------------------------|
| Globe     | Three.js r128                     |
| Charts    | Chart.js 4.4                      |
| Data      | REST Countries API                |
| Economics | World Bank API                    |
| Rates     | Frankfurter (ECB) API             |
| Fonts     | DM Sans + DM Mono (Google Fonts)  |
| Styling   | Vanilla CSS with CSS Variables    |
| Storage   | localStorage                      |

## Quick Start

No build step needed — this is a static HTML app.

### Option 1: Open directly
Just open `index.html` in your browser. Note: some browsers block cross-origin API calls for `file://` URLs.

### Option 2: Local server (recommended)

Using Python:
```bash
cd aerostat
python3 -m http.server 3000
# Visit http://localhost:3000
```

Using Node.js:
```bash
cd aerostat
npx serve .
# Visit http://localhost:3000
```

Using VS Code: Install the **Live Server** extension and click "Go Live".

## Project Structure

```
aerostat/
├── index.html                  # Entry point
├── README.md
└── src/
    ├── styles/
    │   └── main.css            # All styles + CSS variables
    ├── utils/
    │   ├── helpers.js          # Formatting & utility functions
    │   └── api.js              # API layer (REST Countries, World Bank, Frankfurter)
    └── components/
        ├── globe.js            # Three.js globe, heatmap, rotation
        ├── panel.js            # Country side panel + charts
        ├── rankings.js         # Rankings overlay
        ├── compare.js          # Compare overlay + search
        ├── rates.js            # Exchange rates overlay
        ├── search.js           # Navbar search autocomplete
        └── app.js              # Main orchestrator
```

## APIs Used

| API | Purpose | Docs |
|-----|---------|------|
| [REST Countries](https://restcountries.com) | Country info, flags, population | Free, no key needed |
| [World Bank](https://datahelpdesk.worldbank.org/knowledgebase/topics/125589) | GDP, growth, life expectancy | Free, no key needed |
| [Frankfurter](https://www.frankfurter.app) | Live exchange rates (ECB) | Free, no key needed |

## Roadmap / Next Phases

- [ ] Firebase Auth (sign up, Google login, persistent favorites across devices)
- [ ] State/province drilldown for India, USA, etc. using GeoJSON
- [ ] Full GDP rankings from World Bank (requires caching layer)
- [ ] Dark/light theme toggle
- [ ] Mobile responsive layout
- [ ] PWA support (offline mode)

## Design System

Colors are defined as CSS variables in `src/styles/main.css`:

```css
--bg: #050505        /* Page background */
--surface: #0b0b0c   /* Surface cards */
--panel: #111214     /* Panel background */
--border: rgba(255,255,255,0.06)
--text: #f5f5f5      /* Primary text */
--muted: #9ca3af     /* Secondary text */
--dim: #6b7280       /* Tertiary text */
--accent: #7dd3fc    /* Blue accent */
--green: #34d399     /* Positive values */
--red: #f87171       /* Negative values */
--amber: #fbbf24     /* Favorites */
```

## License

MIT — Free to use and modify.
