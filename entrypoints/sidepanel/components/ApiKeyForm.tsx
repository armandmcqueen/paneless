import { useState } from 'react';
import { setApiKey } from '../../lib/storage';
import './ApiKeyForm.css';

export default function ApiKeyForm({ onSaved }: { onSaved: () => void }) {
  const [key, setKey] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = key.trim();

    if (!trimmed) {
      setError('API key is required');
      return;
    }
    if (!trimmed.startsWith('sk-ant-')) {
      setError('API key must start with sk-ant-');
      return;
    }

    setSaving(true);
    setError('');
    await setApiKey(trimmed);
    onSaved();
  }

  return (
    <div className="api-key-form-container">
      <h2>Anthropic API Key</h2>
      <p className="api-key-description">
        Enter your API key to start chatting with Claude.
      </p>
      <form className="api-key-form" onSubmit={handleSubmit}>
        <input
          type="password"
          className="api-key-input"
          placeholder="sk-ant-..."
          value={key}
          onChange={(e) => {
            setKey(e.target.value);
            setError('');
          }}
          autoFocus
        />
        {error && <p className="api-key-error">{error}</p>}
        <button type="submit" className="api-key-submit" disabled={saving}>
          {saving ? 'Saving...' : 'Save'}
        </button>
      </form>
    </div>
  );
}
