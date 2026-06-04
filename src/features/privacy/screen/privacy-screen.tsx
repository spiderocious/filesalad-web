import { Link } from 'react-router-dom';

import { ROUTES } from '@shared/constants/routes';
import { useDocumentMeta } from '@shared/seo/use-document-meta.ts';
import { Logo } from '@shared/ui/logo/logo.tsx';

interface SectionProps {
  readonly title: string;
  readonly children: React.ReactNode;
}

function Section({ title, children }: SectionProps) {
  return (
    <section className="mt-6">
      <h2 className="text-base font-semibold text-[var(--fs-text)]">{title}</h2>
      <p className="mt-1.5 text-sm leading-relaxed text-[var(--fs-text-secondary)]">{children}</p>
    </section>
  );
}

// The privacy policy, in plain language. Linked from the web footer and from the
// desktop app's settings. The whole point of FileSalad is "we don't keep your
// stuff" — this page makes the specifics legible.
export function PrivacyScreen() {
  useDocumentMeta({
    title: 'Privacy — FileSalad',
    description:
      'How FileSalad handles your files: short-lived links, files never held on our servers, local opt-in history, no tracking.',
    path: '/privacy',
    robots: 'index',
  });
  return (
    <main className="mx-auto min-h-screen max-w-2xl bg-[var(--fs-bg)] px-6 py-12">
      <Link to={ROUTES.HOME} className="inline-block">
        <Logo />
      </Link>

      <h1 className="mt-6 text-2xl font-semibold text-[var(--fs-text)]">Privacy</h1>
      <p className="mt-2 text-sm text-[var(--fs-text-secondary)]">
        FileSalad turns a file into a link. We try to keep as little as possible.
      </p>

      <Section title="Links are short-lived, not permanent">
        Every link FileSalad gives you is a temporary, signed URL — not a permanent
        public link. Download links last about 2 hours; you can always refresh them.
        The underlying file is removed after about 90 days.
      </Section>

      <Section title="We never hold your files">
        Your file goes straight from your device to storage using a one-time signed
        URL — the FileSalad backend never receives the bytes of your file.
      </Section>

      <Section title="History stays on your device — and it's off by default">
        If you turn on history, the list of your links is stored only in this
        browser. FileSalad never sees it, and you can clear it any time. It&apos;s
        off unless you choose to turn it on.
      </Section>

      <Section title="Share codes">
        A share code is a short code anyone can use to download a file for 24 hours.
        Codes are only created when you ask for one. After 24 hours the code stops
        working.
      </Section>

      <Section title="The free web limit">
        To curb abuse, anonymous web uploads are capped per browser (roughly by your
        network address and a browser fingerprint). This is a best-effort limit, not
        a way to identify you.
      </Section>

      <Section title="What we don't do (yet)">
        We don&apos;t scan or moderate file contents in this version. Don&apos;t use
        FileSalad to share anything unlawful.
      </Section>

      <p className="mt-8 text-xs text-[var(--fs-text-tertiary)]">
        Questions about your data? This page reflects how the app works today and may
        change as features ship.
      </p>
    </main>
  );
}
