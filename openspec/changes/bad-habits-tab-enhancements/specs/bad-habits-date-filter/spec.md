## ADDED Requirements

### Requirement: Date range filter on Bad Habits tab
The Bad Habits tab SHALL display a date range selector above the habit list. The selector SHALL default to "Last 6 weeks" on every page load. Changing the selection SHALL immediately recompute and re-render all habit cards using only sessions within the selected range.

Available options SHALL be: Last 2 weeks, Last 4 weeks, Last 6 weeks, Last 12 weeks, All time.

#### Scenario: Default filter is last 6 weeks
- **WHEN** the user navigates to the Bad Habits tab
- **THEN** the date filter SHALL show "Last 6 weeks" as the selected value
- **THEN** habit metrics SHALL be computed from sessions within the last 6 ISO weeks only

#### Scenario: User changes the filter
- **WHEN** the user selects a different option from the date filter dropdown
- **THEN** all habit cards SHALL recompute and re-render immediately using sessions in the new date window
- **THEN** per-habit trend charts SHALL re-render to reflect the new date range

#### Scenario: No sessions in selected range
- **WHEN** the selected date range contains no sessions
- **THEN** the tab SHALL display "No data in this period" instead of habit cards
