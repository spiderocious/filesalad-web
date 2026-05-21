import { beforeEach, describe, expect, it } from 'vitest';
import { IDBFactory } from 'fake-indexeddb';

import { appendHistory, readAllHistory } from '../history-db.ts';
import type { HistoryEntry } from '../../types/history.ts';

function entry(id: string, timestamp: string): HistoryEntry {
  return { id, filename: `${id}.png`, url: `https://x/${id}`, size: 10, timestamp };
}

describe('history-db', () => {
  beforeEach(() => {
    // Fresh IndexedDB per test.
    indexedDB = new IDBFactory();
  });

  it('returns an empty list when nothing has been stored', async () => {
    expect(await readAllHistory()).toEqual([]);
  });

  it('appends entries and reads them back newest-first', async () => {
    await appendHistory(entry('a', '2026-05-21T10:00:00.000Z'));
    await appendHistory(entry('b', '2026-05-21T12:00:00.000Z'));

    const rows = await readAllHistory();
    expect(rows.map((r) => r.id)).toEqual(['b', 'a']);
  });
});
