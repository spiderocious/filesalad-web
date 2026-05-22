// DTOs for the anonymous web upload surface (docs/api-docs.md §4 + url-expiry.md).

export interface WebPresignResponse {
  readonly upload_id: string;
  readonly key: string;
  readonly upload_url: string;
  readonly public_url: string;
  // Absolute expiry of public_url (RFC3339) — the field to trust for staleness.
  // `expires_in` is deprecated (it refers to upload_url). New backends send
  // public_url_expires_at; older ones may not, so it's optional.
  readonly public_url_expires_at?: string;
  readonly remaining: number;
}

// Fresh download URL from GET /web/uploads/:id/download.
export interface WebDownloadResponse {
  readonly download_url: string;
  readonly expires_in: number;
  readonly expires_at: string;
}

// POST /share → a short, shareable code (default 24h).
export interface ShareCodeResponse {
  readonly code: string;
  readonly expires_in: number;
}

// GET /share/:code → the redeemed file's download URL (presigned, ~2h).
export interface RedeemResponse {
  readonly filename: string;
  readonly download_url: string;
  readonly expires_in: number;
  readonly expires_at: string;
  readonly cached: boolean;
}

export interface WebUsage {
  readonly used: number;
  readonly limit: number;
  readonly remaining: number;
}

// The result the UI cares about after a successful upload.
export interface UploadResult {
  readonly uploadId: string;
  readonly key: string;
  readonly publicUrl: string;
  readonly publicUrlExpiresAt: string;
  readonly filename: string;
  readonly size: number;
  readonly remaining: number;
}
