# Token Usage Tracker — README

A lightweight system for understanding and improving how you use Claude tokens across sessions.

---

## What this is

A two-prompt system that:
1. Tracks your token usage habits within a session and generates a structured report
2. Analyzes reports across multiple sessions to surface trends and coaching insights

No API keys, no tooling, no dashboards. Just prompts and Markdown files.

---

## Files in this system

| File | Purpose |
|---|---|
| `part1_global_settings_prompt.md` | The tracking prompt — add it globally so it's always available |
| `part2_multi_session_analysis_prompt.md` | Paste into a new session with your reports to get trend analysis |
| `README.md` | This file |
| `token_cost_and_habits_reference.md` | Cost estimates, token size intuitions, and high-impact habits |
| `claude.md` | Project reference for future Claude sessions |

---

## Setup (one time)

The tracker works in both **Claude.ai / Desktop chat** and **Claude Code CLI**. Pick your setup below.

---

### Option A — Claude.ai or Claude Desktop (chat interface)

This is the web app at claude.ai or the Claude desktop app in **chat mode** (not the Code tab).

1. Open Claude → **Settings** → **Profile** → **Personal Preferences**
2. Copy the full contents of `part1_global_settings_prompt.md`
3. Paste it into the preferences field. Save.

The tracking prompt is now loaded automatically into every new conversation.

> **Note:** Personal Preferences apply globally across all your conversations in Claude.ai and the desktop chat interface.

---

### Option B — Claude Code CLI

This is the `claude` command you run in your terminal.

Claude Code automatically reads a global `CLAUDE.md` file before every session. Add the tracking prompt there:

```bash
# Create the directory if it doesn't exist
mkdir -p ~/.claude

# Append the tracking prompt to your global CLAUDE.md
cat /path/to/this/repo/part1_global_settings_prompt.md >> ~/.claude/CLAUDE.md
```

Or open `~/.claude/CLAUDE.md` in any editor and paste the contents of `part1_global_settings_prompt.md` at the top or bottom.

The tracking commands will now be available in every `claude` session automatically, with no flags needed.

> **Note:** `~/.claude/CLAUDE.md` is your global config — it applies to all Claude Code sessions across all projects. If you only want it for specific projects, copy the content into a `CLAUDE.md` in that project's root directory instead.

---

## Using it (same for both setups)

### Start a session
At the beginning of any conversation you want to track, type:

```
START token usage analysis
```

Claude will confirm tracking is active and begin observing your patterns silently.

### End a session and get your report
When you're done, type:

```
END token usage analysis
```

Claude will generate a Markdown report. Copy it and save it as:

```
session_YYYY-MM-DD_topic-slug.md
```

Example filenames:
```
session_2025-03-10_api-debugging.md
session_2025-03-14_writing-project.md
session_2025-03-19_data-analysis.md
```

### Analyze trends across sessions
Once you have 3 or more reports:

1. Open a new Claude session (either interface)
2. Copy the contents of `part2_multi_session_analysis_prompt.md`
3. Paste your session `.md` files below the divider line
4. Send — Claude returns a trend analysis report

Save the output as:
```
usage_analysis_YYYY-MM.md
```

---

## What the session report includes

- Estimated input/output token ranges
- Estimated cost in USD
- Efficiency score (1–10)
- Specific patterns that increased or wasted tokens
- Habit recommendations with estimated savings
- Session tags for easy filtering

---

## What the trend analysis covers

- Token usage direction over time (up / down / stable)
- Cost trajectory
- Recurring habits across sessions (your real patterns)
- Top 3 actionable changes ranked by savings
- Efficiency score movement
- One blind-spot observation you likely haven't noticed

---

## Notes

- Token counts are **estimates** based on conversational signals, not exact API measurements. For exact counts, check your Anthropic API usage dashboard.
- Pricing reference in `token_cost_and_habits_reference.md` reflects Sonnet 4 mid-2025 rates. Verify current rates at [anthropic.com/pricing](https://anthropic.com/pricing).
- The tracking commands work identically in both Claude.ai/desktop chat and Claude Code CLI — no changes to the prompts are needed between environments.
