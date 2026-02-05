import { describe, it, expect } from 'vitest';
import { getApiKey, setApiKey, removeApiKey } from '../../entrypoints/lib/storage';

describe('storage', () => {
  it('returns null when no key is set', async () => {
    expect(await getApiKey()).toBeNull();
  });

  it('stores and retrieves an API key', async () => {
    await setApiKey('sk-ant-test-key');
    expect(await getApiKey()).toBe('sk-ant-test-key');
  });

  it('removes an API key', async () => {
    await setApiKey('sk-ant-test-key');
    await removeApiKey();
    expect(await getApiKey()).toBeNull();
  });
});
