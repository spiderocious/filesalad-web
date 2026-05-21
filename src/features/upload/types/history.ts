// A single local upload-history row (PRD §5.5 — web is local-only in IndexedDB:
// filename, URL, timestamp, size; lost on clearing site data).
export interface HistoryEntry {
  readonly id: string;
  readonly filename: string;
  readonly url: string;
  readonly size: number;
  // ISO 8601 timestamp.
  readonly timestamp: string;
}
