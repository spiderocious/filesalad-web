import { Button, CopyableLink, toast } from 'file-salad-ui-lib';
import { Show } from 'meemaw';

import { LinkIcon } from '@icons';
import { shareLink } from '@shared/config/env';
import { useShareCodesEnabled } from '@shared/feature-flags/hooks/use-share-codes-enabled';

import { useShareCode } from '../../../api/use-share-code.ts';

interface ShareButtonProps {
  readonly uploadId: string;
}

// Mints a short share code for an upload and shows the friendly /s/CODE link
// (re-redeemable for ~24h). Opt-in per-upload action — nothing is shared until
// the user clicks. Used on the upload result + history rows. Hidden entirely
// when the share-codes feature flag is off.
export function ShareButton({ uploadId }: ShareButtonProps) {
  const enabled = useShareCodesEnabled();
  const share = useShareCode();

  if (!enabled) return null;

  return (
    <Show
      when={share.isSuccess && Boolean(share.data)}
      fallback={
        <Button
          variant="quiet"
          size="sm"
          className="w-full"
          loading={share.isPending}
          leadingIcon={<LinkIcon size={14} />}
          onClick={() => share.mutate(uploadId)}
        >
          Create share code
        </Button>
      }
    >
      <div className="rounded-lg bg-[var(--fs-surface)] p-2">
        <p className="mb-1 text-center text-[11px] text-[var(--fs-text-secondary)]">
          Anyone with this link can download for 24h
        </p>
        {share.data ? (
          <CopyableLink
            url={shareLink(share.data.code)}
            onCopy={() => toast.success('Share link copied')}
          />
        ) : null}
      </div>
    </Show>
  );
}
