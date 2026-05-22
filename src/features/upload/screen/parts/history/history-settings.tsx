import { Button, Toggle } from 'file-salad-ui-lib';
import { Show } from 'meemaw';

import { PRIVACY_URL } from '@shared/config/env';

import { useHistory } from '../../../providers/history-provider.tsx';

// The privacy control for history. History is local-only and OFF by default —
// this makes that explicit and gives a one-click clear. Reused at the top of the
// history surface.
export function HistorySettings() {
  const { enabled, setEnabled, entries, clearAll } = useHistory();

  return (
    <div className="rounded-lg bg-[var(--fs-surface)] p-3">
      <Toggle
        checked={enabled}
        label="Keep my links on this device"
        onChange={(checked) => setEnabled(checked)}
      />
      <p className="mt-1.5 text-xs text-[var(--fs-text-secondary)]">
        Stored only in this browser — FileSalad never sees it.{' '}
        <a
          href={PRIVACY_URL}
          target="_blank"
          rel="noreferrer"
          className="font-medium text-[var(--fs-accent)] hover:underline"
        >
          Privacy
        </a>
      </p>

      <Show when={enabled && entries.length > 0}>
        <Button variant="quiet" size="sm" className="mt-2" onClick={clearAll}>
          Clear history
        </Button>
      </Show>
    </div>
  );
}
