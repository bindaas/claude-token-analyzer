## Context

The frontend is a single `public/index.html` (~1400 lines) with vanilla JS and a Canvas-based chart renderer. The current Daily tab renders:
1. A stacked bar chart (input / cache write / cache read / output) over the last 6 days
2. A separate cost bar chart below it for the last 20 days

All data comes from a single `GET /api/data` call at page load. No server changes are needed — daily token arrays and cost values are already present in the response.

## Goals / Non-Goals

**Goals:**
- Switch daily chart from stacked to grouped (4+1 bars per day)
- Expand daily window from 6 days → 21 days
- Eliminate the standalone cost bar chart; fold cost in as the 5th bar on the daily chart
- Add a weekly aggregated grouped bar chart (12 weeks, same 5 metrics) below the daily chart
- Rename tab label from "Daily" to "Token Usage"

**Non-Goals:**
- No server/API changes
- No changes to other tabs or charts
- No new data collection or pricing recalculation

## Decisions

**D1 — Grouped bars using existing canvas renderer**
The project uses a lightweight canvas chart helper already present in `index.html`. Rather than introducing a library, reuse the same pattern already used in the daily/weekly charts, adjusting bar layout math to render N grouped bars per day-slot instead of stacked segments.

*Alternative considered:* Chart.js or similar — rejected to preserve zero-dependency constraint.

**D2 — Cost bar uses secondary scale**
Token counts (potentially millions) and dollar cost (cents–dollars) are on incompatible scales. The cost bar will be rendered using a secondary Y-axis (right side) or normalized to a display scale alongside an annotation, so it is visually comparable without distorting the token bars.

*Alternative considered:* Separate cost row below each group — adds visual noise, rejected.

**D3 — Weekly data aggregated client-side**
Weekly totals are derived by grouping the existing per-day data by ISO week in the frontend. No new API field needed.

*Alternative considered:* New `/api/weekly` endpoint — unnecessary overhead given data is already client-side.

**D4 — 5 colors, consistent across both charts**
Use 5 distinct colors (e.g., input=blue, cache-write=yellow, cache-read=green, output=purple, cost=red/orange) shared between daily and weekly charts for visual consistency.

## Risks / Trade-offs

- **Canvas layout density**: 21 days × 5 bars = 105 bar slots. At narrow viewport widths, bars may become very thin. Mitigation: set a minimum canvas width or add horizontal scroll on small screens.
- **Dual Y-axis complexity**: secondary axis for cost requires extra canvas math. Mitigation: keep it simple — label right axis, draw cost bars last so they visually overlay but use their own scale.
- **Regression on other charts**: touching the canvas helper or shared chart utilities could affect other tabs. Mitigation: scope changes to daily-tab rendering functions only; verify other charts render after implementation.
