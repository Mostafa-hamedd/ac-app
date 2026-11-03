import { useLocalSearchParams } from 'expo-router';

import { NotificationDetailScreen } from '@/features/notifications';

export default function NotificationDetailRoute() {
  const { notificationId } = useLocalSearchParams<{ notificationId: string }>();
  return <NotificationDetailScreen notificationId={notificationId} />;
}
