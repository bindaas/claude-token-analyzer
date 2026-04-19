## ADDED Requirements

### Requirement: Date range filter
The Sessions panel SHALL provide a start-date and end-date input (native `<input type="date">`) that filters the sessions table to show only sessions whose date falls within the selected range (inclusive on both ends). When only a start date is set, sessions on or after that date are shown. When only an end date is set, sessions on or before that date are shown.

#### Scenario: Filter by start date only
- **WHEN** the user sets a start date and leaves end date empty
- **THEN** only sessions on or after the start date are displayed in the table

#### Scenario: Filter by end date only
- **WHEN** the user sets an end date and leaves start date empty
- **THEN** only sessions on or before the end date are displayed in the table

#### Scenario: Filter by date range
- **WHEN** the user sets both a start date and an end date
- **THEN** only sessions whose date is within the inclusive range are displayed

#### Scenario: No date filter applied
- **WHEN** both date inputs are empty
- **THEN** all sessions are shown (no date filtering applied)

#### Scenario: Invalid range (start after end)
- **WHEN** the user sets a start date that is after the end date
- **THEN** the table shows zero rows and a message indicating no results match the filter

### Requirement: Project filter
The Sessions panel SHALL provide a project filter control that lists all distinct projects present in the loaded session data. The user SHALL be able to select one or more projects; only sessions belonging to the selected projects are then shown. When no project is selected, all projects are shown (filter is inactive).

#### Scenario: Select a single project
- **WHEN** the user selects one project from the project filter
- **THEN** only sessions for that project are displayed

#### Scenario: Select multiple projects
- **WHEN** the user selects two or more projects
- **THEN** sessions belonging to any of the selected projects are displayed

#### Scenario: Deselect all projects
- **WHEN** the user clears all project selections
- **THEN** all sessions are shown regardless of project

#### Scenario: Project list populated from data
- **WHEN** the Sessions panel loads
- **THEN** the project filter control lists exactly the distinct projects present in the session data, sorted alphabetically

### Requirement: Combined filter behaviour
When both date range and project filters are active simultaneously, the Sessions table SHALL display only sessions that satisfy both filters (logical AND).

#### Scenario: Date and project filters combined
- **WHEN** a date range is set AND one or more projects are selected
- **THEN** only sessions that match the date range AND belong to a selected project are shown

### Requirement: Reset filters
The Sessions panel SHALL provide a "Clear filters" affordance (button or link) that is visible only when at least one filter is active. Activating it resets all filter controls to their default (empty) state and shows all sessions.

#### Scenario: Clear filters resets table
- **WHEN** one or more filters are active and the user clicks "Clear filters"
- **THEN** all filter controls return to their default state and the full session list is displayed

#### Scenario: Clear filters hidden when no filters active
- **WHEN** no filters are active
- **THEN** the "Clear filters" control is not visible

### Requirement: Empty state messaging
When active filters produce zero matching sessions, the Sessions table SHALL display an inline message (e.g., "No sessions match the current filters") instead of an empty table body.

#### Scenario: No matching sessions
- **WHEN** the active filters yield zero sessions
- **THEN** the table body is replaced with a message indicating no sessions match
