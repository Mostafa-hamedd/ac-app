import { env } from '@/config/env';

/**
 * Allowlist of deep-link destinations.
 * Anything not listed here is rejected; identifiers are validated as untrusted input.
 */
export type AppLink =
  | { type: 'request'; id: string; href: `/requests/${string}` }
  | { type: 'payment'; id: string; href: `/payments/${string}` }
  | { type: 'vehicle'; id: string; href: `/vehicles/${string}` }
  | { type: 'notification'; id: string; href: `/notifications/${string}` };

const APP_SCHEME = 'autoconnect';

const ID_PATTERN = /^[A-Za-z0-9_-]{1,64}$/;

const ROUTES = {
  requests: 'request',
  payments: 'payment',
  vehicles: 'vehicle',
  notifications: 'notification',
} as const satisfies Record<string, AppLink['type']>;

type Segment = keyof typeof ROUTES;

function isSegment(value: string): value is Segment {
  return Object.prototype.hasOwnProperty.call(ROUTES, value);
}

/** Extracts the path from `/x`, `autoconnect://x` or `https://<link domain>/x`. */
function extractPath(input: string): string | null {
  const value = input.trim();
  if (value.startsWith('/')) return value;

  const schemePrefix = `${APP_SCHEME}://`;
  if (value.toLowerCase().startsWith(schemePrefix)) {
    return `/${value.slice(schemePrefix.length)}`;
  }

  if (/^https:\/\//i.test(value)) {
    try {
      const url = new URL(value);
      if (!env.linkDomain || url.host.toLowerCase() !== env.linkDomain.toLowerCase()) return null;
      return url.pathname;
    } catch {
      return null;
    }
  }
  return null;
}

/** Returns a validated, in-app destination — or null for anything unexpected. */
export function parseAppLink(input: unknown): AppLink | null {
  if (typeof input !== 'string' || input.length > 512) return null;

  const path = extractPath(input);
  if (!path) return null;

  const [pathname = ''] = path.split(/[?#]/);
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length !== 2) return null;

  const [segment, rawId] = segments as [string, string];
  if (!isSegment(segment)) return null;

  let id: string;
  try {
    id = decodeURIComponent(rawId);
  } catch {
    return null;
  }
  if (!ID_PATTERN.test(id)) return null;

  const type = ROUTES[segment];
  return { type, id, href: `/${segment}/${id}` } as AppLink;
}
