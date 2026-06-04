import { useFeatureFlags } from '../feature-flags-provider.tsx';

// Is BYO-bucket (electron-only) supported?
//
// Web has no BYOK surface, so this hook always returns the flag value but
// nothing on web consumes it. Kept in the shared spine so the same hook name
// works on both apps. Default: OFF.
export function useByokEnabled(): boolean {
  return useFeatureFlags().flags.shouldSupportByok;
}
