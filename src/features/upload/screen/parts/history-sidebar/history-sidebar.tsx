import { UploadHistoryItem, UsageMeter, toast } from 'file-salad-ui-lib';
import { Repeat, Show } from 'meemaw';

import { Clock, X } from '@icons';

import { useHistory } from '../../../providers/history-provider.tsx';
import { useWebUsage } from '../../../api/use-web-usage.ts';

interface HistorySidebarProps {
  readonly onClose: () => void;
}

const FALLBACK_CAP = 50;

// Right-hand history panel (desktop). Closeable; the screen controls mount/open
// state. Rows + usage come from the FileSalad UI library. On mobile the history
// lives at the bottom instead (mobile-history) — this panel is hidden there.
export function HistorySidebar({ onClose }: HistorySidebarProps) {
  const { entries } = useHistory();
  const usage = useWebUsage();

  return (
    <aside className="flex h-full w-80 flex-col border-l border-[var(--fs-border)] bg-[var(--fs-bg)]">
      <div className="flex items-center justify-between border-b border-[var(--fs-border)] px-4 py-3">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold text-[var(--fs-text)]">
          <Clock size={15} aria-hidden="true" />
          History
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close history"
          className="rounded-md p-1 text-[var(--fs-text-secondary)] hover:bg-[var(--fs-surface-hover)] hover:text-[var(--fs-text)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--fs-accent)]"
        >
          <X size={16} aria-hidden="true" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-3">
        <Show
          when={entries.length > 0}
          fallback={
            <p className="px-2 py-8 text-center text-sm text-[var(--fs-text-tertiary)]">
              No uploads yet. Your links will show up here.
            </p>
          }
        >
          <ul className="flex flex-col gap-2">
            <Repeat each={[...entries]}>
              {(entry) => (
                <li key={entry.id}>
                  <UploadHistoryItem
                    filename={entry.filename}
                    url={entry.url}
                    size={entry.size}
                    timestamp={entry.timestamp}
                    onCopy={() => toast.success('Link copied')}
                  />
                </li>
              )}
            </Repeat>
          </ul>
        </Show>
      </div>

      <div className="border-t border-[var(--fs-border)] px-4 py-3">
        <UsageMeter
          used={usage.data?.used ?? 0}
          total={usage.data?.limit ?? FALLBACK_CAP}
          label="Uploads this month"
        />
      </div>
    </aside>
  );
}
