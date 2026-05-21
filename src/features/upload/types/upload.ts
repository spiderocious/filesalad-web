// DTOs for the anonymous web upload surface (docs/api-docs.md §4).

export interface WebPresignResponse {
  readonly upload_id: string;
  readonly key: string;
  readonly upload_url: string;
  readonly public_url: string;
  readonly expires_in: number;
  readonly remaining: number;
}

export interface WebUsage {
  readonly used: number;
  readonly limit: number;
  readonly remaining: number;
}

// The result the UI cares about after a successful upload.
export interface UploadResult {
  readonly uploadId: string;
  readonly publicUrl: string;
  readonly filename: string;
  readonly size: number;
  readonly remaining: number;
}
