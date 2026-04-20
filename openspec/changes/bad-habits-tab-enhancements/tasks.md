## 1. Date Filter UI

- [x] 1.1 Add a module-level variable `habitWeeks` (default 6) to store the selected filter value
- [x] 1.2 Add a `<select>` dropdown HTML element above the habits list with options: 2, 4, 6 (default), 12 weeks, and All time
- [x] 1.3 Wire the dropdown `change` event to update `habitWeeks` and call `buildHabits()`
- [x] 1.4 Style the filter row to match existing pg-hdr layout (small label + select on the right)

## 2. Filtered Session Aggregation

- [x] 2.1 At the top of `buildHabits()`, compute a `filteredSessions` array by slicing `D.sessions` to only those with `firstTs` within the last `habitWeeks` ISO weeks
- [x] 2.2 Rewrite all metric computations (`avgIn`, `totalReads`, `cacheHit`, `outRatio`, `bash`) to use `filteredSessions` instead of `D.sessions` / `D.toolCounts` / `D.largeReads`
- [x] 2.3 Recompute per-habit weekly buckets from `filteredSessions` — ISO-week-bucketed arrays for: cost, avg input tokens, read count, cache hit pct, output ratio, bash count

## 3. Per-Habit Trend Charts

- [x] 3.1 Add an `exp` (explanation) and `chartId` (unique canvas ID string) property to each habit object in the `habits` array
- [x] 3.2 Update the habit card HTML template to include a `<canvas>` element using `h.chartId`, sized to about 180×50px, and a `<div class="hexp">` for the explanation
- [x] 3.3 Add `.hexp` CSS rule: small font size (~10px), muted color, margin-top
- [x] 3.4 After setting `innerHTML`, loop through `habits` and call `drawLine(h.chartId, h.weeklyData, h.accessor, h.color, h.labelFmt)` for each habit that has enough data (≥2 points)
- [x] 3.5 For habits with < 2 data points, inject "Not enough data" text into the canvas element's parent instead of calling drawLine

## 4. Static Explanations

- [x] 4.1 Add the `exp` one-liner string to each habit push in `buildHabits()` per the spec definitions
- [x] 4.2 Render `h.exp` inside `.hexp` div in the habit card template

## 5. Edge Cases & Cleanup

- [x] 5.1 Handle "No sessions in selected range" by rendering a single info card with message "No data in this period"
- [x] 5.2 Ensure `buildHabits()` is called when navigating to the habits panel (already wired via `data-p="habits"` nav click — verify it passes the current `habitWeeks` value)
- [x] 5.3 Verify canvas IDs are unique per habit render (use habit index or title slug to avoid collisions on re-render)
