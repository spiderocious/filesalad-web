import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';

import { appendHistory, clearAllHistory, readAllHistory } from '../utils/history-db.ts';
import {
  hasSeenHistoryPrompt,
  markHistoryPromptSeen,
  readHistoryEnabled,
  writeHistoryEnabled,
} from '../utils/history-preference.ts';
import type { HistoryEntry } from '../types/history.ts';

interface HistoryContextValue {
  readonly entries: readonly HistoryEntry[];
  // True once the initial IndexedDB read has resolved.
  readonly isLoaded: boolean;
  // Whether the user has opted in to keeping a local history. OFF by default —
  // we don't write or show history unless this is true.
  readonly enabled: boolean;
  readonly setEnabled: (enabled: boolean) => void;
  // Whether the first-run nudge should be offered (first upload, undecided).
  readonly shouldPromptOptIn: boolean;
  readonly dismissPrompt: () => void;
  readonly addEntry: (entry: HistoryEntry) => void;
  readonly updateEntry: (id: string, patch: Partial<HistoryEntry>) => void;
  readonly clearAll: () => void;
}

const HistoryContext = createContext<HistoryContextValue | null>(null);

export function HistoryProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<readonly HistoryEntry[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [enabled, setEnabledState] = useState<boolean>(() => readHistoryEnabled());
  const [promptSeen, setPromptSeen] = useState<boolean>(() => hasSeenHistoryPrompt());

  // Only ever read stored history when the user has opted in.
  useEffect(() => {
    if (!enabled) {
      setIsLoaded(true);
      return undefined;
    }
    let active = true;
    readAllHistory()
      .then((rows) => {
        if (!active) return;
        setEntries((pending) => {
          const byId = new Map(rows.map((r) => [r.id, r]));
          for (const p of pending) byId.set(p.id, p);
          return [...byId.values()].sort((a, b) => b.timestamp.localeCompare(a.timestamp));
        });
      })
      .catch(() => {
        // A blocked/unavailable IndexedDB shouldn't break the page.
      })
      .finally(() => {
        if (active) setIsLoaded(true);
      });
    return () => {
      active = false;
    };
  }, [enabled]);

  const setEnabled = useCallback((value: boolean) => {
    writeHistoryEnabled(value);
    markHistoryPromptSeen();
    setPromptSeen(true);
    setEnabledState(value);
    // Turning history OFF wipes anything stored — leaving nothing behind.
    if (!value) {
      setEntries([]);
      void clearAllHistory();
    }
  }, []);

  const dismissPrompt = useCallback(() => {
    markHistoryPromptSeen();
    setPromptSeen(true);
  }, []);

  // Writes are no-ops while history is disabled — we never persist when off.
  const addEntry = useCallback(
    (entry: HistoryEntry) => {
      if (!enabled) return;
      setEntries((prev) => [entry, ...prev]);
      void appendHistory(entry);
    },
    [enabled],
  );

  const updateEntry = useCallback(
    (id: string, patch: Partial<HistoryEntry>) => {
      if (!enabled) return;
      setEntries((prev) => {
        const next = prev.map((e) => (e.id === id ? { ...e, ...patch } : e));
        const updated = next.find((e) => e.id === id);
        if (updated) void appendHistory(updated);
        return next;
      });
    },
    [enabled],
  );

  const clearAll = useCallback(() => {
    setEntries([]);
    void clearAllHistory();
  }, []);

  // Offer the opt-in nudge once the user has uploaded but never chosen.
  const shouldPromptOptIn = !promptSeen;

  return (
    <HistoryContext.Provider
      value={{
        entries,
        isLoaded,
        enabled,
        setEnabled,
        shouldPromptOptIn,
        dismissPrompt,
        addEntry,
        updateEntry,
        clearAll,
      }}
    >
      {children}
    </HistoryContext.Provider>
  );
}

export function useHistory(): HistoryContextValue {
  const ctx = useContext(HistoryContext);
  if (!ctx) throw new Error('useHistory must be used within HistoryProvider');
  return ctx;
}
