# Token Cost & Habits Reference

---

## Cost reference

Prices below are for **Claude Sonnet 4** as of mid-2025. Always verify current rates at [anthropic.com/pricing](https://anthropic.com/pricing) — they change.

| Token type | Approx. cost |
|---|---|
| Input tokens | ~$0.003 per 1,000 tokens |
| Output tokens | ~$0.015 per 1,000 tokens |

Output tokens cost 5× more than input. Long responses are your biggest lever.

---

## What 1,000 tokens looks like

| Content type | Approx. tokens |
|---|---|
| 750 words of prose | ~1,000 |
| 1 page of a document | ~750 |
| 100 lines of code | ~300–600 |
| A medium chat exchange (4–6 turns) | ~800–1,200 |
| A detailed system prompt | ~500–1,500 |
| A pasted PDF page | ~600–900 |

---

## High-impact habits (ranked by token savings)

### 1. Stop re-pasting full documents
**Impact: high**
If you've already shared a document this session, reference it by name or section. Don't paste it again.
- Instead of: pasting 3,000 words again with "update section 2"
- Do: "In the document above, update only the second paragraph of section 2 to say X"

### 2. Be specific on the first ask
**Impact: high**
Vague prompts generate long hedged outputs, then require follow-up clarification — doubling the exchange.
- Instead of: "Can you help me with my code?"
- Do: "In the Python function `parse_csv()`, fix the KeyError on line 14 — the key is sometimes missing"

### 3. Constrain output length explicitly
**Impact: high**
Claude defaults to thorough. If you don't need thorough, say so.
- Add: "in 3 bullet points", "under 150 words", "one paragraph only", "just the code, no explanation"
- This alone can cut output tokens by 50–70% on explanatory tasks

### 4. Don't repeat established context
**Impact: medium**
Claude holds everything said earlier in the session window. You don't need to re-summarize the situation each message.
- Instead of: re-explaining the project background every message
- Do: refer back — "given what we discussed about the auth flow..."

### 5. Use surgical revision requests
**Impact: medium**
"Here's the full thing, please improve it" forces Claude to re-read and re-output everything.
- Instead of: repasting 500 words with "make this better"
- Do: "Change only the opening sentence — make it more direct. Leave the rest."

### 6. Break sprawling tasks into focused sub-tasks
**Impact: medium**
One large messy prompt generates a large hedged response. Sequential focused prompts generate tighter, more accurate outputs with less waste.
- Instead of: "Write a blog post, make it SEO optimized, add a CTA, and suggest 5 titles"
- Do: start with the post, then optimize, then CTA, then titles — separately

### 7. Prefer "yes/no first" for decision questions
**Impact: low–medium**
Asking "should I use PostgreSQL or SQLite?" generates a lengthy comparison. If you just need a call:
- Add: "give me your recommendation in one sentence, I can ask for reasoning if needed"

### 8. Use code blocks and structure for technical input
**Impact: low**
Well-structured input (proper code blocks, clear variable names, labeled sections) reduces the clarification Claude needs and tightens the response.

---

## Session efficiency score guide

| Score | What it means |
|---|---|
| 9–10 | Tight, precise session — minimal waste, clear prompts, no rework |
| 7–8 | Generally efficient with minor waste (one vague prompt, one unnecessary repaste) |
| 5–6 | Mixed — some good habits, some rework or context bloat |
| 3–4 | Several inefficiencies — rework loops, large pastes, vague prompts |
| 1–2 | Heavy waste — repeated repasting, major rework loops, long unnecessary outputs throughout |

---

## Session tags reference

Use these in your session reports for filtering and pattern spotting across sessions.

| Tag | Meaning |
|---|---|
| `#heavy-input` | Session dominated by large inputs (documents, code, pastes) |
| `#heavy-output` | Session generated unusually long outputs |
| `#rework-loops` | Multiple revisions of the same thing |
| `#large-pastes` | Full documents or large code blocks pasted repeatedly |
| `#vague-prompts` | Requests that needed clarification before Claude could proceed |
| `#precise-prompts` | Requests were specific and well-scoped |
| `#efficient` | Session ran clean with minimal waste |
| `#context-bloat` | Unnecessary re-explanation of established context |
| `#unnecessary-history` | Prior conversation content re-shared when not needed |
| `#long-outputs` | Outputs were longer than the task required |
| `#code-heavy` | Session focused on code (higher token density) |
| `#document-heavy` | Session involved document review or editing |
| `#conversation-heavy` | Session was mostly back-and-forth dialogue |
