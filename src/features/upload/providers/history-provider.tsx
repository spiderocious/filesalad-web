import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';

import { appendHistory, readAllHistory } from '../utils/history-db.ts';
import type { HistoryEntry } from '../types/history.ts';

interface HistoryContextValue {
  readonly entries: readonly HistoryEntry[];
  // True once the initial IndexedDB read has resolved — consumers wait for this
  // before deriving "has the user ever uploaded?" (sidebar default-open).
  readonly isLoaded: boolean;
  readonly addEntry: (entry: HistoryEntry) => void;
}

const HistoryContext = createContext<HistoryContextValue | null>(null);

export function HistoryProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<readonly HistoryEntry[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    readAllHistory()
      .then((rows) => {
        if (active) setEntries(rows);
      })
      .catch(() => {
        // A blocked/unavailable IndexedDB shouldn't break the page — history is
        // a convenience cache, never the source of truth.
      })
      .finally(() => {
        if (active) setIsLoaded(true);
      });
    return () => {
      active = false;
    };
  }, []);

  const addEntry = useCallback((entry: HistoryEntry) => {
    setEntries((prev) => [entry, ...prev]);
    void appendHistory(entry);
  }, []);

  return (
    <HistoryContext.Provider value={{ entries, isLoaded, addEntry }}>
      {children}
    </HistoryContext.Provider>
  );
}

export function useHistory(): HistoryContextValue {
  const ctx = useContext(HistoryContext);
  if (!ctx) throw new Error('useHistory must be used within HistoryProvider');
  return ctx;
}
