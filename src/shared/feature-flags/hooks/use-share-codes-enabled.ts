import { useFeatureFlags } from '../feature-flags-provider.tsx';

// Are share codes (mint + redeem) enabled?
//
// Gates: the Upload | Have a code tabs, the per-result Share button, the
// per-history-row Share button, and the /s/:code deep-link auto-redeem.
// Default: OFF until the server flips it on (per the flag-API contract).
export function useShareCodesEnabled(): boolean {
  return useFeatureFlags().flags.shouldShowCodes;
}
