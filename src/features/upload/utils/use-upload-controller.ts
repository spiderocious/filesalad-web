import { useCallback, useState } from 'react';

import { ApiError } from '@shared/services/api-error';

import { useUploadFile } from '../api/use-upload-file.ts';
import { useHistory } from '../providers/history-provider.tsx';
import type { UploadResult } from '../types/upload.ts';

// Discriminated upload state for the drop area. Keeps the part declarative —
// it renders off `status` rather than juggling several booleans.
export type UploadState =
  | { readonly status: 'idle' }
  | { readonly status: 'uploading'; readonly filename: string }
  | { readonly status: 'success'; readonly result: UploadResult }
  | { readonly status: 'error'; readonly message: string };

function messageForError(error: unknown): string {
  if (error instanceof ApiError) {
    switch (error.code) {
      case 'quota_exceeded':
        return "You've hit this month's free upload limit. Try again next month.";
      case 'file_too_large':
        return 'That file is over the size limit.';
      case 'validation_error':
        return error.message || "That file couldn't be accepted.";
      case 'storage_unavailable':
        return 'Upload failed — storage is unavailable. Please try again.';
      default:
        return error.message || 'Something went wrong. Please try again.';
    }
  }
  return 'Something went wrong. Please try again.';
}

interface UploadController {
  readonly state: UploadState;
  readonly upload: (file: File) => void;
  readonly reset: () => void;
}

export function useUploadController(): UploadController {
  const [state, setState] = useState<UploadState>({ status: 'idle' });
  const { addEntry } = useHistory();
  const mutation = useUploadFile();

  const upload = useCallback(
    (file: File) => {
      setState({ status: 'uploading', filename: file.name });
      mutation.mutate(file, {
        onSuccess: (result) => {
          addEntry({
            id: result.uploadId,
            filename: result.filename,
            url: result.publicUrl,
            size: result.size,
            timestamp: new Date().toISOString(),
          });
          setState({ status: 'success', result });
        },
        onError: (error) => {
          setState({ status: 'error', message: messageForError(error) });
        },
      });
    },
    [mutation, addEntry],
  );

  const reset = useCallback(() => setState({ status: 'idle' }), []);

  return { state, upload, reset };
}
