## REMOVED Requirements

### Requirement: Global stats line in app header
**Reason**: The stats line (session count, token total, cost, file count) duplicates information already available on the Overview tab and adds visual clutter to every panel.
**Migration**: Users who want this summary should navigate to the Overview tab.

#### Scenario: Header no longer shows stats
- **WHEN** data is loaded and any tab is active
- **THEN** the app header SHALL NOT display session count, token totals, cost, or file count next to the Refresh button
