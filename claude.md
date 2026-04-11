# claude.md — Project Reference: claude-token-tracker

## What this project is

A zero-tooling, prompt-only system for tracking and improving Claude token usage habits.

**Single purpose:** `global_prompt_token_analysis.md` does one thing and one thing only — token usage tracking and reporting. It is designed to be shared globally across all Claude projects and Claude Code CLI sessions. It has no other responsibilities (no session management, no git ops, no unrelated tooling).

The project also includes a companion prompt for multi-session trend analysis, but that is a separate tool used on demand — not part of the global prompt.

---

## File map

| File | Role |
|---|---|
| `global_prompt_token_analysis.md` | **The global tracking prompt.** Single-purpose. Add to personal preferences or `~/.claude/CLAUDE.md` so it's always active. |
| `multi_session_analysis_prompt.md` | Paste into a fresh session with saved reports for trend analysis. Used on demand, not globally. |
| `token_cost_and_habits_reference.md` | Reference sheet: pricing, token size intuitions, ranked habit changes, session tags, efficiency score guide. |
| `README.md` | Setup and usage instructions (including per-platform setup). |
| `claude.md` | This file — project overview for future Claude sessions. |
| `~/.claude/token-reports/` | Canonical location for all saved session and trend reports (outside this repo). |

---

## Setup — by platform

### Claude.ai / Claude Desktop (chat interface)

1. Go to **Settings → Profile → Personal Preferences**
2. Paste the full contents of `global_prompt_token_analysis.md`
3. Save

Every new conversation will now have tracking active automatically from turn one.

### Claude Code CLI (`claude` in terminal)

Claude Code automatically loads `~/.claude/CLAUDE.md` before every session:

```bash
mkdir -p ~/.claude
cat /path/to/repo/global_prompt_token_analysis.md >> ~/.claude/CLAUDE.md
```

> To limit tracking to a specific project instead of globally, copy the content into a `CLAUDE.md` in that project's root directory.

---

## How the session tracking works

### Tracking starts
Always on from turn one — no trigger phrase needed.

### Trigger to generate a report
| Phrase | Effect |
|---|---|
| `END token usage analysis` | Claude generates a full Markdown session report. |
| Wrapping-up language | Same effect (e.g. "we're done", "let's wrap up"). |

### What Claude tracks silently
- Number of conversation turns
- Large pastes (documents, code blocks)
- Vague vs. precise prompts
- Rework loops (revisions, redos)
- Unnecessary re-sending of prior context
- Outputs longer than needed

---

## Report naming convention

```
token-report_YYYY-MM-DD_HHmm_topic-slug.md
```

Example: `token-report_2025-03-14_1030_api-debugging.md`

The `token-report_` prefix ensures consistent glob matching. The time component prevents overwriting multiple reports on the same day.

---

## Where reports are saved

Reports are saved in this priority order:

1. **`~/.claude/token-reports/`** — canonical location, tried first on all interfaces
2. **Current working directory** — CLI fallback if `~/.claude/token-reports/` is not accessible
3. **Downloadable file** — Desktop/claude.ai fallback if filesystem is not accessible

If this is a git project, `.gitignore` is updated automatically to exclude `token-report*.md`.

---

## How multi-session analysis works

Once you have 3+ session reports in `~/.claude/token-reports/`:
1. Open a new Claude Code session.
2. Paste the full contents of `multi_session_analysis_prompt.md`.
3. Paste your saved session `.md` files below the `--- SESSION REPORTS BELOW ---` divider (or reference the directory directly in CLI).

Save trend reports as:
```
~/.claude/token-reports/usage_analysis_YYYY-MM.md
```

---

## Pricing reference (Sonnet 4, mid-2025)

| Token type | Cost |
|---|---|
| Input | ~$0.003 / 1K tokens |
| Output | ~$0.015 / 1K tokens |

Output tokens cost **5× more** than input. Verify current rates at [anthropic.com/pricing](https://anthropic.com/pricing).

---

## If you're editing this project

- The core logic lives entirely in `global_prompt_token_analysis.md`. Keep it single-purpose — token tracking only.
- Do not add session management, git workflows, or unrelated instructions to the global prompt.
- `multi_session_analysis_prompt.md` is self-contained — edit independently.
- No code, no dependencies, no build step. The whole system is prompt text and Markdown conventions.
