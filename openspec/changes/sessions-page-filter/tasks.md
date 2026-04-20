## 1. Filter Bar HTML

- [x] 1.1 Add filter bar container above the sessions table in the Sessions panel with start-date, end-date inputs and a project filter button
- [x] 1.2 Add "Clear filters" button (hidden by default via CSS) inside the filter bar
- [x] 1.3 Add empty-state row in the sessions table body for the "No sessions match" message (hidden by default)

## 2. Project Dropdown Checklist

- [x] 2.1 Add a floating dropdown panel (hidden by default) anchored to the project filter button, containing dynamically generated checkboxes
- [x] 2.2 Implement toggle logic: clicking the button opens/closes the dropdown; clicking outside closes it
- [x] 2.3 Populate project checkboxes at render time from distinct, alphabetically sorted project names in the session data

## 3. Core Filter Logic

- [x] 3.1 Implement `applySessionFilters()` function that reads current filter state (start date, end date, selected projects) and filters the master sessions array
- [x] 3.2 Apply logical AND between date range and project filters as per spec
- [x] 3.3 Handle edge cases: start-after-end shows zero rows; empty project selection = all projects shown
- [x] 3.4 Debounce date input events by 150 ms to avoid jank on rapid typing

## 4. Table Re-render

- [x] 4.1 Implement `renderSessionsTable(filteredSessions)` that re-draws only the sessions tbody rows from a given array
- [x] 4.2 Show the empty-state message row when `filteredSessions` is empty; hide it otherwise

## 5. Clear Filters & Active State

- [x] 5.1 Show "Clear filters" button whenever any filter is active (at least one date set or at least one project checked)
- [x] 5.2 Wire "Clear filters" click handler to reset all inputs/checkboxes and re-run `applySessionFilters()`

## 6. Styling

- [x] 6.1 Style the filter bar and dropdown checklist using existing CSS variables to match dashboard look and feel
- [x] 6.2 Cap dropdown checklist height with `max-height` + `overflow-y: auto` for long project lists

## 7. Verification

- [ ] 7.1 Manually test: date-only filter, project-only filter, combined filter, clear filters, empty state message
- [ ] 7.2 Verify "Clear filters" is hidden when no filters are active and visible when any filter is active
- [ ] 7.3 Confirm no regressions in other panels (Overview, Analysis, etc.)

## Assumptions

| Assumption | Where to verify |
|------------|----------------|
| Sessions table is rendered by `buildSessions()` in `public/index.html` (line 1013) | `public/index.html` — search `function buildSessions` |
| `D.sessions` is the master array of session objects, already loaded when `buildSessions()` runs | `public/index.html` — check how `D` is populated before `buildSessions()` is called |
| Each session object has a `project` field (string) and a `firstTs` field (timestamp) used for date | `public/index.html` line 1027–1028 |
| Each session object has `inputTokens`, `outputTokens`, `cacheRead`, `cost`, `model`, `queries`/`prompts` fields | `public/index.html` lines 1029–1034 |
| Sessions table is rendered via `innerHTML` string interpolation (no virtual DOM / framework) | `public/index.html` line 1014 |
| No existing filter controls are present on the Sessions panel | `public/index.html` — check `buildSessions()` body for any filter UI |
