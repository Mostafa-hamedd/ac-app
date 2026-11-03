import { type QueryClient } from '@tanstack/react-query';

import { tokenStorage } from '@/lib/auth/session-storage';

import { useSessionStore } from '../store/session-store';

export const useSessionStatus = () => useSessionStore((state) => state.status);
export const useCurrentUser = () => useSessionStore((state) => state.user);

/** Non-hook access for code outside React (e.g. +native-intent). */
export const getSessionStatus = () => useSessionStore.getState().status;

/** Clears tokens and every user-specific cache, then flips the session state. */
export async function endSession(queryClient: QueryClient): Promise<void> {
  await tokenStorage.clear();
  queryClient.clear();
  useSessionStore.getState().setUnauthenticated();
}
