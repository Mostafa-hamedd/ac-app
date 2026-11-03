import { parseAppLink, type AppLink } from '@/lib/linking/linking-config';

/**
 * Turns a notification payload into a safe in-app destination.
 * Payloads are untrusted: only `data.url` pointing at an allowlisted route is used.
 */
export function getNotificationDestination(data: unknown): AppLink | null {
  if (!data || typeof data !== 'object') return null;
  const { url } = data as { url?: unknown };
  return parseAppLink(url);
}
