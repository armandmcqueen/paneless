import { Readability } from '@mozilla/readability';

export default defineContentScript({
  matches: ['<all_urls>'],
  main() {
    browser.runtime.onMessage.addListener((message, _sender, sendResponse) => {
      if (message?.type !== 'paneless:getPageContent') return;

      const documentClone = document.cloneNode(true) as Document;
      const article = new Readability(documentClone).parse();

      sendResponse({
        title: document.title,
        url: location.href,
        textContent: article?.textContent ?? document.body?.innerText ?? '',
      });

      return true; // keep message port open for sendResponse
    });
  },
});
