import { describe, it, expect } from 'vitest';
import { dayKey, last7Days } from './dates';

describe('dayKey', () => {
  it('buckets a UTC timestamp into the correct local day', () => {
    // 3am UTC on Jun 21 is still Jun 20 on the US west/east coast.
    const t = '2026-06-21T03:00:00Z';
    expect(dayKey(t, 'UTC')).toBe('2026-06-21');
    expect(dayKey(t, 'America/Los_Angeles')).toBe('2026-06-20');
    expect(dayKey(t, 'America/New_York')).toBe('2026-06-20');
  });

  it('keeps a midday timestamp on the same day everywhere', () => {
    const t = '2026-06-21T18:00:00Z';
    expect(dayKey(t, 'America/Los_Angeles')).toBe('2026-06-21');
    expect(dayKey(t, 'UTC')).toBe('2026-06-21');
  });

  it('returns empty string for missing input', () => {
    expect(dayKey(undefined, 'UTC')).toBe('');
  });

  it('falls back to UTC on an invalid timezone', () => {
    const t = '2026-06-21T18:00:00Z';
    expect(dayKey(t, 'Not/AZone')).toBe('2026-06-21');
  });
});

describe('last7Days', () => {
  it('returns 7 consecutive ascending day keys ending today', () => {
    const now = new Date('2026-06-21T18:00:00Z');
    const days = last7Days('UTC', now);
    expect(days).toEqual([
      '2026-06-15', '2026-06-16', '2026-06-17',
      '2026-06-18', '2026-06-19', '2026-06-20', '2026-06-21',
    ]);
  });

  it('uses the local day for "today" near the UTC boundary', () => {
    // 3am UTC Jun 21 == still Jun 20 in LA, so today should be Jun 20.
    const now = new Date('2026-06-21T03:00:00Z');
    const days = last7Days('America/Los_Angeles', now);
    expect(days[days.length - 1]).toBe('2026-06-20');
    expect(days).toHaveLength(7);
  });
});
