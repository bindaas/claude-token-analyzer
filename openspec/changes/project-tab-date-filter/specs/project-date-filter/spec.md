## ADDED Requirements

### Requirement: Remove combined projects bar chart
The Projects tab SHALL NOT display a combined "Cost per project" bar chart that aggregates all projects into a single card.

#### Scenario: Projects tab loads
- **WHEN** the user navigates to the Projects tab
- **THEN** no combined bar chart card is shown at the top of the tab

### Requirement: Date filter control
The Projects tab SHALL display a date filter control with preset options: All, 7d, 30d, 90d. The default selection SHALL be "All".

#### Scenario: Default state on tab load
- **WHEN** the user navigates to the Projects tab
- **THEN** the date filter shows "All" as the active selection and all project data is visible

#### Scenario: User selects a preset
- **WHEN** the user clicks a date filter preset (e.g., "30d")
- **THEN** the selected preset is visually highlighted as active

### Requirement: Per-project cards filter by date
When a date filter is active, each per-project card SHALL display metrics computed only from sessions whose `firstTs` falls within the selected date range.

#### Scenario: Filter applied — projects with sessions in range
- **WHEN** the user selects "30d"
- **THEN** each project card shows cost, sessions, cache hit %, and out ratio computed from sessions in the last 30 days only

#### Scenario: Filter applied — project has no sessions in range
- **WHEN** the user selects a date range and a project has no sessions in that range
- **THEN** that project's card is hidden (not shown with zero values)

#### Scenario: All filter selected
- **WHEN** the user selects "All"
- **THEN** all projects are shown with aggregates across all time
