import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { ApiError } from '@/lib/api/api-error';
import { authEvents } from '@/lib/auth/auth-events';
import { tokenStorage } from '@/lib/auth/session-storage';

import { getCurrentUser } from '../api/auth.api';
import { useSessionStore } from '../store/session-store';

import { endSession } from './use-session';

/**
 * Restores the session on startup and ends it centrally when the API reports
 * that it expired. Mount once, in the root layout.
 */
export function useSessionBootstrap(): void {
  const queryClient = useQueryClient();

  useEffect(() => {
    let cancelled = false;
    const { setAuthenticated, setUnauthenticated } = useSessionStore.getState();

    async function restore() {
      try {
        const tokens = await tokenStorage.load();
        if (!tokens) {
          if (!cancelled) setUnauthenticated();
          return;
        }
        const user = await getCurrentUser();
        if (!cancelled) setAuthenticated(user);
      } catch (error) {
        if (cancelled) return;
        if (error instanceof ApiError && error.isRetryable) {
          // Offline / server hiccup: keep the user in, the API will re-validate later.
          setAuthenticated(null);
        } else {
          await endSession(queryClient);
        }
      }
    }

    restore();
    const unsubscribe = authEvents.on('session-expired', () => {
      endSession(queryClient);
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [queryClient]);
}
