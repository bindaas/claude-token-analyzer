## ADDED Requirements

### Requirement: One-line explanation per habit
Each habit card SHALL display a static one-line explanation at the bottom of the card that describes the habit's significance or recommended action. The explanation SHALL be visually distinct from the habit's dynamic description (smaller, muted color).

Explanations SHALL be fixed per habit type:
- Cost Trending Up → "Costs rising week-over-week signal scope creep or growing context windows."
- Cost Trending Down → "Falling costs indicate improving habits — keep sessions focused."
- Very Large Context Windows → "Re-sending 20k+ tokens every turn multiplies cost fast; use /clear to reset."
- Growing Context Windows → "Context above 8k tokens per turn; break long tasks into sub-sessions."
- Excessive File Reading → "Each full-file read adds all tokens to context; use offset+limit or grep first."
- Frequent File Reading → "Repeated reads add up; check for redundant re-reads in the same session."
- Files Hit Token Limit → "Over-limit reads are truncated and billed twice; always pass offset+limit."
- Good Cache Utilization → "50%+ cache hits means you pay 10× less per cached token — great habit."
- Low Cache Hit Rate → "Frequent context resets or topic switching reduces cache effectiveness."
- High Output Token Ratio → "Output costs 5× input; instruct Claude to be concise in CLAUDE.md."
- High Bash Tool Usage → "Chaining commands in one Bash call saves a full round-trip per extra call."

#### Scenario: Explanation shown on every habit card
- **WHEN** a habit card is rendered
- **THEN** a one-line explanation SHALL appear at the bottom of the card in smaller muted text

#### Scenario: Positive habits also show explanations
- **WHEN** a positive/info-severity habit card is rendered (e.g., Good Cache Utilization)
- **THEN** the explanation SHALL still be displayed at the bottom of the card
