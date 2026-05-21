import { ToastHost } from 'file-salad-ui-lib';
import { Show } from 'meemaw';

import { HistoryProvider } from '../providers/history-provider.tsx';
import { useSidebarState } from '../utils/use-sidebar-state.ts';
import { DropArea } from './parts/drop-area/drop-area.tsx';
import { HistorySidebar } from './parts/history-sidebar/history-sidebar.tsx';
import { MobileHistory } from './parts/mobile-history/mobile-history.tsx';
import { TopBar } from './parts/top-bar/top-bar.tsx';

// Composition root. The provider owns local history; the screen content reads
// like a table of contents — backdrop, top bar, centered drop area, and the
// closeable history sidebar (bottom strip on mobile).
export function UploadScreen() {
  return (
    <HistoryProvider>
      <UploadScreenContent />
    </HistoryProvider>
  );
}

function UploadScreenContent() {
  const sidebar = useSidebarState();

  return (
    <div className="fs-backdrop flex h-screen flex-col overflow-hidden">
      <div className="flex min-h-0 flex-1">
        <div className="flex min-w-0 flex-1 flex-col">
          <TopBar isSidebarOpen={sidebar.isOpen} onToggleSidebar={sidebar.toggle} />
          <main className="flex flex-1 items-center justify-center px-6 pb-10">
            <DropArea />
          </main>
        </div>

        {/* Right sidebar on desktop; hidden on mobile (history goes to bottom). */}
        <Show when={sidebar.isOpen}>
          <div className="hidden md:block">
            <HistorySidebar onClose={sidebar.close} />
          </div>
        </Show>
      </div>

      <MobileHistory />
      <ToastHost position="bottom" />
    </div>
  );
}
