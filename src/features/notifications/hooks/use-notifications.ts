import { useInfiniteQuery, useQuery } from '@tanstack/react-query';

import { getNotificationById, getNotifications } from '../api/notifications.api';

// Every key starts with 'notifications', so invalidating ['notifications'] refreshes all of them.

export function useNotifications() {
  return useInfiniteQuery({
    queryKey: ['notifications', 'list'],
    queryFn: ({ pageParam }) => getNotifications({ cursor: pageParam }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    select: (data) => data.pages.flatMap((page) => page.items),
  });
}

export function useNotification(notificationId: string) {
  return useQuery({
    queryKey: ['notifications', 'detail', notificationId],
    queryFn: () => getNotificationById(notificationId),
  });
}
