## 1. Remove combined bar chart

- [x] 1.1 Delete the combined "Cost per project" bar chart card from `buildProjects()` in `public/index.html`

## 2. Add date filter state and helper

- [x] 2.1 Add a `projectDateFilter` variable (default `0` = All) above `buildProjects()`
- [x] 2.2 Implement `buildProjectsFiltered(days)` that filters `D.sessions` by `firstTs` within the last `days` days (or all if `days === 0`) and returns an aggregated array in the same shape as `D.byProject`

## 3. Render date filter UI

- [x] 3.1 Add preset filter buttons (All / 7d / 30d / 90d) to the Projects tab header in `buildProjects()`
- [x] 3.2 Add CSS for active/inactive filter button states consistent with existing button styles

## 4. Wire filter to project cards

- [x] 4.1 Replace `D.byProject` with `buildProjectsFiltered(projectDateFilter)` in the per-project card rendering section
- [x] 4.2 Implement `setProjectFilter(days)` onclick handler that sets `projectDateFilter`, updates active button highlight, and re-renders the project cards
- [x] 4.3 Hide project cards for projects with zero sessions in the filtered range (per spec)
