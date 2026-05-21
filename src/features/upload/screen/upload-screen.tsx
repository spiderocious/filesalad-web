import { DropZone, ToastHost, UsageMeter, toast } from 'file-salad-ui-lib';

// The no-signup one-pager shell, built from the FileSalad UI library so it
// inherits the shared tokens, color, and typography. The upload flow itself
// (fingerprint, presigned PUT, IndexedDB count + history, click-to-copy) is a
// separate spec'd task — onFiles is a placeholder for now.
const MONTHLY_CAP = 50;

export function UploadScreen() {
  return (
    <main className="mx-auto flex min-h-full max-w-xl flex-col justify-center gap-6 px-6 py-16">
      <header className="text-center">
        <h1 className="fs-font-sans text-3xl font-semibold text-[var(--fs-text)]">FileSalad</h1>
        <p className="mt-2 text-sm text-[var(--fs-text-secondary)]">
          Drop a file, get a public link. No signup.
        </p>
      </header>

      <DropZone onFiles={() => toast.info('Upload is coming soon')} />

      <UsageMeter used={0} total={MONTHLY_CAP} label="Uploads this month" />

      <ToastHost />
    </main>
  );
}
