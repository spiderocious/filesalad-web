import { UsageMeter } from 'file-salad-ui-lib';
import { Repeat, Show } from 'meemaw';

import { useHistory } from '../../../providers/history-provider.tsx';
import { useWebUsage } from '../../../api/use-web-usage.ts';
import { HistoryRow } from './history-row.tsx';
import { HistorySettings } from './history-settings.tsx';

const FALLBACK_CAP = 50;

// History drawer body. History is opt-in (off by default) — when off we show the
// privacy toggle + an explainer instead of rows. When on, the local rows render
// with expiry-aware copy. Usage meter is always shown (server-authoritative).
export function HistoryList() {
  const { entries, enabled } = useHistory();
  const usage = useWebUsage();

  return (
    <div className="flex flex-col gap-4">
      <HistorySettings />

      <Show
        when={enabled}
        fallback={
          <p className="py-6 text-center text-sm text-[var(--fs-text-tertiary)]">
            History is off. Turn it on above to keep a list of your links on this device.
          </p>
        }
      >
        <Show
          when={entries.length > 0}
          fallback={
            <p className="py-6 text-center text-sm text-[var(--fs-text-tertiary)]">
              No uploads yet. Your links will show up here.
            </p>
          }
        >
          <ul className="flex flex-col gap-2">
            <Repeat each={[...entries]}>
              {(entry) => <HistoryRow key={entry.id} entry={entry} />}
            </Repeat>
          </ul>
        </Show>
      </Show>

      <div className="border-t border-[var(--fs-border)] pt-3">
        <UsageMeter
          used={usage.data?.used ?? 0}
          total={usage.data?.limit ?? FALLBACK_CAP}
          label="Uploads this month"
        />
      </div>
    </div>
  );
}
