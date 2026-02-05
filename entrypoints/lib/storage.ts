import { storage } from 'wxt/utils/storage';

const apiKeyItem = storage.defineItem<string>('local:anthropicApiKey');

// In development, use env var as fallback so we don't have to re-enter key on every reload
const DEV_API_KEY = import.meta.env.WXT_DEV_ANTHROPIC_API_KEY as string | undefined;

export async function getApiKey(): Promise<string | null> {
  const value = await apiKeyItem.getValue();
  if (value) {
    console.log('[Paneless storage] getApiKey: found in storage');
    return value;
  }
  if (import.meta.env.DEV && DEV_API_KEY) {
    console.log('[Paneless storage] getApiKey: using dev env var');
    return DEV_API_KEY;
  }
  console.log('[Paneless storage] getApiKey: null');
  return null;
}

export async function setApiKey(key: string): Promise<void> {
  console.log('[Paneless storage] setApiKey called');
  await apiKeyItem.setValue(key);
  // Verify the write worked
  const verify = await apiKeyItem.getValue();
  console.log('[Paneless storage] setApiKey verify:', verify ? 'success' : 'FAILED');
}

export async function removeApiKey(): Promise<void> {
  await apiKeyItem.removeValue();
}

export function watchApiKey(cb: (newValue: string | null) => void): () => void {
  return apiKeyItem.watch(cb);
}
