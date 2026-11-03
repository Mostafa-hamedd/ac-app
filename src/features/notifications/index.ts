// Public API of the notifications feature. Import from '@/features/notifications' only.
export { NotificationsScreen } from './screens/notifications-screen';
export { NotificationDetailScreen } from './screens/notification-detail-screen';
export { useNotificationResponseRouting } from './hooks/use-notification-response-routing';
export { usePushRegistration } from './hooks/use-push-registration';
export type { AppNotification, NotificationCategory } from './types/notification.types';
