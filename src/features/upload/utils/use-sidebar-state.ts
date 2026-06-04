import { useCallback, useRef, useState } from 'react';

interface SidebarState {
  readonly isOpen: boolean;
  readonly open: () => void;
  readonly close: () => void;
  readonly toggle: () => void;
}

// History sidebar visibility. Default state follows whether the user has ever
// uploaded: closed for a first-time visitor, open if there's history — decided
// once, after the initial IndexedDB read resolves. A `settled` ref guards the
// seed so an explicit user action (or a late-resolving read) can never clobber
// the user's choice — checked synchronously, so there's no effect/click race.
export function useSidebarState(): SidebarState {
  const [isOpen, setIsOpen] = useState(false);
  const settled = useRef(false);

  const open = useCallback(() => {
    settled.current = true;
    setIsOpen(true);
  }, []);
  const close = useCallback(() => {
    settled.current = true;
    setIsOpen(false);
  }, []);
  const toggle = useCallback(() => {
    settled.current = true;
    setIsOpen((v) => !v);
  }, []);

  return { isOpen, open, close, toggle };
}
