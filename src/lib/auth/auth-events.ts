/**
 * Tiny event bus so the API layer can announce "session expired" without
 * importing the auth feature (lib/ must not depend on features/).
 */
type AuthEvent = 'session-expired';
type Listener = () => void;

const listeners = new Map<AuthEvent, Set<Listener>>();

export const authEvents = {
  on(event: AuthEvent, listener: Listener): () => void {
    const set = listeners.get(event) ?? new Set<Listener>();
    set.add(listener);
    listeners.set(event, set);
    return () => {
      set.delete(listener);
    };
  },

  emit(event: AuthEvent): void {
    listeners.get(event)?.forEach((listener) => listener());
  },
};
