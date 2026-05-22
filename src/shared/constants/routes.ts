// Single source of truth for all route paths. Never inline path strings in a
// <Link> or navigate() call — always reference ROUTES.
export const ROUTES = {
  HOME: '/',
  PRIVACY: '/privacy',
  // Share-code deep link, e.g. /s/K7M2QPF — opens the redeem flow.
  SHARE: '/s/:code',
} as const;
