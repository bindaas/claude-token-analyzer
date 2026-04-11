# claude.md — Project Reference: claude-token-tracker

## What this project is

A zero-tooling, prompt-only system for tracking and improving Claude token usage habits. It has two parts:

1. **Session tracking** — A prompt that makes Claude observe your usage patterns and generate a structured report at the end of any session.
2. **Multi-session analysis** — A second prompt that accepts several saved session reports and identifies trends, recurring habits, and the highest-impact changes to make.

No API keys, no dashboards, no code to run. Just two prompts and Markdown files.

---

## File map

| File | Role |
|---|---|
| `part1_global_settings_prompt.md` | The tracking prompt — add globally so it's always available. |
| `part2_multi_session_analysis_prompt.md` | Paste into a fresh session with your saved reports to get trend analysis. |
| `token_cost_and_habits_reference.md` | Reference sheet: pricing, token size intuitions, ranked habit changes, session tags, efficiency score guide. |
| `README.md` | Setup and usage instructions (including per-platform setup). |
| `claude.md` | This file — project overview for future Claude sessions. |

---

## Setup — by platform

The tracker works across both Claude interfaces. Setup differs per platform.

### Claude.ai / Claude Desktop (chat interface)

The chat interface at claude.ai and the Claude desktop app (chat mode, not the Code tab) support **Personal Preferences** — a global instruction set loaded into every conversation.

1. Go to **Settings → Profile → Personal Preferences**
2. Paste the full contents of `part1_global_settings_prompt.md`
3. Save

Every new conversation will now have tracking available on demand.

### Claude Code CLI (`claude` in terminal)

Claude Code automatically loads `~/.claude/CLAUDE.md` before every session. Add the tracking prompt there to make it globally available:

```bash
mkdir -p ~/.claude
cat /path/to/repo/part1_global_settings_prompt.md >> ~/.claude/CLAUDE.md
```

Or open `~/.claude/CLAUDE.md` in an editor and paste the contents of `part1_global_settings_prompt.md`.

The trigger phrases will work in every `claude` session with no flags needed.

> To limit tracking to a specific project instead of globally, copy the content into a `CLAUDE.md` in that project's root directory.

---

## How the session tracking works

### Trigger phrases (same in both interfaces)
| Phrase | Effect |
|---|---|
| `START token usage analysis` | Claude acknowledges tracking is active and silently begins observing. |
| `END token usage analysis` | Claude generates a full Markdown session report. |

### What Claude tracks silently
- Number of conversation turns (session length signal)
- Large pastes (documents, code blocks)
- Vague vs. precise prompts
- Rework loops (revisions, redos)
- Unnecessary re-sending of prior context
- Outputs that were longer than needed

### Session report output (template fields)
- Input / output token estimates with reasoning
- Estimated cost in USD (based on Sonnet 4 rates)
- Efficiency score (1–10)
- Patterns that increased or wasted tokens
- Patterns that kept usage efficient
- Habit recommendations with estimated savings impact
- Session tags for filtering

### Saving session reports
Save each report as a `.md` file using the naming convention:
```
session_YYYY-MM-DD_topic-slug.md
```
Example: `session_2025-03-14_api-debugging.md`

---

## How multi-session analysis works (part 2)

Once you have 3+ session reports:
1. Open a new Claude session (either interface).
2. Paste the full contents of `part2_multi_session_analysis_prompt.md`.
3. Paste your saved session `.md` files below the `--- SESSION REPORTS BELOW ---` divider.
4. Send. Claude returns a trend analysis report.

### What the trend analysis covers
- Input/output token direction over time (up / down / stable)
- Cost trajectory
- Recurring habits (patterns appearing in 2+ sessions — your real habits)
- Top 3 changes ranked by estimated token savings
- Efficiency score movement over time
- One blind-spot observation you probably haven't noticed yourself

Save trend reports as:
```
usage_analysis_YYYY-MM.md
```

---

## Pricing reference (Sonnet 4, mid-2025)

| Token type | Cost |
|---|---|
| Input | ~$0.003 / 1K tokens |
| Output | ~$0.015 / 1K tokens |

Output tokens cost **5× more** than input — long responses are the biggest cost lever.

Verify current rates: [anthropic.com/pricing](https://anthropic.com/pricing)

---

## Token size intuitions

| Content | Approx. tokens |
|---|---|
| 750 words of prose | ~1,000 |
| 1 document page | ~750 |
| 100 lines of code | ~300–600 |
| Medium chat exchange (4–6 turns) | ~800–1,200 |
| Detailed system prompt | ~500–1,500 |
| Pasted PDF page | ~600–900 |

---

## Top habits (ranked by savings impact)

1. **Stop re-pasting full documents** — reference by name/section instead. *(high)*
2. **Be specific on the first ask** — vague prompts generate long hedged replies + follow-up rounds. *(high)*
3. **Constrain output length explicitly** — add "in 3 bullets", "under 150 words", "just the code". *(high)*
4. **Don't repeat established context** — Claude holds prior turns; no need to re-summarize. *(medium)*
5. **Surgical revision requests** — "change only the opening sentence" not "here it all is, improve it". *(medium)*
6. **Break sprawling tasks into focused sub-tasks** — tighter prompts, tighter outputs. *(medium)*
7. **Prefer "recommendation first" for decisions** — ask for reasoning only if needed. *(low–medium)*
8. **Use code blocks and structure for technical input** — reduces clarification overhead. *(low)*

---

## Efficiency score guide

| Score | Meaning |
|---|---|
| 9–10 | Tight session — precise prompts, no rework, minimal waste |
| 7–8 | Generally efficient with minor waste |
| 5–6 | Mixed — some good habits, some bloat or rework |
| 3–4 | Several inefficiencies — rework loops, vague prompts, large repastes |
| 1–2 | Heavy waste throughout |

---

## Session tags reference

`#heavy-input` `#heavy-output` `#rework-loops` `#large-pastes` `#vague-prompts` `#precise-prompts` `#efficient` `#context-bloat` `#unnecessary-history` `#long-outputs` `#code-heavy` `#document-heavy` `#conversation-heavy`

---

## Important caveats

- Token counts in session reports are **estimates based on conversational signals**, not exact API measurements. For precise counts, check the Anthropic API usage dashboard or the `usage` field in API responses.
- The trigger phrases and report format work identically in Claude.ai, Claude desktop chat, and Claude Code CLI — no changes to the prompts are needed.
- Pricing in `token_cost_and_habits_reference.md` reflects Sonnet 4 mid-2025 rates — verify before relying on cost estimates.

---

## If you're editing this project

- The core logic lives entirely in `part1_global_settings_prompt.md` (the tracking behavior and report template).
- The multi-session analysis logic is self-contained in `part2_multi_session_analysis_prompt.md`.
- `token_cost_and_habits_reference.md` is a standalone reference — update pricing whenever Anthropic changes rates.
- There is no code, no dependencies, and no build step. The whole system is prompt text and Markdown conventions.
