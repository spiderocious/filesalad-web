import { Clock } from '@icons';

import { useDrawer } from '@shared/ui/drawer/drawer-host.tsx';

import { useHistory } from '../../../providers/history-provider.tsx';
import { HistoryList } from '../history/history-list.tsx';

// Mobile-only history: a bar docked to the bottom of the screen. Tapping it
// raises the history drawer (~80% of the screen). On desktop history is the
// right sidebar instead, so this is hidden at md+.
export function MobileHistory() {
  const drawer = useDrawer();
  const { entries } = useHistory();

  return (
    <button
      type="button"
      onClick={() => drawer.open(<HistoryList />, { title: 'History', height: '80%' })}
      className="flex w-full items-center justify-center gap-2 border-t border-white/30 bg-white/85 py-3 text-sm font-medium text-[var(--fs-text)] backdrop-blur transition hover:bg-white md:hidden"
    >
      <Clock size={15} aria-hidden="true" />
      History ({entries.length})
    </button>
  );
}
