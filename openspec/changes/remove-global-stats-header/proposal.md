## Why

The sticky header displays a global stats line ("42 sessions · 189.1M tokens · $95.99 · 42 files") next to the Refresh button on every tab. This information is already visible on the Overview tab and adds visual noise without being actionable from other contexts.

## What Changes

- Remove the `#hdrMeta` element from the HTML header entirely
- Remove the JS line that populates `#hdrMeta` in `renderAll()`
- Remove the `.hdr-meta` CSS rule

## Capabilities

### New Capabilities

<!-- None — this is a pure removal with no new behavior -->

### Modified Capabilities

<!-- None — no spec-level behavior changes, only UI element removal -->

## Impact

- `public/index.html` — remove `<div class="hdr-meta" id="hdrMeta">`, its CSS rule, and the `$('hdrMeta').textContent = ...` assignment in `renderAll()`
