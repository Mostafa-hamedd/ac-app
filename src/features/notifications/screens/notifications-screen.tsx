import { Bell } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

import { PaginatedList } from '@/shared/ui/paginated-list';

import { NotificationCard } from '../components/notification-card';
import { useNotifications } from '../hooks/use-notifications';

/** The inbox comes from the API, because push delivery is never guaranteed. */
export function NotificationsScreen() {
  const { t } = useTranslation();
  const query = useNotifications();
  return (
    <PaginatedList
      query={query}
      edges={[]}
      renderItem={(item) => <NotificationCard notification={item} />}
      empty={{
        icon: Bell,
        title: t('notifications.emptyTitle'),
        description: t('notifications.emptyDescription'),
      }}
    />
  );
}
