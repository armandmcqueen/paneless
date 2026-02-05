import { useState, useEffect } from 'react';
import { removeApiKey } from '../../lib/storage';
import {
  getPageContextMode,
  setPageContextMode,
  type PageContextMode,
} from '../../lib/page-content';
import './Settings.css';

export default function Settings({
  onBack,
  onKeyCleared,
}: {
  onBack: () => void;
  onKeyCleared: () => void;
}) {
  const [contextMode, setContextMode] = useState<PageContextMode>('text');

  useEffect(() => {
    getPageContextMode().then(setContextMode);
  }, []);

  return (
    <div className="settings-container">
      <div className="settings-header">
        <button className="settings-back-button" onClick={onBack}>
          Back
        </button>
        <span className="settings-title">Settings</span>
      </div>
      <div className="settings-content">
        <div className="settings-section">
          <h3>Anthropic API Key</h3>
          <p className="settings-description">
            Your API key is saved locally in the extension.
          </p>
          <button
            className="settings-clear-button"
            onClick={async () => {
              await removeApiKey();
              onKeyCleared();
            }}
          >
            Remove API Key
          </button>
        </div>
        <div className="settings-section">
          <h3>Page Context</h3>
          <p className="settings-description">
            When enabled, the current page content is sent to Claude with each
            message.
          </p>
          <select
            className="settings-select"
            value={contextMode}
            onChange={async (e) => {
              const mode = e.target.value as PageContextMode;
              setContextMode(mode);
              await setPageContextMode(mode);
            }}
          >
            <option value="text">Text</option>
            <option value="off">Off</option>
          </select>
        </div>
      </div>
    </div>
  );
}
