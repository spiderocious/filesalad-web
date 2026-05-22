// History is OFF by default — FileSalad's promise is "we don't keep your
// stuff", so we don't even keep a local list unless the user opts in. The
// preference + "have we shown the first-run nudge" flag live in localStorage
// (a UI preference, not file data). Guarded so a blocked localStorage degrades
// to "off, prompt not seen" rather than throwing.
const ENABLED_KEY = 'fs_history_enabled';
const PROMPT_SEEN_KEY = 'fs_history_prompt_seen';

function read(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Best-effort; a private-mode/blocked store just means the pref doesn't persist.
  }
}

export function readHistoryEnabled(): boolean {
  return read(ENABLED_KEY) === 'true';
}

export function writeHistoryEnabled(enabled: boolean): void {
  write(ENABLED_KEY, String(enabled));
}

// The first-run nudge shows once, after the first upload, only if the user
// hasn't already chosen (so we never nag).
export function hasSeenHistoryPrompt(): boolean {
  return read(PROMPT_SEEN_KEY) === 'true' || read(ENABLED_KEY) !== null;
}

export function markHistoryPromptSeen(): void {
  write(PROMPT_SEEN_KEY, 'true');
}
