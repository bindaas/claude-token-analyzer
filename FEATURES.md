# Claude Token Analyzer — Features

## What It Does
Local web dashboard (`node server.js` → http://localhost:3000) that parses Claude Code's JSONL session logs from `~/.claude/projects/` and visualizes token spend.

## Data Source
Scans all `*.jsonl` files recursively under `~/.claude/projects/`. No external API calls. No npm install.

## Metrics Tracked (per turn, per session & aggregated)
| Metric | Detail |
|--------|--------|
| Input tokens | Raw input to model |
| Output tokens | Model-generated tokens |
| Cache write tokens | Tokens written to prompt cache |
| Cache read tokens | Tokens served from cache |
| Dollar cost | Per-model pricing (Opus 4.x: $5/$25, Sonnet: $3/$15, Haiku 4.5: $1/$5) |
| Model | Detected per turn; primary model assigned per session |
| Tool calls | Count per session and by tool name |
| Large file reads | File reads >50 lines flagged as waste signals |
| Prompt count | User prompts per session (filtered, excludes tool results/meta) |
| First prompt | First user message per session (for context in drill-down) |

## Views / Panels

### Overview
- **Summary** — 7-day vs prior-7-day comparison cards, headline KPIs (cost, tokens, cache saved, sessions), token distribution donut, cost-by-type bar chart, top insight preview

### Overview (time)
- **Daily** — stacked bar canvas chart by calendar day (input / cache write / cache read / output), last 60 days; daily cost bar table for last 20 days
- **Weekly Trend** — ISO week line charts (cost, cache hit %, output ratio), week-by-week table with Δ cost arrows

### Overview (projects)
- **By Project** — cost bar chart ranked by spend, per-project stat cards (cost, sessions, cache hit %, output ratio)

### Analysis
- **Insights** — 12-type server-computed insight engine (see below)
- **Bad Habits** — client-computed heuristics: context size, file read frequency, cache hit rate, output ratio, Bash usage, weekly cost trend
- **Tool Usage** — ranked tool frequency table with % share, large file reads list

### Models & Spend
- **Model Split** — cost donut chart by model family, ranked cost bar chart, per-model breakdown table (queries, tokens, cost, $/query)
- **Top Prompts** — 20 most expensive individual queries ranked by cost, with input/output token bars
- **Sessions** — all sessions table (date, project, model, turns, tokens, cost); click any row to open drill-down modal

### Action
- **Tips** — 8 actionable cost-reduction tips

## Insights Engine (12 types)
| Insight | Trigger |
|---------|---------|
| Vague prompts | Short messages (<30 chars) generating 100K+ token responses |
| Context growth | End-of-session turns cost 2×+ more than start |
| Marathon sessions | 3+ conversations with 200+ turns |
| Input-heavy patterns | Output is <2% of total tokens |
| Day-of-week patterns | Peak usage day identified |
| Model mismatch | Opus used for simple short conversations |
| Tool-heavy conversations | Tool calls outnumber user messages 3:1+ |
| Project dominance | One project consuming 60%+ of spend |
| Conversation efficiency | Cost/turn in long sessions vs short sessions |
| Heavy initial context | Sessions starting with 50K+ input tokens |
| Cache efficiency | Estimated savings from cache reads |
| Smart /clear suggestions | Median turn where cost inflection point occurs |

## Session Drill-Down
Clicking any session row opens a modal showing:
- Session metadata (date, project, model, total cost, turn count, first prompt)
- Per-turn cost bar chart (color-coded by model)
- Full turn list (type: user/tool, tokens, cost, tool count)

## Architecture
- `server.js` — single-file Node.js HTTP server, no dependencies
- `public/index.html` — frontend (served statically, ~1400 lines)
- API endpoint: `GET /api/data` returns full JSON payload

## Key Design Choices
- **Privacy-first** — zero network calls; all computation is local
- **Zero build step** — vanilla JS frontend, no bundler, no npm
- **Per-model pricing** — accurate cost for mixed Opus/Sonnet/Haiku sessions
- **Resilient parsing** — silently skips malformed JSONL lines and synthetic model entries
