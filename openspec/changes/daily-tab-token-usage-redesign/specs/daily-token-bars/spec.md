## ADDED Requirements

### Requirement: Tab renamed to Token Usage
The "Daily" tab label SHALL be renamed to "Token Usage".

#### Scenario: Tab label updated
- **WHEN** the user views the navigation tabs
- **THEN** the tab previously labeled "Daily" SHALL display as "Token Usage"

### Requirement: Grouped 5-bar daily chart
The daily chart SHALL render 5 side-by-side bars per calendar day: input tokens, cache write tokens, cache read tokens, output tokens, and daily cost. The chart SHALL display the most recent 21 calendar days.

#### Scenario: Correct number of day groups
- **WHEN** the Token Usage tab is active and data covers at least 21 days
- **THEN** the chart SHALL show exactly 21 day groups on the X-axis

#### Scenario: Five bars per day group
- **WHEN** rendering any day group
- **THEN** the chart SHALL display 5 distinct adjacent bars (input, cache write, cache read, output, cost) for that day

#### Scenario: Fewer than 21 days of data
- **WHEN** fewer than 21 days of data exist
- **THEN** the chart SHALL display only the available days without padding with empty groups

### Requirement: Cost bar on secondary axis
The cost bar SHALL be rendered using a secondary Y-axis (right side) so that token counts and dollar cost are each displayed on a scale appropriate to their magnitude.

#### Scenario: Left axis shows token scale
- **WHEN** the chart is rendered
- **THEN** the left Y-axis SHALL be labeled with token counts and scaled to the maximum token value

#### Scenario: Right axis shows cost scale
- **WHEN** the chart is rendered
- **THEN** the right Y-axis SHALL be labeled with dollar cost and scaled to the maximum daily cost value

### Requirement: Standalone daily cost chart removed
The separate daily cost bar chart previously shown below the daily stacked chart SHALL be removed from the Token Usage tab.

#### Scenario: Cost chart absent
- **WHEN** the Token Usage tab is active
- **THEN** no standalone cost bar chart SHALL be rendered below the main daily chart

### Requirement: Consistent bar colors
The 5 bar types SHALL use distinct, consistent colors across the daily and weekly charts: input (blue), cache write (yellow), cache read (green), output (purple), cost (orange).

#### Scenario: Color consistency
- **WHEN** both the daily and weekly charts are visible
- **THEN** each metric SHALL use the same color in both charts
