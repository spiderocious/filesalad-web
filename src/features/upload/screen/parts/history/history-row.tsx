import { formatBytes, toast } from 'file-salad-ui-lib';
import { Show } from 'meemaw';

import { AlertCircle, Check, Copy, LinkIcon, Loader2 } from '@icons';
import { useShareCodesEnabled } from '@shared/feature-flags/hooks/use-share-codes-enabled';

import { useCopyHistoryUrl } from '../../../utils/use-copy-history-url.ts';
import type { HistoryEntry } from '../../../types/history.ts';
import { ShareButton } from '../drop-area/share-button.tsx';

interface HistoryRowProps {
  readonly entry: HistoryEntry;
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

// Our own history row (the lib's UploadHistoryItem can't expose the copy's
// loading/expiry step). The copy button animates Copy → spinner (while
// refetching an expired URL) → ✓ Copied, and shows an inline error if the file
// is gone. The in-button confirmation is the primary feedback since the drawer
// hides the toast.
export function HistoryRow({ entry }: HistoryRowProps) {
  const codesEnabled = useShareCodesEnabled();
  const { status, errorMessage, copy } = useCopyHistoryUrl();
  const meta = [formatBytes(entry.size), formatTime(entry.timestamp)].filter(Boolean).join(' · ');

  return (
    <div className="rounded-lg border border-[var(--fs-border)] bg-[var(--fs-bg)] px-3 py-2.5">
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-[var(--fs-text)]">{entry.filename}</p>
          <p className="text-xs text-[var(--fs-text-tertiary)]">{meta}</p>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={() => window.open(entry.cachedUrl, '_blank', 'noopener,noreferrer')}
            aria-label="Open link"
            className="rounded-full p-1.5 text-[var(--fs-text-secondary)] hover:bg-[var(--fs-surface-hover)] hover:text-[var(--fs-text)]"
          >
            <LinkIcon size={14} aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={() => {
              copy(entry);
              toast.success('Link copied');
            }}
            disabled={status === 'loading'}
            aria-label={status === 'copied' ? 'Copied' : 'Copy link'}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              status === 'copied'
                ? 'bg-[var(--fs-accent-subtle)] text-[var(--fs-accent-active)]'
                : 'bg-[var(--fs-surface)] text-[var(--fs-text)] hover:bg-[var(--fs-surface-hover)]'
            }`}
          >
            <Show
              when={status !== 'loading'}
              fallback={<Loader2 size={13} className="animate-spin" aria-hidden="true" />}
            >
              <Show when={status === 'copied'} fallback={<Copy size={13} aria-hidden="true" />}>
                <Check size={13} className="fs-copy-pop" aria-hidden="true" />
              </Show>
            </Show>
            {status === 'copied' ? 'Copied' : status === 'loading' ? 'Refreshing…' : 'Copy'}
          </button>
        </div>
      </div>

      <Show when={status === 'error' && Boolean(errorMessage)}>
        <p role="alert" className="mt-2 flex items-center gap-1.5 text-xs text-[var(--fs-error)]">
          <AlertCircle size={13} aria-hidden="true" />
          {errorMessage}
        </p>
      </Show>

      <Show when={codesEnabled}>
        <div className="mt-2">
          <ShareButton uploadId={entry.id} />
        </div>
      </Show>
    </div>
  );
}
