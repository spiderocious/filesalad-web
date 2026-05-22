// Per docs/url-expiry.md: every file URL is presigned and short-lived (download
// URLs ~2h). We cache a URL + its absolute expiry and refetch when stale.

// Refetch when within this margin of expiry, to tolerate client clock skew and
// avoid handing out a URL that dies in transit (doc's recommendation).
export const EXPIRY_SKEW_MS = 60_000;

// True when there's no usable cached URL, or it's at/within the skew margin of
// expiry. A missing expiry (legacy rows) counts as expired → forces a refetch.
export function isUrlExpired(expiresAt: string | null | undefined): boolean {
  if (!expiresAt) return true;
  const expiryMs = Date.parse(expiresAt);
  if (Number.isNaN(expiryMs)) return true;
  return Date.now() >= expiryMs - EXPIRY_SKEW_MS;
}
