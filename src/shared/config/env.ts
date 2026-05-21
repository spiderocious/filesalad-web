// Centralised env access. Read import.meta.env here and nowhere else, so a
// missing/renamed variable surfaces in one place.
const DEFAULT_API_BASE_URL = 'http://localhost:8096';

export const ENV = {
  // The backend base URL. Falls back to local dev. The API client appends
  // `/api/v1` (see endpoints), so this is the bare origin.
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL ?? DEFAULT_API_BASE_URL,
} as const;
