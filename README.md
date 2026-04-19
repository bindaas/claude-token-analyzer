# Claude Token Analyzer

Local web dashboard that parses Claude Code's JSONL session logs and visualizes token spend, cost, and usage patterns.

## Prerequisites

- Node.js (any recent version)
- Claude Code installed with session logs at `~/.claude/projects/`

## Running

```bash
node server.js
```

Then open http://localhost:3000 in your browser.

No `npm install` needed — zero dependencies.

## What It Shows

- Total token usage and dollar cost across all sessions
- Per-project breakdown sorted by cost
- Weekly trend with cache hit rate and output ratio
- Tool usage frequency
- Large file reads flagged as waste signals
- Individual session list sorted newest first

## Data Source

Reads `*.jsonl` files from `~/.claude/projects/` on your local machine. No external API calls, no data leaves your machine.
