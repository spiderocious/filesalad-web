import { PanelRightClose, PanelRightOpen } from '@icons';

import { Logo } from '@shared/ui/logo/logo.tsx';
import { Link } from 'react-router-dom';
import { ROUTES } from '@shared/constants/routes';

interface TopBarProps {
  readonly isSidebarOpen: boolean;
  readonly onToggleSidebar: () => void;
}

// Sits on top of the brand gradient: white wordmark left, a history toggle
// right. The toggle is desktop-only (it drives the right sidebar); on mobile
// history lives in a bottom bar/drawer instead, so the toggle is hidden.
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
        className="hidden items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-sm font-medium text-[var(--fs-text)] shadow-sm transition hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white md:inline-flex"
      >
        <ToggleIcon size={16} aria-hidden="true" />
        History
      </button>
      <Link
        to={ROUTES.PRIVACY}
        className="text-xs font-medium text-white/80 hover:text-white hover:underline block md:hidden"
      >
        Privacy
      </Link>
    </header>
  );
}
