import { Button } from 'file-salad-ui-lib';
import { Show } from 'meemaw';

import { useHistory } from '../../../providers/history-provider.tsx';

// One-time, contextual nudge after the first upload: offer to keep a local
// history. Only shows while the user hasn't decided (shouldPromptOptIn) and
// history is currently off. Choosing either way dismisses it for good.
export function OptInNudge() {
  const { shouldPromptOptIn, enabled, setEnabled, dismissPrompt } = useHistory();

  return (
    <Show when={shouldPromptOptIn && !enabled}>
      <div className="rounded-lg border border-[var(--fs-border)] bg-[var(--fs-surface)] p-3 text-center">
        <p className="text-xs text-[var(--fs-text-secondary)]">
          Want to keep your links handy on this device? They never leave it.
        </p>
        <div className="mt-2 flex gap-2">
          <Button variant="primary" size="sm" className="flex-1" onClick={() => setEnabled(true)}>
            Keep history
          </Button>
          <Button variant="quiet" size="sm" className="flex-1" onClick={dismissPrompt}>
            No thanks
          </Button>
        </div>
      </div>
    </Show>
  );
}
