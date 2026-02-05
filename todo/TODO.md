# Future Work

## Puppeteer/Playwright E2E Tests

**Priority**: Medium
**Context**: See `todo/e2e-testing-design.md` for detailed design.

Unit tests can't cover code that uses `browser.tabs` APIs because WXT's Vitest plugin triggers an esbuild/jsdom incompatibility when the `browser` global is resolved. This means `fetchPageContent()`, `buildSystemPrompt()`, and the content script's Readability extraction are only tested manually today.

Add Puppeteer or Playwright-driven tests that load the built extension in a real Chrome instance to cover:

- Content script extracts page content via Readability
- Side panel receives content via `browser.tabs.sendMessage`
- System prompt is correctly passed to the Anthropic API
- Page context mode toggle (off/text) works end-to-end
- Graceful degradation on chrome:// pages (no crash, null content)

## Additional Page Context Modes

The `PageContextMode` type is designed to be extensible (`'off' | 'text'`). Future modes could include:

- `'html'` — send cleaned HTML instead of plain text (preserves structure)
- `'screenshot'` — capture a screenshot and send as a vision input
