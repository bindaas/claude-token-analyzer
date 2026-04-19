## Context

The Sessions panel in `public/index.html` renders a full table of all sessions returned by `GET /api/data`. Sessions already include `date`, `project`, and other fields. The frontend is vanilla JS with no build step — all logic lives in `index.html`. The server returns the full dataset on load; there is no pagination or server-side filtering.

## Goals / Non-Goals

**Goals:**
- Add a date range filter (start date, end date) and a project multi-select filter above the sessions table
- Filter sessions client-side in real time as controls change
- Show a reset / clear-filters affordance when any filter is active
- Match the existing minimal CSS style of the dashboard

**Non-Goals:**
- Server-side filtering or new API endpoints
- Persisting filter state across page reloads
- Filtering panels other than Sessions
- Fuzzy / full-text search on session content

## Decisions

**Client-side filtering over server-side**
The full dataset is already loaded into the browser. A round-trip for filtering would add latency with no benefit at the current data scale. Simpler to implement and keeps the server unchanged.
> Alternative: query params on `/api/data` — rejected; adds server complexity and breaks the zero-dependency ethos.

**Native `<input type="date">` for date range**
No third-party date picker. The existing codebase has zero npm dependencies; a native input keeps that intact.
> Alternative: a custom calendar widget — rejected; over-engineered for this use case.

**Project selector as a `<select multiple>` or a dropdown checklist**
The project list is derived at runtime from the loaded session data. A `<select multiple>` is the simplest native approach; a custom checklist is friendlier for many projects. Given unknown project counts, implement as a styled dropdown checklist (checkboxes in a floating panel toggled by a button) to handle long lists gracefully.
> Alternative: `<select multiple>` — acceptable fallback if checklist adds too much complexity; use the checklist as first choice.

**Filter bar placement**
Inline above the sessions table, inside the Sessions panel, consistent with how other panels lay out their controls.

## Risks / Trade-offs

- [Large datasets] Filtering on every keystroke in the date inputs could cause jank on very large session lists → Mitigation: debounce date input events by 150 ms.
- [Project list length] If a user has hundreds of projects, the dropdown checklist could be very tall → Mitigation: cap dropdown height with `overflow-y: auto` and a max-height.
- [CSS consistency] Custom filter controls must match existing dashboard styling without a design system → Mitigation: reuse existing CSS variables and button classes from the page.
