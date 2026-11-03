import {
  AxiosError,
  type AxiosAdapter,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';

import type { Paginated } from '@/shared/types/api';

export type MockRequest = {
  params: Record<string, string>;
  query: Record<string, unknown>;
  body: unknown;
};

export type MockRoute = {
  method: 'GET' | 'POST';
  /** Path with `:name` placeholders, e.g. '/requests/:id'. */
  path: string;
  handle: (request: MockRequest) => unknown;
};

/** Thrown by a handler to answer with an HTTP error, exactly like the real backend would. */
export class MockHttpError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

/** Any detail route answers this id with a 500, to try the error screens: /requests/ERROR. */
const FORCE_ERROR_ID = 'ERROR';

const LATENCY_MS = process.env.JEST_WORKER_ID ? 0 : 500;

function matchPath(pattern: string, path: string): Record<string, string> | null {
  const expected = pattern.split('/');
  const actual = path.split('/');
  if (expected.length !== actual.length) return null;

  const params: Record<string, string> = {};
  for (let i = 0; i < expected.length; i++) {
    const part = expected[i]!;
    if (part.startsWith(':')) params[part.slice(1)] = decodeURIComponent(actual[i]!);
    else if (part !== actual[i]) return null;
  }
  return params;
}

function parseBody(data: unknown): unknown {
  if (typeof data !== 'string') return data;
  try {
    return JSON.parse(data);
  } catch {
    return data;
  }
}

function response(config: InternalAxiosRequestConfig, status: number, data: unknown) {
  return { status, data, headers: {}, statusText: '', config } as AxiosResponse;
}

type FormPart = { fieldName: string; string?: string; uri?: string };

/** Reads one field (text or file) from a React Native FormData body. */
export function formPart(body: unknown, name: string): FormPart | undefined {
  const parts = (body as { getParts?: () => FormPart[] }).getParts?.();
  return parts?.find((part) => part.fieldName === name);
}

/** Cursor pagination for list routes. The cursor is the offset as a string. */
export function paginate<T>(items: readonly T[], cursor: unknown, pageSize: number): Paginated<T> {
  const offset = typeof cursor === 'string' ? Number(cursor) : 0;
  const nextOffset = offset + pageSize;
  return {
    items: items.slice(offset, nextOffset),
    nextCursor: nextOffset < items.length ? String(nextOffset) : null,
  };
}

/** Finds an item for a detail route, or answers 404 (or 500 for FORCE_ERROR_ID). */
export function findById<T extends { id: string }>(items: readonly T[], id: string | undefined): T {
  if (id === FORCE_ERROR_ID) throw new MockHttpError(500, 'Simulated server error.');
  const item = items.find((candidate) => candidate.id === id);
  if (!item) throw new MockHttpError(404, 'Not found.');
  return item;
}

export function createMockAdapter(routes: MockRoute[]): AxiosAdapter {
  return async (config) => {
    await new Promise((resolve) => setTimeout(resolve, LATENCY_MS));
    const method = (config.method ?? 'get').toUpperCase();
    const path = (config.url ?? '').split('?')[0]!;

    for (const route of routes) {
      if (route.method !== method) continue;
      const params = matchPath(route.path, path);
      if (!params) continue;

      try {
        const query = (config.params ?? {}) as Record<string, unknown>;
        const data = await route.handle({ params, query, body: parseBody(config.data) });
        return response(config, 200, data ?? null);
      } catch (error) {
        if (!(error instanceof MockHttpError)) throw error;
        const failed = response(config, error.status, { message: error.message });
        throw new AxiosError(error.message, 'ERR_BAD_RESPONSE', config, undefined, failed);
      }
    }

    const missing = response(config, 404, { message: `No mock for ${method} ${path}` });
    throw new AxiosError('Not found', 'ERR_BAD_REQUEST', config, undefined, missing);
  };
}
