## Why

The current Daily tab presents token data as a stacked bar chart over 6 days with a separate cost bar chart below it. This layout is too narrow in time window and merges token types visually, making it hard to compare individual token categories across days. The rename to "Token Usage" better reflects the tab's purpose.

## What Changes

- Rename the "Daily" tab to **Token Usage**
- Replace the stacked bar chart with **4 side-by-side bars per day** (input, cache write, cache read, output) showing **3 weeks (21 days)** of data
- Remove the separate daily cost bar chart
- Add a **5th bar per day** representing daily cost (integrated into the main chart)
- Add a new **weekly aggregated chart** at the bottom showing the same 5 metrics aggregated per ISO week, spanning **12 weeks**

## Capabilities

### New Capabilities

- `daily-token-bars`: Side-by-side 5-bar daily chart (input, cache write, cache read, output, cost) across 21 days replacing the current stacked+cost layout
- `weekly-token-bars`: Weekly aggregated 5-bar chart (same 5 metrics) spanning 12 weeks, shown below the daily chart

### Modified Capabilities

<!-- none -->

## Impact

- `public/index.html`: Tab label rename, chart rendering logic for daily view, removal of standalone cost chart, addition of weekly chart section
- No server-side or API changes — data already available in `/api/data` response
- No data model changes
