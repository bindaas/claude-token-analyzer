## ADDED Requirements

### Requirement: Weekly aggregated token chart
A weekly aggregated bar chart SHALL be displayed below the daily chart on the Token Usage tab. It SHALL show 5 side-by-side bars per ISO week (input tokens, cache write tokens, cache read tokens, output tokens, cost), spanning the most recent 12 weeks.

#### Scenario: 12 week groups displayed
- **WHEN** the Token Usage tab is active and data covers at least 12 weeks
- **THEN** the weekly chart SHALL show exactly 12 ISO week groups on the X-axis

#### Scenario: Five bars per week group
- **WHEN** rendering any week group
- **THEN** the weekly chart SHALL display 5 distinct adjacent bars (input, cache write, cache read, output, cost) for that week

#### Scenario: Fewer than 12 weeks of data
- **WHEN** fewer than 12 weeks of data exist
- **THEN** the weekly chart SHALL display only the available weeks without padding

### Requirement: Weekly data aggregated client-side
Weekly totals SHALL be computed in the frontend by summing per-day values within each ISO week. No new API endpoint is required.

#### Scenario: Aggregation correctness
- **WHEN** a week contains N days of data
- **THEN** each metric for that week SHALL equal the sum of that metric across all N days

### Requirement: Weekly chart secondary axis for cost
The weekly cost bar SHALL use a secondary Y-axis (right side), mirroring the daily chart's dual-axis design.

#### Scenario: Right axis shows weekly cost scale
- **WHEN** the weekly chart is rendered
- **THEN** the right Y-axis SHALL be scaled to the maximum weekly cost value

### Requirement: Weekly chart labeled
The weekly chart SHALL have a visible section heading (e.g., "Weekly Token Usage") to distinguish it from the daily chart above it.

#### Scenario: Section heading visible
- **WHEN** the Token Usage tab is active
- **THEN** a heading or label identifying the weekly chart SHALL be visible above or adjacent to it
