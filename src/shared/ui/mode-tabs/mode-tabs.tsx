import { Repeat } from 'meemaw';
import { useRef, type KeyboardEvent } from 'react';

export interface ModeTabOption<V extends string = string> {
  readonly value: V;
  readonly label: string;
}

export interface ModeTabsProps<V extends string = string> {
  readonly value: V;
  readonly options: readonly ModeTabOption<V>[];
  readonly onChange: (value: V) => void;
  // Forwarded to the tablist for screen readers.
  readonly 'aria-label'?: string;
}

// A compact two-option pill switcher meant to sit on top of the white drop
// card. The selected tab gets a solid light track; arrows move selection.
// Built on --fs-* tokens; transitions are color-only so reduced motion is moot.
export function ModeTabs<V extends string = string>({
  value,
  options,
  onChange,
  'aria-label': ariaLabel,
}: ModeTabsProps<V>) {
  const tabsRef = useRef<(HTMLButtonElement | null)[]>([]);

  function moveSelection(delta: number): void {
    const currentIndex = options.findIndex((o) => o.value === value);
    if (currentIndex === -1) return;
    const nextIndex = (currentIndex + delta + options.length) % options.length;
    const next = options[nextIndex];
    if (!next) return;
    onChange(next.value);
    tabsRef.current[nextIndex]?.focus();
  }

  function handleKeyDown(e: KeyboardEvent<HTMLButtonElement>): void {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      moveSelection(-1);
    } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      moveSelection(1);
    }
  }

  return (
    <div
      role="tablist"
      aria-label={ariaLabel ?? 'Mode'}
      className="inline-flex items-center gap-1 rounded-full border border-[var(--fs-border)] bg-[var(--fs-surface)] p-1 z-50"
    >
      <Repeat each={[...options]}>
        {(option, index) => {
          const selected = option.value === value;
          return (
            <button
              key={option.value}
              ref={(el) => {
                tabsRef.current[index] = el;
              }}
              type="button"
              role="tab"
              aria-selected={selected}
              tabIndex={selected ? 0 : -1}
              onClick={() => onChange(option.value)}
              onKeyDown={handleKeyDown}
              className={[
                'rounded-full px-3 py-1.5 text-xs font-medium outline-none transition-colors',
                'focus-visible:ring-2 focus-visible:ring-[var(--fs-accent)]',
                selected
                  ? 'bg-white text-[var(--fs-text)] shadow-sm'
                  : 'text-[var(--fs-text-secondary)] hover:text-[var(--fs-text)]',
              ].join(' ')}
            >
              {option.label}
            </button>
          );
        }}
      </Repeat>
    </div>
  );
}
