import { describe, it, expect } from 'vitest';
import { formatSystemPrompt, type PageContent } from '../../entrypoints/lib/page-content-utils';

// Note: fetchPageContent and buildSystemPrompt use browser.tabs APIs which
// can't be unit tested in jsdom due to a WXT/esbuild environment issue.
// See todo/TODO.md for plans to add Puppeteer-driven e2e tests.

describe('formatSystemPrompt', () => {
  it('formats page content into a system prompt', () => {
    const content: PageContent = {
      title: 'My Page',
      url: 'https://example.com/article',
      textContent: 'Hello world',
    };

    const result = formatSystemPrompt(content);
    expect(result).toContain('Title: My Page');
    expect(result).toContain('URL: https://example.com/article');
    expect(result).toContain('Hello world');
    expect(result).toMatch(/^The user has the following page open:/);
  });

  it('truncates content longer than 50k chars', () => {
    const longContent = 'z'.repeat(60_000);
    const content: PageContent = {
      title: 'Test',
      url: 'https://test.test',
      textContent: longContent,
    };

    const result = formatSystemPrompt(content);
    expect(result).toContain('[Content truncated]');
    // The text content portion should be truncated to 50k
    expect(result).not.toContain('z'.repeat(50_001));
    expect(result).toContain('z'.repeat(50_000));
  });

  it('does not truncate content at exactly 50k chars', () => {
    const exactContent = 'x'.repeat(50_000);
    const content: PageContent = {
      title: 'Exact Page',
      url: 'https://example.com',
      textContent: exactContent,
    };

    const result = formatSystemPrompt(content);
    expect(result).not.toContain('[Content truncated]');
  });

  it('handles empty text content', () => {
    const content: PageContent = {
      title: 'Empty Page',
      url: 'https://example.com',
      textContent: '',
    };

    const result = formatSystemPrompt(content);
    expect(result).toContain('Title: Empty Page');
    expect(result).toContain('Page content:\n');
  });
});
