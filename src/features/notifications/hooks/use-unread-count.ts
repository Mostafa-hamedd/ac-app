import { useNotifications } from './use-notifications';

/** Unread notifications among those loaded so far (the inbox is paginated). */
export function useUnreadNotificationCount(): number {
  const { data } = useNotifications();
  return data?.filter((notification) => !notification.read).length ?? 0;
}
