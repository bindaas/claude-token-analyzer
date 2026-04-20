## Context

The Bad Habits tab (`buildHabits()` in `public/index.html`) currently reads from global `D` object — specifically `D.sessions`, `D.weeklyTrend`, `D.toolCounts`, and `D.largeReads`. All computation is done once over the full dataset with no date filtering.

The app already uses native Canvas (`drawLine()`) for line charts in the Trends tab. Charts are drawn by reading from `D.weeklyTrend` which has per-ISO-week aggregates with `week`, `cost`, `cacheHitPct`, `outputRatio`, `sessions` fields. Each session has a `firstTs` timestamp. The Sessions tab already implements date filtering by comparing `firstTs` against a date range.

## Goals / Non-Goals

**Goals:**
- Add a date range filter defaulting to last 6 weeks (6 ISO weeks back from today)
- Recompute all habit metrics from the date-filtered session subset
- Render one canvas line chart per habit showing its metric trend across the filtered weeks
- Display a static one-line explanation beneath each habit card

**Non-Goals:**
- Saving/persisting the date filter selection
- Adding new habit types beyond existing ones
- Modifying the server-side data API
- Supporting custom date ranges beyond preset options (just a "last N weeks" selector)

## Decisions

**Decision 1: Filter inside `buildHabits()` rather than a global filter**
The Sessions tab has its own independent filter. Habit metrics are derived aggregates — filtering at the `buildHabits()` level avoids coupling with the sessions filter and keeps the change self-contained. Each call to `buildHabits()` will recompute from `D.sessions` filtered by the selected date window.

Alternatives considered: Global date filter applied across all panels — rejected as too broad a change, would affect other tabs unexpectedly.

**Decision 2: Reuse existing `drawLine()` canvas function for per-habit trend charts**
`drawLine(id, weeks, accessor, color, labelFmt)` already handles canvas sizing, value normalization, and label rendering. Each habit card gets a small canvas element. We pass a habit-specific weekly aggregate array and accessor.

Alternatives considered: Adding a charting library (recharts, chart.js) — rejected, overkill for a single-file vanilla JS app.

**Decision 3: Compute per-habit weekly data inline in `buildHabits()`**
Each habit checks a different metric (avgInput, totalReads, cacheHit, outRatio, bash count). Weekly buckets must be computed from the filtered session subset. We bucket sessions by ISO week and compute the relevant metric per week, then pass that array to `drawLine()`.

**Decision 4: Date filter UI as a `<select>` dropdown above the habits list**
Options: Last 2 weeks / Last 4 weeks / Last 6 weeks (default) / Last 12 weeks / All time. The dropdown triggers `buildHabits()` on change, storing the selection in a module-level variable.

**Decision 5: Static explanations as a data property on each habit object**
Each habit entry already has `t` (title) and `d` (description). Add an `exp` property with a fixed one-liner. Render it below the description in smaller muted text.

## Risks / Trade-offs

- **Small date windows may have no data** → Show "Not enough data in this period" placeholder per habit chart.
- **Canvas IDs must be unique per habit** → Use habit index or a slug of the title as canvas ID suffix.
- **`drawLine()` assumes sorted week array** → Ensure weekly buckets are sorted by ISO week string before passing.
- **Filtering reduces sample size** → Some habits (e.g., 3-week cost trend) require minimum weeks; gracefully degrade when data is sparse.
