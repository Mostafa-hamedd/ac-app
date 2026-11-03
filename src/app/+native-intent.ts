import { getSessionStatus } from '@/features/auth';
import { parseAppLink } from '@/lib/linking/linking-config';
import { pendingDestination } from '@/lib/linking/pending-destination';

/**
 * Entry point for every URL the OS hands to the app (cold start and warm).
 * Only allowlisted, validated destinations get through.
 */
export function redirectSystemPath({ path }: { path: string; initial: boolean }): string {
  try {
    const link = parseAppLink(path);
    if (!link) return '/';

    // Signed out (or still restoring): remember where they were going.
    // The root layout resumes it after sign-in.
    if (getSessionStatus() !== 'authenticated') {
      pendingDestination.set(link.href);
    }
    return link.href;
  } catch {
    return '/';
  }
}
