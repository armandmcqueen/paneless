export type PageContextMode = 'off' | 'text';

export interface PageContent {
  title: string;
  url: string;
  textContent: string;
}

const MAX_TEXT_LENGTH = 50_000;

export function formatSystemPrompt(content: PageContent): string {
  const textContent =
    content.textContent.length > MAX_TEXT_LENGTH
      ? content.textContent.slice(0, MAX_TEXT_LENGTH) + '\n[Content truncated]'
      : content.textContent;

  return `The user has the following page open:\n\nTitle: ${content.title}\nURL: ${content.url}\n\nPage content:\n${textContent}`;
}
