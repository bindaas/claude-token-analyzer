## Why

The Projects tab currently shows a combined "all projects" graph that adds noise without insight, and lacks any time scoping — users cannot focus on recent trends or compare periods. Adding a date filter and removing the aggregate graph makes per-project usage data cleaner and more actionable.

## What Changes

- **Remove** the combined "all projects together" graph from the Projects tab
- **Add** a date filter control (defaulting to "All time") at the top of the Projects tab
- Per-project graphs update reactively when the date filter changes

## Capabilities

### New Capabilities
- `project-date-filter`: Date filter control on the Projects tab that scopes all per-project graphs to the selected time range

### Modified Capabilities
- (none)

## Impact

- `public/index.html` — Projects tab rendering logic (graph rendering, filter UI)
- No API or backend changes required; filtering is client-side over existing data
