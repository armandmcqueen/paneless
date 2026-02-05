import { render, screen, cleanup, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';

const mockGetApiKey = vi.fn();
const mockWatchApiKey = vi.fn().mockReturnValue(() => {});

vi.mock('../../entrypoints/lib/storage', () => ({
  getApiKey: (...args: any[]) => mockGetApiKey(...args),
  setApiKey: vi.fn().mockResolvedValue(undefined),
  removeApiKey: vi.fn().mockResolvedValue(undefined),
  watchApiKey: (...args: any[]) => mockWatchApiKey(...args),
}));

vi.mock('../../entrypoints/sidepanel/components/ApiKeyForm', () => ({
  default: ({ onSaved }: { onSaved: () => void }) => (
    <div data-testid="api-key-form">
      <button onClick={onSaved}>MockSave</button>
    </div>
  ),
}));

vi.mock('../../entrypoints/sidepanel/components/Chat', () => ({
  default: ({ apiKey, onOpenSettings, onOpenDebug }: { apiKey: string; onOpenSettings: () => void; onOpenDebug: () => void }) => (
    <div data-testid="chat">
      <span data-testid="chat-key">{apiKey}</span>
      <button onClick={onOpenSettings}>MockSettings</button>
      <button onClick={onOpenDebug}>MockDebug</button>
    </div>
  ),
}));

vi.mock('../../entrypoints/sidepanel/components/Settings', () => ({
  default: ({ onBack, onKeyCleared }: { onBack: () => void; onKeyCleared: () => void }) => (
    <div data-testid="settings">
      <button onClick={onBack}>MockBack</button>
      <button onClick={onKeyCleared}>MockClearKey</button>
    </div>
  ),
}));

vi.mock('../../entrypoints/sidepanel/components/DebugPanel', () => ({
  default: ({ onBack }: { onBack: () => void }) => (
    <div data-testid="debug">
      <button onClick={onBack}>MockDebugBack</button>
    </div>
  ),
}));

import App from '../../entrypoints/sidepanel/App';

describe('App', () => {
  afterEach(cleanup);

  beforeEach(() => {
    vi.clearAllMocks();
    mockWatchApiKey.mockReturnValue(() => {});
  });

  it('shows loading state initially', () => {
    mockGetApiKey.mockReturnValue(new Promise(() => {})); // never resolves
    render(<App />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('shows ApiKeyForm when no key is stored', async () => {
    mockGetApiKey.mockResolvedValue(null);
    render(<App />);
    await waitFor(() => {
      expect(screen.getByTestId('api-key-form')).toBeInTheDocument();
    });
  });

  it('shows Chat when key is stored', async () => {
    mockGetApiKey.mockResolvedValue('sk-ant-test-key');
    render(<App />);
    await waitFor(() => {
      expect(screen.getByTestId('chat')).toBeInTheDocument();
      expect(screen.getByTestId('chat-key')).toHaveTextContent('sk-ant-test-key');
    });
  });

  it('navigates to settings and back', async () => {
    mockGetApiKey.mockResolvedValue('sk-ant-test-key');
    render(<App />);
    await waitFor(() => {
      expect(screen.getByTestId('chat')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('MockSettings'));
    expect(screen.getByTestId('settings')).toBeInTheDocument();

    fireEvent.click(screen.getByText('MockBack'));
    expect(screen.getByTestId('chat')).toBeInTheDocument();
  });

  it('navigates to debug and back', async () => {
    mockGetApiKey.mockResolvedValue('sk-ant-test-key');
    render(<App />);
    await waitFor(() => {
      expect(screen.getByTestId('chat')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('MockDebug'));
    expect(screen.getByTestId('debug')).toBeInTheDocument();

    fireEvent.click(screen.getByText('MockDebugBack'));
    expect(screen.getByTestId('chat')).toBeInTheDocument();
  });

  it('navigates to needs-key when key is cleared from settings', async () => {
    mockGetApiKey.mockResolvedValue('sk-ant-test-key');
    render(<App />);
    await waitFor(() => {
      expect(screen.getByTestId('chat')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('MockSettings'));
    expect(screen.getByTestId('settings')).toBeInTheDocument();

    fireEvent.click(screen.getByText('MockClearKey'));
    expect(screen.getByTestId('api-key-form')).toBeInTheDocument();
  });
});
