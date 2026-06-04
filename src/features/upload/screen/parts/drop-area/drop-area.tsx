import { DropZone } from 'file-salad-ui-lib';
import { Show } from 'meemaw';
import { useCallback, useState } from 'react';
import { useParams } from 'react-router-dom';

import { AlertCircle, Loader2, Salad, UploadCloud } from '@icons';
import { useShareCodesEnabled } from '@shared/feature-flags/hooks/use-share-codes-enabled';
import { ModeTabs } from '@shared/ui/mode-tabs/mode-tabs.tsx';

import { usePageDrop } from '../../../utils/use-page-drop.ts';
import { usePasteUpload } from '../../../utils/use-paste-upload.ts';
import {
  useUploadController,
  type UploadState,
} from '../../../utils/use-upload-controller.ts';
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
// a share code). Tabs sit on top of the card; Upload is the default. The drop
// target spans the whole page — drop anywhere outside the card too. Paste does
// the same. Either action also flips back to the Upload tab so the user sees
// the upload progress (instead of staring at the Code view). The Code tab
// (and tabs strip) is hidden when the share-codes flag is off.
export function DropArea() {
  const { code } = useParams<{ code?: string }>();
  const codesEnabled = useShareCodesEnabled();
  const [mode, setMode] = useState<Mode>(code && codesEnabled ? 'code' : 'upload');

  // Force back to Upload if the flag flips off while the Code tab was open.
  const effectiveMode: Mode = codesEnabled ? mode : 'upload';

  const { state, upload, reset } = useUploadController();
  const isUploading = state.status === 'uploading';

  const onFileFromAnywhere = useCallback(
    (file: File) => {
      setMode('upload');
      upload(file);
    },
    [upload],
  );

  // Page-wide drop + ⌘V paste — work anywhere on the canvas, not just on the
  // card. Both are disabled while an upload is in flight.
  const { isDraggingFile } = usePageDrop(onFileFromAnywhere, !isUploading);
  usePasteUpload(onFileFromAnywhere, !isUploading);

  return (
    <div className="flex w-full max-w-md flex-col items-center gap-3">
      <Show when={codesEnabled}>
        <ModeTabs<Mode>
          value={effectiveMode}
          options={MODE_OPTIONS}
          onChange={setMode}
          aria-label="Upload or redeem a code"
        />
      </Show>
      <Show
        when={effectiveMode === 'upload'}
        fallback={<CodeRedeemCard initialCode={code ?? ''} />}
      >
        <UploadCard
          state={state}
          isDraggingOnPage={isDraggingFile}
          onPickFile={onFileFromAnywhere}
          onReset={reset}
        />
      </Show>
    </div>
  );
}

interface UploadCardProps {
  readonly state: UploadState;
  readonly isDraggingOnPage: boolean;
  readonly onPickFile: (file: File) => void;
  readonly onReset: () => void;
}

function UploadCard({ state, isDraggingOnPage, onPickFile, onReset }: UploadCardProps) {
  const isUploading = state.status === 'uploading';
  // Light up the card while a file is being dragged anywhere on the page — even
  // if the cursor isn't over the card itself.
  const dragClass = isDraggingOnPage ? 'fs-target--drag-active' : '';

  return (
    <div className="flex w-full flex-col items-center gap-4">
      <div className={`fs-target ${dragClass} ${isUploading ? 'is-busy' : ''}`}>
        <DropZone
          onFiles={(files) => {
            const file = files[0];
            if (file) onPickFile(file);
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
              {isUploading
                ? 'Uploading…'
                : isDraggingOnPage
                  ? 'Drop to upload'
                  : 'Drop, paste, or click'}
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
              onReset={onReset}
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
