// Feature flags — every UI gate that can be flipped on the server lives here.
// Adding a new flag: extend the FeatureFlags map and FlagKey union (one line
// each), write a `use-<flag>-enabled.ts` hook, and add the field to the API
// response in api-flag-source.ts. Consumers never see the source or expiry.

export interface FeatureFlags {
  // Show the share-codes UI (Upload | Have a code tabs, ShareButton, history
  // row share action, /s/:code deep-link redeem).
  readonly shouldShowCodes: boolean;
  // Show the BYO-bucket option (electron-only; web has no BYOK).
  readonly shouldSupportByok: boolean;
}

export type FlagKey = keyof FeatureFlags;

// Every flag defaults to OFF — safest for "we're shipping incomplete features
// behind a flag". On boot (before the first fetch) and on fetch failure, the
// app behaves as if the server returned all-false.
export const DEFAULT_FLAGS: FeatureFlags = {
  shouldShowCodes: false,
  shouldSupportByok: false,
};

// A FlagSource fetches a fresh flag snapshot + when the FE should refetch.
// Implementations: api-flag-source (the real /api/v1/features call), and any
// test/local source (a constant snapshot) that satisfies this contract.
export interface FlagSnapshot {
  readonly flags: FeatureFlags;
  // Epoch ms when this snapshot goes stale. The provider uses this to drive
  // React Query's staleTime so a refetch only happens when the server says.
  readonly expiresAt: number;
}

export interface FlagSource {
  fetch(): Promise<FlagSnapshot>;
}
