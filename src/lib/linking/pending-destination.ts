import { parseAppLink } from './linking-config';

/**
 * Remembers where a signed-out user was trying to go, so it can be resumed after
 * sign-in. Kept in memory only (never persisted), and re-validated on the way out.
 */
let pendingHref: string | null = null;

export const pendingDestination = {
  set(href: string): void {
    pendingHref = parseAppLink(href)?.href ?? null;
  },

  /** Returns the destination once, then forgets it. */
  consume(): string | null {
    const href = pendingHref;
    pendingHref = null;
    return href ? (parseAppLink(href)?.href ?? null) : null;
  },

  clear(): void {
    pendingHref = null;
  },
};
