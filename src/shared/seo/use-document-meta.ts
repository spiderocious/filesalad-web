import { useEffect } from 'react';

import { ENV } from '@shared/config/env';

export interface DocumentMeta {
  readonly title: string;
  readonly description: string;
  // The route's path relative to WEB_BASE_URL — used for the canonical link and
  // og:url. Defaults to the current location's pathname.
  readonly path?: string;
  // 'noindex' for routes that shouldn't enter search results (e.g. /s/:code
  // bearer-URL pages). Defaults to 'index'.
  readonly robots?: 'index' | 'noindex';
}

const DEFAULT_TITLE = 'FileSalad — Drop a file, get a public link';
const DEFAULT_DESC =
  'Turn any file into a short, shareable link in two clicks. No signup, links expire automatically.';

function setOrCreateMeta(selector: string, attr: 'name' | 'property', value: string, content: string): void {
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, value);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setOrCreateLink(rel: string, href: string): void {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

// Per-route document meta. Updates <title>, the standard meta description, the
// OG/Twitter title+description+url, the canonical link, and the robots policy.
// On unmount, restores the static defaults from index.html so a back-nav doesn't
// leak the previous route's meta.
export function useDocumentMeta({
  title,
  description,
  path,
  robots = 'index',
}: DocumentMeta): void {
  useEffect(() => {
    const previousTitle = document.title;
    const url = `${ENV.WEB_BASE_URL.replace(/\/$/, '')}${path ?? window.location.pathname}`;

    document.title = title;
    setOrCreateMeta('meta[name="description"]', 'name', 'description', description);
    setOrCreateMeta('meta[property="og:title"]', 'property', 'og:title', title);
    setOrCreateMeta('meta[property="og:description"]', 'property', 'og:description', description);
    setOrCreateMeta('meta[property="og:url"]', 'property', 'og:url', url);
    setOrCreateMeta('meta[name="twitter:title"]', 'name', 'twitter:title', title);
    setOrCreateMeta('meta[name="twitter:description"]', 'name', 'twitter:description', description);
    setOrCreateMeta(
      'meta[name="robots"]',
      'name',
      'robots',
      robots === 'noindex' ? 'noindex, follow' : 'index, follow',
    );
    setOrCreateLink('canonical', url);

    return () => {
      // Restore the static defaults; consumers of a back-nav land on the
      // index.html-shipped values rather than the unmounting route's strings.
      document.title = previousTitle;
      setOrCreateMeta('meta[name="description"]', 'name', 'description', DEFAULT_DESC);
      setOrCreateMeta('meta[property="og:title"]', 'property', 'og:title', DEFAULT_TITLE);
      setOrCreateMeta('meta[property="og:description"]', 'property', 'og:description', DEFAULT_DESC);
      setOrCreateMeta('meta[name="twitter:title"]', 'name', 'twitter:title', DEFAULT_TITLE);
      setOrCreateMeta('meta[name="twitter:description"]', 'name', 'twitter:description', DEFAULT_DESC);
      setOrCreateMeta('meta[name="robots"]', 'name', 'robots', 'index, follow');
    };
  }, [title, description, path, robots]);
}
