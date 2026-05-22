// A single local upload-history row (PRD §5.5 — web is local-only in IndexedDB).
// Per docs/url-expiry.md we store the DURABLE identifiers (uploadId/id, key,
// filename) and treat the presigned URL as a cache: cachedUrl + cachedExpiresAt.
// When the cache is stale we refetch a fresh download URL by upload id.
export interface HistoryEntry {
  // The upload id — the durable handle used to refetch a fresh URL.
  readonly id: string;
  readonly filename: string;
  // Object key stem (durable); informational, kept for completeness.
  readonly key: string;
  readonly size: number;
  // ISO 8601 upload time.
  readonly timestamp: string;
  // Cached presigned URL + its absolute expiry (RFC3339). Transient — refetched
  // when expired. May be empty for legacy rows (treated as expired).
  readonly cachedUrl: string;
  readonly cachedExpiresAt: string;
}
