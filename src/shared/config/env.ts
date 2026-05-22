// Centralised env access. Read import.meta.env here and nowhere else, so a
// missing/renamed variable surfaces in one place. Both URLs are configurable via
// Vite env vars (VITE_API_BASE_URL, VITE_WEB_BASE_URL) with local-dev defaults.
const DEFAULT_API_BASE_URL = 'http://localhost:8096';
const DEFAULT_WEB_BASE_URL = 'http://localhost:5173';

export const ENV = {
  // The backend base URL. The API client appends `/api/v1`, so this is the bare
  // origin.
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL ?? DEFAULT_API_BASE_URL,
  // This web app's own origin — used to build shareable links (`/s/CODE`) and
  // the privacy-policy URL.
  WEB_BASE_URL: import.meta.env.VITE_WEB_BASE_URL ?? DEFAULT_WEB_BASE_URL,
} as const;

// Shareable short link for a code, e.g. https://filesalad.app/s/K7M2QPF.
export function shareLink(code: string): string {
  return `${ENV.WEB_BASE_URL.replace(/\/$/, '')}/s/${code}`;
}

export const PRIVACY_URL = `${ENV.WEB_BASE_URL.replace(/\/$/, '')}/privacy`;
