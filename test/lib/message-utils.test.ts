import { describe, it, expect } from 'vitest';
import type { ThreadMessage } from '@assistant-ui/react';
import { convertMessages } from '../../entrypoints/lib/message-utils';

function makeMessage(
  role: 'user' | 'assistant' | 'system',
  texts: string[],
): ThreadMessage {
  const content = texts.map((text) => ({ type: 'text' as const, text }));
  return {
    id: crypto.randomUUID(),
    createdAt: new Date(),
    role,
    content,
    ...(role === 'user' ? { attachments: [] } : {}),
    ...(role === 'assistant'
      ? { status: { type: 'complete' as const, reason: 'stop' as const } }
      : {}),
    metadata: { custom: {} },
  } as ThreadMessage;
}

describe('convertMessages', () => {
  it('converts user and assistant messages', () => {
    const messages = [
      makeMessage('user', ['Hello']),
      makeMessage('assistant', ['Hi there']),
    ];
    expect(convertMessages(messages)).toEqual([
      { role: 'user', content: 'Hello' },
      { role: 'assistant', content: 'Hi there' },
    ]);
  });

  it('filters out system messages', () => {
    const messages = [
      makeMessage('system', ['You are helpful']),
      makeMessage('user', ['Hello']),
    ];
    expect(convertMessages(messages)).toEqual([
      { role: 'user', content: 'Hello' },
    ]);
  });

  it('joins multi-part text content', () => {
    const messages = [makeMessage('user', ['Hello ', 'world'])];
    expect(convertMessages(messages)).toEqual([
      { role: 'user', content: 'Hello world' },
    ]);
  });

  it('returns empty array for empty input', () => {
    expect(convertMessages([])).toEqual([]);
  });

  it('skips messages with no text content', () => {
    const msg = {
      id: '1',
      createdAt: new Date(),
      role: 'user' as const,
      content: [{ type: 'image' as const, image: 'data:...' }],
      attachments: [],
      metadata: { custom: {} },
    } as ThreadMessage;
    expect(convertMessages([msg])).toEqual([]);
  });
});
