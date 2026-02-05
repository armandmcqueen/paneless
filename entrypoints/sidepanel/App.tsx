import { useState, useEffect, Component, type ReactNode } from 'react';
import { getApiKey, watchApiKey } from '../lib/storage';
import ApiKeyForm from './components/ApiKeyForm';
import Chat from './components/Chat';
import Settings from './components/Settings';
import DebugPanel from './components/DebugPanel';
import './App.css';

class ErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error('[Paneless] React error:', error);
  }

  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

type AppState =
  | { screen: 'loading' }
  | { screen: 'needs-key' }
  | { screen: 'chat'; apiKey: string }
  | { screen: 'settings'; apiKey: string }
  | { screen: 'debug'; apiKey: string };

export default function App() {
  const [state, setState] = useState<AppState>({ screen: 'loading' });

  useEffect(() => {
    getApiKey().then((key) => {
      console.log('[Paneless] getApiKey on mount:', key ? 'found key' : 'no key');
      setState(key ? { screen: 'chat', apiKey: key } : { screen: 'needs-key' });
    }).catch((err) => {
      console.error('[Paneless] getApiKey error:', err);
      setState({ screen: 'needs-key' });
    });

    const unwatch = watchApiKey((newKey) => {
      console.log('[Paneless] watchApiKey fired:', newKey ? 'has key' : 'no key');
      if (!newKey) {
        setState({ screen: 'needs-key' });
      }
    });
    return unwatch;
  }, []);

  if (state.screen === 'loading') {
    return <div className="app-loading">Loading...</div>;
  }

  if (state.screen === 'needs-key') {
    return (
      <ApiKeyForm
        onSaved={() => {
          getApiKey().then((key) => {
            if (key) setState({ screen: 'chat', apiKey: key });
          });
        }}
      />
    );
  }

  // Keep Chat mounted (hidden) when on settings/debug to avoid assistant-ui unmount errors.
  // AssistantRuntimeProvider throws "Tried to unmount a fiber that is already unmounted"
  // if removed from the tree, so we hide instead of unmounting.
  return (
    <>
      <div style={{ display: state.screen === 'chat' ? 'contents' : 'none' }}>
        <ErrorBoundary
          fallback={
            <div className="app-loading">
              Something went wrong.{' '}
              <button onClick={() => window.location.reload()}>Reload</button>
            </div>
          }
        >
          <Chat
            apiKey={state.apiKey}
            onOpenSettings={() =>
              setState({ screen: 'settings', apiKey: state.apiKey })
            }
            onOpenDebug={() =>
              setState({ screen: 'debug', apiKey: state.apiKey })
            }
          />
        </ErrorBoundary>
      </div>
      {state.screen === 'settings' && (
        <Settings
          onBack={() => setState({ screen: 'chat', apiKey: state.apiKey })}
          onKeyCleared={() => setState({ screen: 'needs-key' })}
        />
      )}
      {state.screen === 'debug' && (
        <DebugPanel
          onBack={() => setState({ screen: 'chat', apiKey: state.apiKey })}
        />
      )}
    </>
  );
}
