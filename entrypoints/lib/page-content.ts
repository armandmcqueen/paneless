import { storage } from 'wxt/utils/storage';
import { formatSystemPrompt } from './page-content-utils';
import type { PageContextMode, PageContent } from './page-content-utils';

export type { PageContextMode, PageContent } from './page-content-utils';
export { formatSystemPrompt } from './page-content-utils';

const pageContextModeItem = storage.defineItem<PageContextMode>(
  'local:pageContextMode',
  { defaultValue: 'text' },
);

export async function getPageContextMode(): Promise<PageContextMode> {
  return (await pageContextModeItem.getValue()) ?? 'text';
}

export async function setPageContextMode(mode: PageContextMode): Promise<void> {
  await pageContextModeItem.setValue(mode);
}

export async function fetchPageContent(): Promise<PageContent | null> {
  try {
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) return null;

    const response = await browser.tabs.sendMessage(tab.id, {
      type: 'paneless:getPageContent',
    });
    if (!response) return null;

    return {
      title: response.title ?? '',
      url: response.url ?? '',
      textContent: response.textContent ?? '',
    };
  } catch (err) {
    console.warn('[Paneless] Failed to fetch page content:', err);
    return null;
  }
}

export async function buildSystemPrompt(): Promise<string | null> {
  const mode = await getPageContextMode();
  if (mode === 'off') return null;

  const content = await fetchPageContent();
  if (!content) return null;

  return formatSystemPrompt(content);
}
