# claude.md — Project Reference: claude-token-tracker

## ABOUT THE PROJECT


Read these files to understand the context about this project

- **features & architecture:** `./FEATURES.md`

---

## ABOUT THE PROJECT


Ignore any files in the project which matches the *_HUMAN.MD  e.g. ./DEV_PLAN_HUMAN.MD 
These files are used by humans. It may have misleading information and random thoughts



---

## GLOBAL RULES

Read these two files at the start of every session — they apply to all projects:

- **Collaboration style & git rules:** `/Users/bindaas/projects/claude-global-tools/PREFERENCES.md`
- **Token, context & cost discipline:** `/Users/bindaas/projects/claude-global-tools/STRATEGY.md`

---

## SKILLS

Three skills are available from the shared plugin repo at `.claude/plugins/claude-global-tools/`.

| Skill | Trigger | What it does |
|-------|---------|--------------|
| `refresh-memory` | "refresh memory" | Loads the latest session summary so you have context from last time |
| `session-memory` | "save session memory" | Writes a session summary to the project root |
| `token-usage-report` | "token report" | Estimates token usage and cost for the session |

Read `.claude/plugins/claude-global-tools/<skill>/SKILL.md` when triggered.

**Default behaviour:** Do NOT load session files automatically. Only load them when the user triggers a skill.
---
