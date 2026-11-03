import { QueryClient } from '@tanstack/react-query';

import { ApiError } from '@/lib/api/api-error';

const MAX_QUERY_RETRIES = 2;

/** Retry only failures that can plausibly succeed on a second attempt. */
function shouldRetry(failureCount: number, error: unknown): boolean {
  if (error instanceof ApiError && !error.isRetryable) return false;
  return failureCount < MAX_QUERY_RETRIES;
}

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        gcTime: 5 * 60_000,
        retry: shouldRetry,
      },
      mutations: {
        // Never blindly retry mutations — payments and workflow actions are not idempotent.
        retry: false,
      },
    },
  });
}
