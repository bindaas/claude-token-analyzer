## Context

The sticky app header contains a `<div id="hdrMeta">` element (CSS class `.hdr-meta`) that is populated on every `renderAll()` call with a summary string: session count, total tokens, total cost, and file count. It sits to the left of the Refresh button.

## Goals / Non-Goals

**Goals:**
- Remove the stats line from the header entirely — HTML element, its CSS rule, and the JS assignment

**Non-Goals:**
- Moving the stats elsewhere
- Changing any other part of the header

## Decisions

Three co-located deletions in `public/index.html`: CSS rule on line ~35, HTML element on line ~213, JS assignment on lines ~328-329. No logic depends on `#hdrMeta` elsewhere — it is write-only (never read back).

## Risks / Trade-offs

- No risk; the element has no downstream dependencies or event listeners.
