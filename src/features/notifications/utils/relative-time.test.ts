import { i18n } from '@/lib/i18n';

import { formatRelativeTime, formatShortTime } from './relative-time';

const NOW = new Date('2026-11-16T12:00:00.000Z').getTime();
const ago = (ms: number) => new Date(NOW - ms).toISOString();
const MIN = 60_000;
const HR = 60 * MIN;
const DAY = 24 * HR;

describe('formatRelativeTime', () => {
  const t = i18n.t.bind(i18n);

  beforeEach(async () => {
    await i18n.changeLanguage('en');
  });

  it.each([
    [30_000, 'Just now'],
    [2 * MIN, '2 min ago'],
    [3 * HR, '3 hr ago'],
    [30 * HR, 'Yesterday'],
    [3 * DAY, '3 days ago'],
  ])('%d ms ago reads "%s"', (ms, expected) => {
    expect(formatRelativeTime(ago(ms), t, NOW)).toBe(expected);
  });

  it('falls back to a date after a week and for future times', () => {
    expect(formatRelativeTime(ago(10 * DAY), t, NOW)).toMatch(/2026/);
    expect(formatRelativeTime(ago(-HR), t, NOW)).toMatch(/2026/);
  });

  it('reads in Arabic', async () => {
    await i18n.changeLanguage('ar');
    expect(formatRelativeTime(ago(2 * MIN), i18n.t.bind(i18n), NOW)).toBe('منذ 2 د');
    expect(formatRelativeTime(ago(30 * HR), i18n.t.bind(i18n), NOW)).toBe('أمس');
  });
});

describe('formatShortTime', () => {
  const t = i18n.t.bind(i18n);
  beforeEach(async () => {
    await i18n.changeLanguage('en');
  });
  it('uses compact units', () => {
    expect(formatShortTime(ago(10_000), t, NOW)).toBe('now');
    expect(formatShortTime(ago(5 * MIN), t, NOW)).toBe('5m');
    expect(formatShortTime(ago(2 * HR), t, NOW)).toBe('2h');
    expect(formatShortTime(ago(DAY + HR), t, NOW)).toBe('1d');
  });
});
