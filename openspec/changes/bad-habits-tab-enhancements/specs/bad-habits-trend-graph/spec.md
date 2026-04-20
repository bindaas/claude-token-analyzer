## ADDED Requirements

### Requirement: Per-habit trend line chart
Each habit card SHALL display a small line chart showing the relevant metric's value week-by-week across the currently selected date range. The chart SHALL use the same canvas-based `drawLine()` rendering pattern as the existing Trends tab charts.

Each habit's chart SHALL track its specific underlying metric:
- Cost Trending habits → weekly cost
- Context Window habits → weekly average input tokens
- File Reading habits → weekly Read/View tool call count
- Cache Utilization habit → weekly cache hit percentage
- Output Ratio habit → weekly output token ratio
- Bash Usage habit → weekly Bash tool call count

#### Scenario: Habit card renders trend chart
- **WHEN** a habit card is rendered
- **THEN** a line chart SHALL appear within the card showing the habit's metric per week
- **THEN** the x-axis SHALL show week labels (ISO week format, e.g. "W14")
- **THEN** the y-axis range SHALL auto-scale to the data values

#### Scenario: Insufficient data for trend
- **WHEN** the selected date range yields fewer than 2 data points for a habit
- **THEN** the chart area SHALL display "Not enough data" in muted text instead of a chart

#### Scenario: Chart updates with date filter change
- **WHEN** the user changes the date range filter
- **THEN** all per-habit charts SHALL re-render to reflect the new date window
