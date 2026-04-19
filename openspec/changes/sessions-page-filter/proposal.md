## Why

The Sessions page lists all sessions in a flat table with no way to narrow results. As the number of sessions grows, users need to quickly focus on a specific time window or project to find and compare relevant sessions.

## What Changes

- Add a filter bar above the sessions table with two controls: a date range picker and a project selector
- Sessions table dynamically shows only rows matching the active filters
- Filter state is reflected in the UI (active filter count / reset affordance)
- Filters are applied client-side against already-loaded session data (no new API calls)

## Capabilities

### New Capabilities

- `session-filters`: Date range and project filter controls on the Sessions page, with real-time client-side filtering of the sessions table

### Modified Capabilities

<!-- None — the Sessions table API response and data structure are unchanged; only the display layer is affected -->

## Impact

- `public/index.html` — primary change: filter UI + JS filtering logic in the Sessions panel
- `server.js` — no changes required (data already returned per session including date and project fields)
- No new dependencies, no build step changes
