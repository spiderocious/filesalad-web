import { useEffect, useState } from 'react';

interface PageDropResult {
  // True while a file is being dragged anywhere over the page — lets the UI
  // light up the drop card for affordance.
  readonly isDraggingFile: boolean;
}

// Page-wide drop target. Drag a file onto any part of the upload screen (not
// just the white card) and the first file is handed to `onFile`. We listen on
// `window` so the gradient surface — and any padding/footer around the card —
// also accepts drops, matching the page-wide paste behaviour.
//
// The default browser behaviour for a dropped file is to navigate to it; we
// preventDefault every event so that never happens, even if the user misses the
// card. Disable while uploading so dropping a second file mid-flight is a no-op.
export function usePageDrop(onFile: (file: File) => void, enabled = true): PageDropResult {
  const [isDraggingFile, setIsDraggingFile] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setIsDraggingFile(false);
      return undefined;
    }

    // Counter handles nested dragenter/dragleave on child elements (a single
    // child enter/leave doesn't end the drag).
    let depth = 0;

    function hasFile(e: DragEvent): boolean {
      const types = e.dataTransfer?.types;
      if (!types) return false;
      for (const t of types) if (t === 'Files') return true;
      return false;
    }

    function onDragEnter(e: DragEvent): void {
      if (!hasFile(e)) return;
      e.preventDefault();
      depth += 1;
      if (depth === 1) setIsDraggingFile(true);
    }
    function onDragOver(e: DragEvent): void {
      if (!hasFile(e)) return;
      // Must preventDefault on dragover to make the drop event fire.
      e.preventDefault();
      if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy';
    }
    function onDragLeave(e: DragEvent): void {
      if (!hasFile(e)) return;
      depth = Math.max(0, depth - 1);
      if (depth === 0) setIsDraggingFile(false);
    }
    function onDrop(e: DragEvent): void {
      // Always preventDefault — even on a missed drop — so the browser never
      // navigates away from the page to open the file.
      e.preventDefault();
      depth = 0;
      setIsDraggingFile(false);
      const file = e.dataTransfer?.files?.[0];
      if (file) onFile(file);
    }

    window.addEventListener('dragenter', onDragEnter);
    window.addEventListener('dragover', onDragOver);
    window.addEventListener('dragleave', onDragLeave);
    window.addEventListener('drop', onDrop);
    return () => {
      window.removeEventListener('dragenter', onDragEnter);
      window.removeEventListener('dragover', onDragOver);
      window.removeEventListener('dragleave', onDragLeave);
      window.removeEventListener('drop', onDrop);
    };
  }, [onFile, enabled]);

  return { isDraggingFile };
}
