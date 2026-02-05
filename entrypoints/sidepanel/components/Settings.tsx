import { removeApiKey } from '../../lib/storage';
import './Settings.css';

export default function Settings({
  onBack,
  onKeyCleared,
}: {
  onBack: () => void;
  onKeyCleared: () => void;
}) {
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
      </div>
    </div>
  );
}
