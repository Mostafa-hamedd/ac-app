import { create } from 'zustand';

import type { SessionStatus, User } from '../types/auth.types';

/**
 * Session lifecycle only. Tokens live in SecureStore (lib/auth/session-storage);
 * server data lives in TanStack Query.
 */
type SessionState = {
  status: SessionStatus;
  /** Null while offline on a cold start, until the profile can be fetched. */
  user: User | null;
  setAuthenticated: (user: User | null) => void;
  setUnauthenticated: () => void;
};

export const useSessionStore = create<SessionState>()((set) => ({
  status: 'restoring',
  user: null,
  setAuthenticated: (user) => set({ status: 'authenticated', user }),
  setUnauthenticated: () => set({ status: 'unauthenticated', user: null }),
}));
