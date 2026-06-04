// Centralised env access. Read import.meta.env here and nowhere else, so a
// missing/renamed variable surfaces in one place. Both URLs are configurable via
// Vite env vars (VITE_API_BASE_URL, VITE_WEB_BASE_URL) with local-dev defaults.
const DEFAULT_API_BASE_URL = 'http://localhost:8096';
const DEFAULT_WEB_BASE_URL = 'http://localhost:5173';

const LOCAL_ENV = {
  API_BASE_URL: DEFAULT_API_BASE_URL,
  WEB_BASE_URL: DEFAULT_WEB_BASE_URL,
} as const;

const PROD_ENV = {
  API_BASE_URL: 'https://file-salad-api-service-production.up.railway.app',
  WEB_BASE_URL: 'https://usefilesalad.xyz',
} as const;

const IS_LOCAL = false //import.meta.env.MODE === 'development';

export const ENV = IS_LOCAL ? LOCAL_ENV : PROD_ENV;

// Shareable short link for a code, e.g. https://filesalad.app/s/K7M2QPF.
export function shareLink(code: string): string {
  return `${ENV.WEB_BASE_URL.replace(/\/$/, '')}/s/${code}`;
}

export const PRIVACY_URL = `${ENV.WEB_BASE_URL.replace(/\/$/, '')}/privacy`;
