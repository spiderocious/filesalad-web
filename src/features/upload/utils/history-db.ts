import type { HistoryEntry } from '../types/history.ts';

// Minimal promise wrapper over IndexedDB for the local upload history. No
// dependency — one object store keyed by id, read newest-first.
const DB_NAME = 'filesalad';
const STORE = 'history';
const DB_VERSION = 1;

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('IndexedDB open failed'));
  });
}

export async function readAllHistory(): Promise<HistoryEntry[]> {
  const db = await openDb();
  try {
    const entries = await new Promise<HistoryEntry[]>((resolve, reject) => {
      const tx = db.transaction(STORE, 'readonly');
      const request = tx.objectStore(STORE).getAll();
      request.onsuccess = () => resolve(request.result as HistoryEntry[]);
      request.onerror = () => reject(request.error ?? new Error('IndexedDB read failed'));
    });
    // Newest first — entries are appended with ISO timestamps.
    return entries.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  } finally {
    db.close();
  }
}

export async function appendHistory(entry: HistoryEntry): Promise<void> {
  const db = await openDb();
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite');
      tx.objectStore(STORE).put(entry);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error ?? new Error('IndexedDB write failed'));
    });
  } finally {
    db.close();
  }
}
