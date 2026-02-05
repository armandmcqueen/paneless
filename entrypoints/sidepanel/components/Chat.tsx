import { useMemo } from 'react';
import {
  AssistantRuntimeProvider,
  useLocalRuntime,
  ThreadPrimitive,
  ComposerPrimitive,
  MessagePrimitive,
} from '@assistant-ui/react';
import { createAnthropicAdapter } from '../../lib/anthropic-adapter';
import './Chat.css';

function UserMessage() {
  return (
    <MessagePrimitive.Root className="message message-user">
      <MessagePrimitive.Content
        components={{ Text: ({ text }) => <p>{text}</p> }}
      />
    </MessagePrimitive.Root>
  );
}

function AssistantMessage() {
  return (
    <MessagePrimitive.Root className="message message-assistant">
      <MessagePrimitive.Content
        components={{ Text: ({ text }) => <p>{text}</p> }}
      />
    </MessagePrimitive.Root>
  );
}

function Thread() {
  return (
    <ThreadPrimitive.Root className="thread-root">
      <ThreadPrimitive.Viewport className="thread-viewport">
        <ThreadPrimitive.Empty>
          <div className="thread-empty">
            <p>Send a message to start chatting with Claude.</p>
          </div>
        </ThreadPrimitive.Empty>
        <ThreadPrimitive.Messages
          components={{
            UserMessage,
            AssistantMessage,
          }}
        />
        <ThreadPrimitive.ViewportFooter className="composer-container">
          <ComposerPrimitive.Root className="composer-root">
            <ComposerPrimitive.Input
              className="composer-input"
              placeholder="Message Claude..."
              rows={1}
              autoFocus
            />
            <ComposerPrimitive.Send className="composer-send">
              Send
            </ComposerPrimitive.Send>
          </ComposerPrimitive.Root>
        </ThreadPrimitive.ViewportFooter>
      </ThreadPrimitive.Viewport>
    </ThreadPrimitive.Root>
  );
}

export default function Chat({
  apiKey,
  onOpenSettings,
}: {
  apiKey: string;
  onOpenSettings: () => void;
}) {
  const adapter = useMemo(() => createAnthropicAdapter(apiKey), [apiKey]);
  const runtime = useLocalRuntime(adapter);

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <div className="chat-container">
        <div className="chat-header">
          <span className="chat-title">Paneless</span>
          <button className="settings-button" onClick={onOpenSettings}>
            Settings
          </button>
        </div>
        <Thread />
      </div>
    </AssistantRuntimeProvider>
  );
}
