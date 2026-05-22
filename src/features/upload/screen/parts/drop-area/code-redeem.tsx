import { Show } from 'meemaw';
import { useEffect, useRef, useState } from 'react';

import { AlertCircle, Loader2 } from '@icons';
import { ApiError } from '@shared/services/api-error';
import { OtpInput } from '@shared/ui/otp-input/otp-input.tsx';

import { useRedeemCode, type RedeemedFile } from '../../../api/use-redeem-code.ts';
import { ResultPanel } from './result-panel.tsx';

const CODE_LENGTH = 7;

interface CodeRedeemProps {
  // Prefilled code from a /s/:code deep link; auto-redeems once when complete.
  readonly initialCode?: string;
}

// The "Code" tab inside the drop card: enter a share code, redeem it for the
// file's link. On success it reuses the same ResultPanel as an upload (Copy +
// Open). Errors render inline (unknown/expired code, rate-limited).
export function CodeRedeem({ initialCode = '' }: CodeRedeemProps) {
  const seed = initialCode.trim().toUpperCase().slice(0, CODE_LENGTH);
  const [code, setCode] = useState(seed);
  const [result, setResult] = useState<RedeemedFile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const redeem = useRedeemCode();
  const autoTried = useRef(false);

  function handleComplete(value: string): void {
    setError(null);
    redeem.mutate(value, {
      onSuccess: (file) => setResult(file),
      onError: (err) => {
        if (err instanceof ApiError && err.is('rate_limited')) {
          setError('Too many attempts. Please wait a moment and try again.');
        } else {
          setError("That code didn't work. It may be wrong or expired.");
        }
      },
    });
  }

  // Auto-redeem a deep-linked code once on mount.
  useEffect(() => {
    if (!autoTried.current && seed.length === CODE_LENGTH) {
      autoTried.current = true;
      handleComplete(seed);
    }
  }, []);

  function reset(): void {
    setResult(null);
    setError(null);
    setCode('');
  }

  return (
    <Show
      when={!result}
      fallback={
        result ? (
          <ResultPanel
            title="Here's your file"
            filename={result.filename}
            url={result.url}
            resetLabel="Redeem another code"
            onReset={reset}
          />
        ) : null
      }
    >
      <div className="flex w-full flex-col items-center gap-3 text-center">
        <p className="text-sm font-medium text-[var(--fs-text)]">Enter a share code</p>
        <OtpInput
          length={CODE_LENGTH}
          value={code}
          onChange={(v) => {
            setCode(v);
            setError(null);
          }}
          onComplete={handleComplete}
          disabled={redeem.isPending}
          autoFocus
          aria-label="Share code"
        />

        <Show when={redeem.isPending}>
          <span className="inline-flex items-center gap-1.5 text-xs text-[var(--fs-text-secondary)]">
            <Loader2 size={13} className="animate-spin" aria-hidden="true" /> Looking it up…
          </span>
        </Show>

        <Show when={Boolean(error)}>
          <p role="alert" className="flex items-center gap-1.5 text-xs text-[var(--fs-error)]">
            <AlertCircle size={13} aria-hidden="true" />
            {error}
          </p>
        </Show>
      </div>
    </Show>
  );
}
