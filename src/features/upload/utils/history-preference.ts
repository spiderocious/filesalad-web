// History is OFF by default — FileSalad's promise is "we don't keep your
// stuff", so we don't even keep a local list unless the user opts in.
//
// Storage shape (per the privacy posture): when ON we write a value to the
// enabled key; when OFF we REMOVE the key entirely, so a private/audited
// browser shows no FileSalad preference at all. The first-run nudge flag is
// independent so we don't re-ask after the user has already decided.
//
// Guarded so a blocked localStorage degrades to "off, prompt not seen" rather
// than throwing.
const ENABLED_KEY = 'fs_history_enabled';
const ENABLED_ON_VALUE = 'on';
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

function remove(key: string): void {
  try {
    window.localStorage.removeItem(key);
  } catch {
    // Best-effort.
  }
}

export function readHistoryEnabled(): boolean {
  return read(ENABLED_KEY) === ENABLED_ON_VALUE;
}

export function writeHistoryEnabled(enabled: boolean): void {
  if (enabled) write(ENABLED_KEY, ENABLED_ON_VALUE);
  else remove(ENABLED_KEY);
}

// The first-run nudge shows once, after the first upload, only if the user
// hasn't already chosen (so we never nag).
export function hasSeenHistoryPrompt(): boolean {
  return read(PROMPT_SEEN_KEY) === 'true' || read(ENABLED_KEY) === ENABLED_ON_VALUE;
}

export function markHistoryPromptSeen(): void {
  write(PROMPT_SEEN_KEY, 'true');
}
