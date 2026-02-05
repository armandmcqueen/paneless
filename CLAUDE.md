# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Paneless is a Chrome browser extension for AI capabilities, built with WXT, React, and TypeScript.

## Commands

- `pnpm dev` — Start dev server (opens Chrome with HMR-enabled extension)
- `pnpm build` — Production build (outputs to `.output/chrome-mv3/`)
- `pnpm test` — Run tests (Vitest)
- `pnpm test:watch` — Run tests in watch mode
- `pnpm compile` — TypeScript type checking (no emit)
- `pnpm zip` — Package extension for distribution

## Project Structure

```
entrypoints/          # Extension entry points (WXT convention)
  sidepanel/          # Side panel UI (click extension icon)
    index.html        # HTML entry point
    main.tsx          # React mount point
    App.tsx           # Root component (loading → needs-key → ready)
    App.css           # App styles
    style.css         # Global styles
    components/       # UI components
      ApiKeyForm.tsx  # API key entry form with validation
      ApiKeyForm.css
      Chat.tsx        # Chat UI using assistant-ui primitives
      Chat.css
  lib/                # Shared business logic (pure TS, testable)
    message-utils.ts  # Convert assistant-ui messages to Anthropic format
    storage.ts        # WXT storage wrapper for API key
    anthropic-adapter.ts # ChatModelAdapter for Anthropic streaming
  background.ts       # Background service worker (side panel setup)
  content.ts          # Content script
public/               # Static assets copied to output
assets/               # Assets processed by bundler
test/                 # Test files (mirrors entrypoints/ structure)
  setup.ts            # Test setup (jest-dom matchers)
  lib/                # Tests for lib modules
  sidepanel/          # Tests for sidepanel components
chrome.d.ts           # Chrome sidePanel API type declarations
wxt.config.ts         # WXT configuration
vitest.config.ts      # Vitest configuration
tsconfig.json         # TypeScript config (extends .wxt/tsconfig.json)
```

## Testing Philosophy

Testability is a first-class concern. Structure code for maximum command-line testability:

- **Separate logic from UI**: Keep business logic in pure TypeScript modules that can be unit tested without a browser or DOM. React components should be thin wrappers that delegate to these modules.
- **Separate logic from browser APIs**: Don't call `browser.*` APIs directly in business logic. WXT's Vitest plugin auto-mocks `browser.*` APIs, but pure functions are even easier to test.
- **Test location**: Tests live in `test/` mirroring the source structure.
- **Prefer unit tests**: Fast, deterministic, no browser needed. Use `@testing-library/react` for component tests.

## Tech Stack

- **Framework**: WXT (Chrome extension framework with Vite)
- **UI**: React 19 + @assistant-ui/react (headless chat primitives)
- **AI**: @anthropic-ai/sdk (streaming, client-side with user's API key)
- **Language**: TypeScript
- **Package manager**: pnpm
- **Testing**: Vitest + @testing-library/react + jsdom
- **Build output**: `.output/` (gitignored)
- **WXT generated types**: `.wxt/` (gitignored)
