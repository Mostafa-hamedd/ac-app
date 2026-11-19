import type { TFunction } from 'i18next';

import { formatDate } from '@/shared/utils/format';

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/** "Just now", "2 min ago", "3 hr ago", "Yesterday", "2 days ago", then a plain date after a week. */
export function formatRelativeTime(iso: string, t: TFunction, now = Date.now()): string {
  const elapsed = now - new Date(iso).getTime();
  if (Number.isNaN(elapsed) || elapsed < 0) return formatDate(iso);
  if (elapsed < MINUTE) return t('notifications.time.justNow');
  if (elapsed < HOUR)
    return t('notifications.time.minutesAgo', { count: Math.floor(elapsed / MINUTE) });
  if (elapsed < DAY) return t('notifications.time.hoursAgo', { count: Math.floor(elapsed / HOUR) });
  if (elapsed < 2 * DAY) return t('notifications.time.yesterday');
  if (elapsed < 7 * DAY)
    return t('notifications.time.daysAgo', { count: Math.floor(elapsed / DAY) });
  return formatDate(iso);
}

/** Compact form used on the notification cards: "now", "5m", "2h", "3d", then a plain date after a week. */
export function formatShortTime(iso: string, t: TFunction, now = Date.now()): string {
  const elapsed = now - new Date(iso).getTime();
  if (Number.isNaN(elapsed) || elapsed < 0) return formatDate(iso);
  if (elapsed < MINUTE) return t('notifications.shortTime.now');
  if (elapsed < HOUR)
    return t('notifications.shortTime.minutes', { count: Math.floor(elapsed / MINUTE) });
  if (elapsed < DAY)
    return t('notifications.shortTime.hours', { count: Math.floor(elapsed / HOUR) });
  if (elapsed < 7 * DAY)
    return t('notifications.shortTime.days', { count: Math.floor(elapsed / DAY) });
  return formatDate(iso);
}
