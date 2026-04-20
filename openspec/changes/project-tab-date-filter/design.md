## Context

The Projects tab (`buildProjects()` in `public/index.html`) renders two things:
1. A combined "Cost per project" bar chart showing all projects stacked together
2. Individual per-project cards in a two-column grid

Data flows from `D.byProject` (pre-aggregated array) and `D.sessions` (raw session list). All rendering is client-side; no server calls are involved in this tab.

## Goals / Non-Goals

**Goals:**
- Remove the combined "Cost per project" bar chart card
- Add a date range filter UI (preset options: All, Last 7d, Last 30d, Last 90d) at the top of the tab
- Re-derive per-project aggregates from `D.sessions` filtered by the selected date range, so individual project cards reflect the filter

**Non-Goals:**
- Custom date picker (presets only for now)
- Persisting the selected filter across page reloads
- Modifying the Sessions or Daily tabs

## Decisions

**Decision: Filter against `D.sessions`, not `D.byProject`**
`D.byProject` is pre-aggregated and has no per-session timestamps. Filtering must recompute aggregates from `D.sessions` filtered by `firstTs`. This is already done for the Sessions tab filter, so the pattern is established.

**Decision: Preset buttons, not a date-picker input**
The app uses a simple button/dropdown pattern (see sessions tab `toggleProjDropdown`). Consistent preset buttons ("All", "7d", "30d", "90d") are simpler and fit the existing UI style.

**Decision: Introduce `projectDateFilter` state variable + `buildProjectsFiltered()`**
Rather than mutating `D.byProject`, we compute a filtered aggregate inline in a new helper `buildProjectsFiltered(days)` and call it from `buildProjects()`. This keeps existing data clean.

## Risks / Trade-offs

- [Recomputing aggregates on filter change] → Mitigation: The session count is small (hundreds, not millions); recomputation on each filter click is instant.
- [Filter state lost on tab switch] → Accepted trade-off; persisting to localStorage is out of scope.
