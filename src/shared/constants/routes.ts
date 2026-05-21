// Single source of truth for all route paths. Never inline path strings in a
// <Link> or navigate() call — always reference ROUTES.
export const ROUTES = {
  HOME: '/',
} as const;
