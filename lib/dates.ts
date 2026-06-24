/* Pure date helpers — no Next/runtime imports, so they're unit-testable. */

/** YYYY-MM-DD bucket key for a Graph timestamp, in the given IANA timezone
 *  (e.g. 'America/Los_Angeles'). Falsy/invalid tz falls back to UTC.
 *  'en-CA' formats as YYYY-MM-DD. This makes "today" mean Reg's today. */
export function dayKey(iso: string | undefined, tz: string): string {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString('en-CA', { timeZone: tz || 'UTC' });
  } catch {
    return new Date(iso).toLocaleDateString('en-CA', { timeZone: 'UTC' });
  }
}

/** The 7 calendar-day keys (oldest -> today) in the given timezone. */
export function last7Days(tz: string, now: Date = new Date()): string[] {
  const todayStr = now.toLocaleDateString('en-CA', { timeZone: tz || 'UTC' });
  const base = new Date(`${todayStr}T12:00:00Z`); // noon avoids DST edges
  const days: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const dt = new Date(base);
    dt.setUTCDate(base.getUTCDate() - i);
    days.push(dt.toISOString().slice(0, 10));
  }
  return days;
}
