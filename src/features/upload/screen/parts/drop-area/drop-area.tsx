import { DropZone } from 'file-salad-ui-lib';
import { Show } from 'meemaw';
import { useState } from 'react';
import { useParams } from 'react-router-dom';

import { AlertCircle, Loader2, Salad, UploadCloud } from '@icons';
import { ModeTabs } from '@shared/ui/mode-tabs/mode-tabs.tsx';

import { usePasteUpload } from '../../../utils/use-paste-upload.ts';
import { useUploadController } from '../../../utils/use-upload-controller.ts';
import { CodeRedeem } from './code-redeem.tsx';
import { OptInNudge } from './opt-in-nudge.tsx';
import { ResultPanel } from './result-panel.tsx';
import { ShareButton } from './share-button.tsx';

type Mode = 'upload' | 'code';

const MODE_OPTIONS = [
  { value: 'upload' as const, label: 'Upload' },
  { value: 'code' as const, label: 'Have a code' },
];

// The centered card is dual-mode: Upload (drop / paste / click) or Code (redeem
// a share code). Tabs sit on top of the card; Upload is the default. A /s/:code
// deep link opens straight into the Code tab with the code prefilled.
export function DropArea() {
  const { code } = useParams<{ code?: string }>();
  const [mode, setMode] = useState<Mode>(code ? 'code' : 'upload');

  return (
    <div className="flex w-full max-w-md flex-col items-center gap-3">
      <ModeTabs<Mode>
        value={mode}
        options={MODE_OPTIONS}
        onChange={setMode}
        aria-label="Upload or redeem a code"
      />
      <Show when={mode === 'upload'} fallback={<CodeRedeemCard initialCode={code ?? ''} />}>
        <UploadCard />
      </Show>
    </div>
  );
}

function UploadCard() {
  const { state, upload, reset } = useUploadController();
  const isUploading = state.status === 'uploading';

  usePasteUpload(upload, !isUploading);

  return (
    <div className="flex w-full flex-col items-center gap-4">
      <div className={`fs-target ${isUploading ? 'is-busy' : ''}`}>
        <DropZone
          onFiles={(files) => {
            const file = files[0];
            if (file) upload(file);
          }}
          disabled={isUploading}
          aria-label="Drop, paste, or click to upload a file"
          className="fs-dropzone-circle"
        >
          <div className="flex flex-col items-center gap-2 text-center">
            <Show
              when={!isUploading}
              fallback={<Loader2 className="animate-spin text-[var(--fs-accent)]" size={44} />}
            >
              <span className="flex h-20 w-20 items-center justify-center rounded-full bg-[var(--fs-accent-subtle)]">
                <Salad className="text-[var(--fs-accent)]" size={40} aria-hidden="true" />
              </span>
            </Show>
            <span className="text-sm font-medium text-[var(--fs-text)]">
              {isUploading ? 'Uploading…' : 'Drop, paste, or click'}
            </span>
            <Show when={!isUploading}>
              <span className="inline-flex items-center gap-1 text-xs text-[var(--fs-text-secondary)]">
                <UploadCloud size={12} aria-hidden="true" /> one file, any type
              </span>
            </Show>
          </div>
        </DropZone>
      </div>

      <Show when={state.status === 'success'}>
        {state.status === 'success' ? (
          <div className="flex w-full flex-col gap-3">
            <ResultPanel
              title="Your link is ready"
              url={state.result.publicUrl}
              resetLabel="Send another file"
              onReset={reset}
            />
            <ShareButton uploadId={state.result.uploadId} />
            <OptInNudge />
          </div>
        ) : null}
      </Show>

      {/* Inline error, not a toast — the user needs to read and act on it. */}
      <Show when={state.status === 'error'}>
        <p
          role="alert"
          className="flex items-center gap-2 rounded-lg bg-white/95 px-4 py-3 text-sm text-[var(--fs-error)] shadow"
        >
          <AlertCircle size={16} aria-hidden="true" />
          {state.status === 'error' ? state.message : null}
        </p>
      </Show>
    </div>
  );
}

function CodeRedeemCard({ initialCode }: { readonly initialCode: string }) {
  return (
    <div className="fs-target w-full">
      <div className="fs-dropzone-circle">
        <CodeRedeem initialCode={initialCode} />
      </div>
    </div>
  );
}
