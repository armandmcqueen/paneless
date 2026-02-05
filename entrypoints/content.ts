import { Readability } from '@mozilla/readability';

export default defineContentScript({
  matches: ['<all_urls>'],
  main() {
    browser.runtime.onMessage.addListener((message) => {
      if (message?.type !== 'paneless:getPageContent') return;

      const documentClone = document.cloneNode(true) as Document;
      const article = new Readability(documentClone).parse();

      return Promise.resolve({
        title: document.title,
        url: location.href,
        textContent: article?.textContent ?? document.body?.innerText ?? '',
      });
    });
  },
});
