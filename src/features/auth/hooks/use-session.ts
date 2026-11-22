import { type QueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';

import { tokenStorage } from '@/lib/auth/session-storage';

import { useSessionStore } from '../store/session-store';

export const useSessionStatus = () => useSessionStore((state) => state.status);
export const useIsGuest = () => useSessionStore((state) => state.status === 'guest');
export const useCurrentUser = () => useSessionStore((state) => state.user);

/** Non-hook access for code outside React (e.g. +native-intent). */
export const getSessionStatus = () => useSessionStore.getState().status;

/** Clears tokens and every user-specific cache, then flips the session state. */
export async function endSession(queryClient: QueryClient): Promise<void> {
  await tokenStorage.clear();
  queryClient.clear();
  useSessionStore.getState().setUnauthenticated();
}

/**
 * Opens the app without an account (nothing is stored; leaving returns to the landing page).
 *
 * The landing page and My Garage are both at "/". If only the session changed, the router would
 * resolve "/" to My Garage when the signed-in screens appear. Asking for Explore in the same
 * update makes it the first screen, so My Garage is never mounted.
 */
export function enterGuestMode(): void {
  useSessionStore.getState().setGuest();
  router.replace('/explore');
}

/** Leaves guest mode and goes back to the landing page. */
export function leaveGuestMode(): void {
  useSessionStore.getState().setUnauthenticated();
}
