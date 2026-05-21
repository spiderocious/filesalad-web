// Single source of truth for backend paths (relative to {API_BASE_URL}/api/v1).
// Never inline a URL in a hook or component — reference EP. The web one-pager
// only touches the anonymous /web/* surface (no auth, no BYO).
export const EP = {
  WEB: {
    PRESIGN: '/web/uploads/presign',
    USAGE: '/web/usage',
    DOWNLOAD: (id: string) => `/web/uploads/${id}/download`,
  },
} as const;
