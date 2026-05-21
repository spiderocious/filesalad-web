// A best-effort browser fingerprint for the X-Fingerprint header. The web cap
// is server-enforced by IP + this value and is accepted as defeatable in v1
// (PRD D-7) — so a lightweight, stable-per-browser id is sufficient. We persist
// a random component in localStorage and fold in coarse environment signals; no
// heavy fingerprinting library.
const STORAGE_KEY = 'fs_fp';

function randomId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

// Small, dependency-free 32-bit string hash → hex. Not cryptographic; only
// needs to be stable and well-distributed for a cap key.
function hash(input: string): string {
  let h = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(16).padStart(8, '0');
}

// localStorage may be unavailable (private mode, blocked, non-browser). Fall
// back to an in-memory seed so a fingerprint is always produced.
let memorySeed: string | null = null;

function persistentSeed(): string {
  try {
    const existing = window.localStorage.getItem(STORAGE_KEY);
    if (existing) return existing;
    const seed = randomId();
    window.localStorage.setItem(STORAGE_KEY, seed);
    return seed;
  } catch {
    if (!memorySeed) memorySeed = randomId();
    return memorySeed;
  }
}

export function getFingerprint(): string {
  const signals = [
    navigator.userAgent,
    navigator.language,
    `${screen.width}x${screen.height}x${screen.colorDepth}`,
    String(new Date().getTimezoneOffset()),
    persistentSeed(),
  ].join('|');
  return hash(signals);
}
