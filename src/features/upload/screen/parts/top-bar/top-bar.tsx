import { PanelRightClose, PanelRightOpen } from '@icons';

import { Logo } from '@shared/ui/logo/logo.tsx';

interface TopBarProps {
  readonly isSidebarOpen: boolean;
  readonly onToggleSidebar: () => void;
}

// Sits on top of the brand gradient: white wordmark left, a history toggle
// right (mirrors the screenshot's top-right control slot).
export function TopBar({ isSidebarOpen, onToggleSidebar }: TopBarProps) {
  const ToggleIcon = isSidebarOpen ? PanelRightClose : PanelRightOpen;
  return (
    <header className="flex items-center justify-between px-6 py-5">
      <Logo tone="inverse" />
      <button
        type="button"
        onClick={onToggleSidebar}
        aria-label={isSidebarOpen ? 'Hide history' : 'Show history'}
        aria-pressed={isSidebarOpen}
        className="inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-sm font-medium text-[var(--fs-text)] shadow-sm transition hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
      >
        <ToggleIcon size={16} aria-hidden="true" />
        History
      </button>
    </header>
  );
}
