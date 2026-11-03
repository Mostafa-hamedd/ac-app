import { useQueryClient } from '@tanstack/react-query';
import * as Notifications from 'expo-notifications';
import { router, type Href } from 'expo-router';
import { useEffect } from 'react';

import { getNotificationDestination } from '@/lib/notifications/notification-routing';

// Module-level, not a ref: the signed-in layout remounts after every login, and the OS
// keeps returning the last tapped notification, which would otherwise open again.
const handledIds = new Set<string>();

/**
 * Routes notification taps (cold start and while running) to a validated
 * destination and refreshes its data. Mount once inside the signed-in area.
 */
export function useNotificationResponseRouting(): void {
  const queryClient = useQueryClient();
  const lastResponse = Notifications.useLastNotificationResponse();

  useEffect(() => {
    if (!lastResponse) return;

    const id = lastResponse.notification.request.identifier;
    if (handledIds.has(id)) return;
    handledIds.add(id);

    const destination = getNotificationDestination(lastResponse.notification.request.content.data);
    if (!destination) return;

    // Refresh the feature's cached data (query keys are rooted at the feature name).
    queryClient.invalidateQueries({ queryKey: [`${destination.type}s`] });
    router.push(destination.href as Href);
  }, [lastResponse, queryClient]);
}
