import { describe, it, expect, vi } from 'vitest';
import type { ThreadMessage } from '@assistant-ui/react';
import type { ChatModelRunOptions } from '@assistant-ui/react';

const mockCreate = vi.fn();

vi.mock('@anthropic-ai/sdk', () => {
  return {
    default: class MockAnthropic {
      messages = { create: mockCreate };
    },
  };
});

import { createAnthropicAdapter } from '../../entrypoints/lib/anthropic-adapter';

function makeUserMessage(text: string): ThreadMessage {
  return {
    id: '1',
    createdAt: new Date(),
    role: 'user',
    content: [{ type: 'text', text }],
    attachments: [],
    metadata: { custom: {} },
  } as ThreadMessage;
}

function makeRunOptions(messages: ThreadMessage[]): ChatModelRunOptions {
  return {
    messages,
    abortSignal: new AbortController().signal,
    runConfig: {},
    context: {},
    config: {},
    unstable_getMessage: () => messages[0],
  } as unknown as ChatModelRunOptions;
}

async function* fakeStream(deltas: string[]) {
  for (const delta of deltas) {
    yield {
      type: 'content_block_delta' as const,
      index: 0,
      delta: { type: 'text_delta' as const, text: delta },
    };
  }
}

describe('createAnthropicAdapter', () => {
  it('streams accumulated text content', async () => {
    mockCreate.mockResolvedValue(fakeStream(['Hello', ' world', '!']));

    const adapter = createAnthropicAdapter('sk-ant-test');
    const gen = adapter.run(makeRunOptions([makeUserMessage('Hi')]));

    const results: any[] = [];
    for await (const result of gen as AsyncGenerator<any>) {
      results.push(result);
    }

    expect(results).toHaveLength(3);
    expect(results[0]).toEqual({ content: [{ type: 'text', text: 'Hello' }] });
    expect(results[1]).toEqual({ content: [{ type: 'text', text: 'Hello world' }] });
    expect(results[2]).toEqual({ content: [{ type: 'text', text: 'Hello world!' }] });
  });

  it('ignores non-text-delta events', async () => {
    async function* mixedStream() {
      yield { type: 'message_start', message: {} };
      yield {
        type: 'content_block_delta',
        index: 0,
        delta: { type: 'text_delta', text: 'Hi' },
      };
      yield { type: 'content_block_stop', index: 0 };
      yield { type: 'message_stop' };
    }

    mockCreate.mockResolvedValue(mixedStream());

    const adapter = createAnthropicAdapter('sk-ant-test');
    const gen = adapter.run(makeRunOptions([makeUserMessage('Hello')]));

    const results: any[] = [];
    for await (const result of gen as AsyncGenerator<any>) {
      results.push(result);
    }

    expect(results).toHaveLength(1);
    expect(results[0]).toEqual({ content: [{ type: 'text', text: 'Hi' }] });
  });

  it('passes messages and model to the SDK', async () => {
    mockCreate.mockResolvedValue(fakeStream(['ok']));

    const adapter = createAnthropicAdapter('sk-ant-key123');
    const messages = [makeUserMessage('test')];
    const abortController = new AbortController();
    const gen = adapter.run({
      ...makeRunOptions(messages),
      abortSignal: abortController.signal,
    } as unknown as ChatModelRunOptions);

    for await (const _ of gen as AsyncGenerator<any>) {
      // drain
    }

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        model: expect.any(String),
        max_tokens: 4096,
        messages: [{ role: 'user', content: 'test' }],
        stream: true,
      }),
      expect.objectContaining({ signal: abortController.signal }),
    );
  });
});
