export type ActivityEntry = { text: string; dot: string; ts: number };

const ACTIVITY_KEY = 'tsos-activity';
const STAT_PREFIX = 'tsos-stat-';

export function logActivity(text: string, dot: string): void {
  if (typeof window === 'undefined') return;
  try {
    const existing: ActivityEntry[] = JSON.parse(localStorage.getItem(ACTIVITY_KEY) ?? '[]');
    const updated = [{ text, dot, ts: Date.now() }, ...existing].slice(0, 25);
    localStorage.setItem(ACTIVITY_KEY, JSON.stringify(updated));
  } catch {}
}

export function getActivity(): ActivityEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(ACTIVITY_KEY) ?? '[]');
  } catch { return []; }
}

export function incrementStat(key: string): void {
  if (typeof window === 'undefined') return;
  try {
    const current = parseInt(localStorage.getItem(`${STAT_PREFIX}${key}`) ?? '0');
    localStorage.setItem(`${STAT_PREFIX}${key}`, String(current + 1));
  } catch {}
}

export function getStat(key: string, seed: number): number {
  if (typeof window === 'undefined') return seed;
  try {
    const stored = localStorage.getItem(`${STAT_PREFIX}${key}`);
    return stored !== null ? seed + parseInt(stored) : seed;
  } catch { return seed; }
}

export function clearActivity(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(ACTIVITY_KEY);
    ['memos', 'decks', 'briefs'].forEach((k) => localStorage.removeItem(`${STAT_PREFIX}${k}`));
  } catch {}
}
