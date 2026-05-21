import { Salad } from '@icons';

interface LogoProps {
  readonly className?: string;
  // Wordmark + icon color. On the gradient backdrop the top-bar logo is white;
  // elsewhere it inherits currentColor.
  readonly tone?: 'brand' | 'inverse';
}

// Standalone brand mark so the FileSalad wordmark is reused across the top bar,
// drop area, and empty states without duplication (per idea.md).
export function Logo({ className, tone = 'brand' }: LogoProps) {
  const color = tone === 'inverse' ? 'text-white' : 'text-[var(--fs-accent)]';
  return (
    <span
      className={`inline-flex items-center gap-2 font-semibold tracking-tight ${color} ${className ?? ''}`}
      style={{ fontFamily: 'var(--fs-font-sans)' }}
    >
      <Salad size={22} aria-hidden="true" />
      <span className="text-lg">
        file<span className="font-bold">salad</span>
      </span>
    </span>
  );
}
