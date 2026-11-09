// Public API of the notifications feature. Import from '@/features/notifications' only.
export { useUnreadNotificationCount } from './hooks/use-unread-count';
export { NotificationDetailScreen } from './screens/notification-detail-screen';
export { useNotificationResponseRouting } from './hooks/use-notification-response-routing';
export { usePushRegistration } from './hooks/use-push-registration';
export type { AppNotification, NotificationCategory } from './types/notification.types';
