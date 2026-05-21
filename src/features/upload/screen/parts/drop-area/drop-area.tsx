import { CopyableLink, DropZone, toast } from 'file-salad-ui-lib';
import { Show } from 'meemaw';

import { AlertCircle, Loader2, Salad, UploadCloud } from '@icons';

import { usePasteUpload } from '../../../utils/use-paste-upload.ts';
import { useUploadController } from '../../../utils/use-upload-controller.ts';

// The centered floating target, styled after the screenshot's logo-in-a-circle.
// Drop / click come from the lib DropZone; ⌘V paste is wired globally. The view
// switches on the upload state machine.
export function DropArea() {
  const { state, upload, reset } = useUploadController();
  const isUploading = state.status === 'uploading';

  usePasteUpload(upload, !isUploading);

  return (
    <div className="flex w-full max-w-md flex-col items-center gap-5">
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
        <div className="w-full rounded-xl bg-white/95 p-4 shadow-lg">
          <p className="mb-2 text-center text-sm font-medium text-[var(--fs-text)]">
            Your link is ready
          </p>
          {state.status === 'success' && (
            <CopyableLink
              url={state.result.publicUrl}
              onCopy={() => toast.success('Link copied')}
            />
          )}
          <button
            type="button"
            onClick={reset}
            className="mt-3 w-full text-center text-xs font-medium text-[var(--fs-accent)] hover:underline"
          >
            Send another file
          </button>
        </div>
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
