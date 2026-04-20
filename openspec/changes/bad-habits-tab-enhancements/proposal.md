## Why

The Bad Habits tab currently shows a static aggregated view with no way to track habit trends over time or filter by time period. Users need to see whether their bad habits are improving or worsening across weeks to make meaningful behavioral changes.

## What Changes

- Add a date range filter to the Bad Habits tab, defaulting to the last 6 weeks
- Add a line graph for each habit showing frequency/occurrence over time (by week)
- Add a one-line explanation beneath each habit summarizing its impact or definition

## Capabilities

### New Capabilities

- `bad-habits-date-filter`: Date range filter UI component for the Bad Habits tab, defaulting to last 6 weeks, allowing users to narrow or expand the analysis window
- `bad-habits-trend-graph`: Per-habit line graph showing weekly occurrence counts over the selected date range
- `bad-habits-explanations`: Static one-line explanatory text displayed below each habit entry describing what the habit means

### Modified Capabilities

<!-- None — no existing specs are changing requirements -->

## Impact

- `src/` — Bad Habits tab component(s) need UI additions (filter, charts, explanations)
- Chart library dependency may be needed if not already present (e.g., recharts or chart.js)
- Data layer: queries/aggregations must support date-range filtering and weekly bucketing per habit
