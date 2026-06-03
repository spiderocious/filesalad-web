import '@testing-library/jest-dom/vitest';
import 'fake-indexeddb/auto';
import { afterAll, afterEach, beforeAll, beforeEach } from 'vitest';

import { server } from './src/shared/test-utils/server.ts';

// jsdom in this config ships a broken localStorage (the `--localstorage-file`
// warning) — both `getItem` and `setItem` throw, so user preferences silently
// vanish. Install a tiny in-memory shim so the history-enabled / prompt-seen
// flags actually persist across reads within a test.
const store = new Map<string, string>();
Object.defineProperty(window, 'localStorage', {
  configurable: true,
  value: {
    getItem: (key: string) => (store.has(key) ? store.get(key)! : null),
    setItem: (key: string, value: string) => {
      store.set(key, String(value));
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
    clear: () => store.clear(),
    key: (index: number) => Array.from(store.keys())[index] ?? null,
    get length() {
      return store.size;
    },
  },
});
beforeEach(() => store.clear());

// Fail loudly on any request the handlers don't cover.
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
