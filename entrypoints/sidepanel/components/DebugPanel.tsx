import { useState, useEffect, useCallback } from 'react';
import {
  buildSystemPrompt,
  fetchPageContent,
  getPageContextMode,
  type PageContent,
  type PageContextMode,
} from '../../lib/page-content';
import './DebugPanel.css';

export default function DebugPanel({ onBack }: { onBack: () => void }) {
  const [mode, setMode] = useState<PageContextMode | null>(null);
  const [pageContent, setPageContent] = useState<PageContent | null>(null);
  const [systemPrompt, setSystemPrompt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [m, content, prompt] = await Promise.all([
        getPageContextMode(),
        fetchPageContent(),
        buildSystemPrompt(),
      ]);
      setMode(m);
      setPageContent(content);
      setSystemPrompt(prompt);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <div className="debug-container">
      <div className="debug-header">
        <button className="debug-back-button" onClick={onBack}>
          Back
        </button>
        <span className="debug-title">Debug</span>
        <button className="debug-refresh-button" onClick={refresh}>
          Refresh
        </button>
      </div>
      <div className="debug-content">
        {loading && <p className="debug-loading">Loading...</p>}
        {error && <p className="debug-error">Error: {error}</p>}
        {!loading && !error && (
          <>
            <div className="debug-section">
              <h3>Page Context Mode</h3>
              <p className="debug-value">{mode}</p>
            </div>
            <div className="debug-section">
              <h3>Page Info</h3>
              {pageContent ? (
                <>
                  <p className="debug-value">
                    <strong>Title:</strong> {pageContent.title || '(empty)'}
                  </p>
                  <p className="debug-value">
                    <strong>URL:</strong> {pageContent.url || '(empty)'}
                  </p>
                  <p className="debug-value">
                    <strong>Content length:</strong>{' '}
                    {pageContent.textContent.length.toLocaleString()} chars
                  </p>
                </>
              ) : (
                <p className="debug-value">
                  No page content available (content script may not be injected
                  on this page)
                </p>
              )}
            </div>
            <div className="debug-section">
              <h3>System Prompt Preview</h3>
              {systemPrompt ? (
                <pre className="debug-pre">{systemPrompt}</pre>
              ) : (
                <p className="debug-value">
                  No system prompt (mode is off or no page content)
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
