import { Show } from 'meemaw';

import { useHistory } from '../../../providers/history-provider.tsx';

// Mobile history lives at the bottom of the screen (not the right sidebar).
// STUB: the full bottom-sheet layout/animation is a focused follow-up once the
// design sketch lands. For now it renders a minimal bottom strip on small
// screens only, so the page is complete and nothing breaks. Hidden on md+.
export function MobileHistory() {
  const { entries } = useHistory();

  return (
    <Show when={entries.length > 0}>
      <div className="md:hidden">
        <div className="border-t border-[var(--fs-border)] bg-[var(--fs-bg)] px-4 py-3 text-center text-sm text-[var(--fs-text-secondary)]">
          {entries.length} recent upload{entries.length === 1 ? '' : 's'} · bottom history coming
        </div>
      </div>
    </Show>
  );
}
