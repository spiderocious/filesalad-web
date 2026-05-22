import { CopyableLink, Button, toast } from 'file-salad-ui-lib';

import { LinkIcon } from '@icons';

interface ResultPanelProps {
  readonly title: string;
  readonly filename?: string;
  // The public/download URL to copy + open.
  readonly url: string;
  // Label for the reset action (e.g. "Send another file" / "Redeem another").
  readonly resetLabel: string;
  readonly onReset: () => void;
}

// Shared result surface for both a finished upload and a redeemed code: shows the
// link with copy, plus an Open button (opens the URL in a new tab), and a reset.
export function ResultPanel({ title, filename, url, resetLabel, onReset }: ResultPanelProps) {
  return (
    <div className="w-full rounded-xl bg-white/95 p-4 shadow-lg">
      <p className="mb-2 text-center text-sm font-medium text-[var(--fs-text)]">{title}</p>
      {filename ? (
        <p className="mb-2 truncate text-center text-xs text-[var(--fs-text-secondary)]">
          {filename}
        </p>
      ) : null}

      <CopyableLink url={url} onCopy={() => toast.success('Link copied')} />

      <Button
        variant="secondary"
        className="mt-2 w-full"
        leadingIcon={<LinkIcon size={14} />}
        onClick={() => window.open(url, '_blank', 'noopener,noreferrer')}
      >
        Open
      </Button>

      <button
        type="button"
        onClick={onReset}
        className="mt-3 w-full text-center text-xs font-medium text-[var(--fs-accent)] hover:underline"
      >
        {resetLabel}
      </button>
    </div>
  );
}
