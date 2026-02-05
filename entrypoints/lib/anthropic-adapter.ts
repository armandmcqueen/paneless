import Anthropic from '@anthropic-ai/sdk';
import type { ChatModelAdapter } from '@assistant-ui/react';
import { convertMessages } from './message-utils';

const MODEL = 'claude-sonnet-4-20250514';

export function createAnthropicAdapter(apiKey: string): ChatModelAdapter {
  const client = new Anthropic({
    apiKey,
    dangerouslyAllowBrowser: true,
  });

  return {
    async *run({ messages, abortSignal }) {
      const anthropicMessages = convertMessages(messages);
      const stream = await client.messages.create({
        model: MODEL,
        max_tokens: 4096,
        messages: anthropicMessages,
        stream: true,
      }, { signal: abortSignal });

      let text = '';
      for await (const event of stream) {
        if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
          text += event.delta.text;
          yield { content: [{ type: 'text' as const, text }] };
        }
      }
    },
  };
}
