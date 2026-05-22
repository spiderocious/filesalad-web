import { Repeat } from 'meemaw';
import { useEffect, useRef, type ClipboardEvent, type KeyboardEvent } from 'react';

export interface OtpInputProps {
  // Number of character cells. Share codes are 7 chars by default.
  readonly length?: number;
  // The full code so far (controlled). Parent owns the string.
  readonly value: string;
  readonly onChange: (value: string) => void;
  // Fires once all `length` cells are filled.
  readonly onComplete?: (value: string) => void;
  readonly disabled?: boolean;
  readonly autoFocus?: boolean;
  // Forwarded to the wrapping group for screen readers.
  readonly 'aria-label'?: string;
}

// Confusable-free share-code alphabet: digits 2-9 and A-Z excluding I, L, O
// (and excluding 0, 1). One char per match.
const ALLOWED = /[2-9A-HJ-NP-Z]/i;

function sanitize(raw: string, max: number): string {
  let out = '';
  for (const ch of raw) {
    if (ALLOWED.test(ch)) out += ch.toUpperCase();
    if (out.length >= max) break;
  }
  return out;
}

// A beautiful, accessible 1-input-per-cell code field for redeeming a share
// code. Controlled via `value`/`onChange`; refs only manage focus. Built on
// --fs-* tokens; respects reduced motion (see `.fs-otp-pop` in styles.css).
export function OtpInput({
  length = 7,
  value,
  onChange,
  onComplete,
  disabled = false,
  autoFocus = false,
  'aria-label': ariaLabel,
}: OtpInputProps) {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const cells = Array.from({ length }, (_, i) => i);

  // Fire onComplete exactly when the value first reaches full length.
  const completedRef = useRef(false);
  useEffect(() => {
    if (value.length === length && !completedRef.current) {
      completedRef.current = true;
      onComplete?.(value);
    } else if (value.length < length) {
      completedRef.current = false;
    }
  }, [value, length, onComplete]);

  function focusCell(index: number): void {
    const clamped = Math.max(0, Math.min(length - 1, index));
    inputsRef.current[clamped]?.focus();
    inputsRef.current[clamped]?.select();
  }

  function setCharAt(index: number, char: string): string {
    const chars = value.padEnd(length, ' ').split('');
    chars[index] = char;
    // Re-sanitize and drop trailing placeholder spaces.
    return chars.join('').replace(/\s+$/g, '');
  }

  function handleChange(index: number, raw: string): void {
    const next = sanitize(raw, raw.length);
    if (next.length === 0) return;
    if (next.length > 1) {
      // Typed/IME produced multiple chars: spill across from this cell.
      const before = value.slice(0, index);
      const merged = sanitize(before + next, length);
      onChange(merged);
      focusCell(merged.length);
      return;
    }
    const updated = sanitize(setCharAt(index, next), length);
    onChange(updated);
    focusCell(index + 1);
  }

  function handleKeyDown(index: number, e: KeyboardEvent<HTMLInputElement>): void {
    if (e.key === 'Backspace') {
      e.preventDefault();
      if (value[index]) {
        onChange(sanitize(setCharAt(index, ' '), length).trimEnd());
      } else if (index > 0) {
        onChange(sanitize(setCharAt(index - 1, ' '), length).trimEnd());
        focusCell(index - 1);
      }
      return;
    }
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      focusCell(index - 1);
      return;
    }
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      focusCell(index + 1);
    }
  }

  function handlePaste(index: number, e: ClipboardEvent<HTMLInputElement>): void {
    e.preventDefault();
    const pasted = sanitize(e.clipboardData.getData('text'), length);
    if (pasted.length === 0) return;
    const merged = sanitize(value.slice(0, index) + pasted, length);
    onChange(merged);
    focusCell(merged.length);
  }

  return (
    <div
      role="group"
      aria-label={ariaLabel ?? 'Verification code'}
      className="flex items-center gap-2"
    >
      <Repeat each={cells}>
        {(i) => {
          const char = value[i] ?? '';
          const isActive = value.length === i;
          return (
            <input
              key={i}
              ref={(el) => {
                inputsRef.current[i] = el;
              }}
              type="text"
              inputMode="text"
              autoComplete="one-time-code"
              maxLength={1}
              disabled={disabled}
              autoFocus={autoFocus && i === 0}
              aria-label={`Character ${i + 1}`}
              value={char}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              onPaste={(e) => handlePaste(i, e)}
              onFocus={(e) => e.currentTarget.select()}
              className={[
                'h-12 w-10 rounded-lg border text-center text-lg font-semibold uppercase',
                'border-[var(--fs-border)] bg-[var(--fs-surface)] text-[var(--fs-text)]',
                'caret-[var(--fs-accent)] outline-none transition-colors',
                'focus-visible:border-[var(--fs-accent)] focus-visible:ring-2 focus-visible:ring-[var(--fs-accent)]',
                'disabled:cursor-not-allowed disabled:opacity-50',
                char ? 'fs-otp-pop' : '',
                isActive && !disabled ? 'fs-otp-active' : '',
              ]
                .filter(Boolean)
                .join(' ')}
            />
          );
        }}
      </Repeat>
    </div>
  );
}
