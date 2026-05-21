import { useEffect, useState } from 'react';

import { useHistory } from '../providers/history-provider.tsx';

interface SidebarState {
  readonly isOpen: boolean;
  readonly open: () => void;
  readonly close: () => void;
  readonly toggle: () => void;
}

// History sidebar visibility. Default state follows whether the user has ever
// uploaded: closed for a first-time visitor, open if there's history — decided
// once, after the initial IndexedDB read resolves, then user-controlled.
export function useSidebarState(): SidebarState {
  const { entries, isLoaded } = useHistory();
  const [isOpen, setIsOpen] = useState(false);
  const [seeded, setSeeded] = useState(false);

  useEffect(() => {
    if (isLoaded && !seeded) {
      setIsOpen(entries.length > 0);
      setSeeded(true);
    }
  }, [isLoaded, seeded, entries.length]);

  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    toggle: () => setIsOpen((v) => !v),
  };
}
