# E2E Testing Design: Puppeteer with Chrome Extension

## Problem

WXT's Vitest plugin uses `@webext-core/fake-browser` for the `browser` global, but resolving `wxt/browser` in tests triggers a chain that loads `wxt/testing` -> `wxt-vitest-plugin.mjs` -> `wxt/core/wxt.mjs` -> esbuild. esbuild's runtime invariant check (`TextEncoder.encode("") instanceof Uint8Array`) fails in jsdom, crashing any test that imports a module using `browser.tabs`, `browser.runtime`, or other browser APIs beyond `browser.storage`.

This means `fetchPageContent()`, `buildSystemPrompt()`, content script message handling, and the full side panel -> content script communication loop cannot be unit tested.

## Proposed Solution

Use Puppeteer (or Playwright) to launch Chrome with the built extension loaded, then run test assertions against real browser behavior.

### Setup

1. Add dev dependencies: `puppeteer` (or `@playwright/test`)
2. Create a test helper that:
   - Runs `pnpm build` to produce `.output/chrome-mv3/`
   - Launches Chrome with `--load-extension=.output/chrome-mv3/ --disable-extensions-except=.output/chrome-mv3/`
   - Provides the browser/page handles to tests
   - Tears down after test suite

### Test Structure

```
test/
  e2e/
    setup.ts           # Build extension, launch browser
    content-script.test.ts  # Navigate to pages, verify extraction
    page-context.test.ts    # Verify system prompt construction
    settings.test.ts        # Toggle page context mode
```

### Key Test Cases

#### Content Script Extraction
1. Navigate to an article page (could use a local HTML fixture served by a test server)
2. Send `paneless:getPageContent` message from the extension's background/side panel context
3. Assert response contains title, URL, and extracted text content
4. Verify Readability extraction vs. fallback to `document.body.innerText`

#### Page Context Integration
1. Open the side panel
2. Navigate to a page with known content
3. Intercept the Anthropic API call (mock the network or use a test API key)
4. Send a chat message
5. Assert the `system` parameter in the API call contains the page content

#### Graceful Degradation
1. Navigate to `chrome://settings` or `chrome://extensions`
2. Verify `fetchPageContent()` returns null (content scripts can't inject on chrome:// pages)
3. Verify chat still works without page context

### Considerations

- **CI**: Requires headless Chrome. Both Puppeteer and Playwright support this.
- **Speed**: E2E tests are slow (~seconds per test). Keep the suite small and focused on integration boundaries.
- **Flakiness**: Use explicit waits for extension loading, content script injection, and API calls.
- **Test fixtures**: Serve local HTML pages with known content for deterministic assertions rather than relying on external URLs.
