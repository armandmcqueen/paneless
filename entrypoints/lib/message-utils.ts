import type { ThreadMessage } from '@assistant-ui/react';
import type { MessageParam } from '@anthropic-ai/sdk/resources/messages';

export function convertMessages(
  messages: readonly ThreadMessage[],
): MessageParam[] {
  const result: MessageParam[] = [];

  for (const msg of messages) {
    if (msg.role !== 'user' && msg.role !== 'assistant') continue;

    const textParts = msg.content
      .filter((part): part is Extract<typeof part, { type: 'text' }> => part.type === 'text')
      .map((part) => part.text);

    const text = textParts.join('');
    if (text.length === 0) continue;

    result.push({ role: msg.role, content: text });
  }

  return result;
}
