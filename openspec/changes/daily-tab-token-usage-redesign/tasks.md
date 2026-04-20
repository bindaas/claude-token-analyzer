## 1. Tab Rename

- [x] 1.1 Find the "Daily" tab label in `public/index.html` and rename it to "Token Usage"
- [x] 1.2 Update any JS references (e.g., `activeTab === 'daily'`) to match the new tab ID if the ID also changes, or confirm the internal ID stays as-is while only the label changes

## 2. Daily Chart — Grouped Bars (21 days)

- [x] 2.1 Locate the daily stacked bar chart rendering function in `public/index.html`
- [x] 2.2 Change the data window from 6 days to 21 days (last 21 calendar days)
- [x] 2.3 Rewrite the bar rendering loop from stacked mode to grouped mode: calculate bar width and X offset so 5 bars fit side-by-side within each day slot
- [x] 2.4 Define 5 colors: input (blue), cache write (yellow), cache read (green), output (purple), cost (orange) — extract as named constants for reuse
- [x] 2.5 Add a secondary (right-side) Y-axis scaled to max daily cost; render the cost bar using this scale
- [x] 2.6 Label the left Y-axis (tokens) and right Y-axis (cost in $)
- [x] 2.7 Add a legend identifying the 5 bar types and their colors

## 3. Remove Standalone Daily Cost Chart

- [x] 3.1 Locate the separate daily cost bar chart element/canvas in `public/index.html`
- [x] 3.2 Remove the HTML element and any associated rendering code
- [x] 3.3 Verify no JS errors remain after removal (no dangling references to the removed element)

## 4. Weekly Aggregated Chart (12 weeks)

- [x] 4.1 Write a client-side aggregation function that groups per-day data into ISO weeks, summing input tokens, cache write tokens, cache read tokens, output tokens, and cost per week
- [x] 4.2 Slice the result to the most recent 12 weeks
- [x] 4.3 Add a new canvas element below the daily chart in the Token Usage tab HTML, preceded by a "Weekly Token Usage" section heading
- [x] 4.4 Implement a grouped bar chart renderer for the weekly chart (5 bars per week slot, same color constants as the daily chart)
- [x] 4.5 Add a secondary (right-side) Y-axis for weekly cost, scaled to max weekly cost value
- [x] 4.6 Wire the weekly chart into the tab's render/init cycle so it draws on tab activation and on data load

## 5. Regression Check

- [x] 5.1 Visually verify all other tabs (Overview, Weekly Trend, By Project, Insights, etc.) still render correctly
- [x] 5.2 Verify the Token Usage tab renders correctly at narrow viewport widths (check bar density at ~768px wide)
- [x] 5.3 Confirm no JS console errors on page load or tab switch

## Assumptions

| Assumption | Where to verify |
|---|---|
| The daily stacked chart is rendered by a single named function (e.g., `renderDailyChart`) | Search `public/index.html` for `renderDaily` or `daily` near `canvas` |
| Per-day data is available as an array keyed by date in the API response (e.g., `data.daily` or similar) | Inspect `/api/data` response shape; check `server.js` for the field name |
| The existing canvas chart helper supports independent bar width/offset math (not hardcoded for stacked mode) | Read the chart helper or draw loop in `public/index.html` |
| The standalone cost chart has a distinct HTML id or variable name making it easy to isolate | Search `public/index.html` for `cost` near `canvas` or `chart` |
| Tab switching is handled by a single `activeTab` or similar variable — renaming the label won't break routing | Search for the tab click handler and tab ID references in `public/index.html` |
