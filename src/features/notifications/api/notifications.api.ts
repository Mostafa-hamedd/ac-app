import { Platform } from 'react-native';

import { parseResponse } from '@/lib/api/api-error';
import { apiClient } from '@/lib/api/client';
import { endpoints } from '@/lib/api/endpoints';
import { paginatedSchema, type Paginated } from '@/shared/types/api';

import { notificationSchema, type AppNotification } from '../types/notification.types';

export async function getNotifications(params?: {
  cursor?: string | null;
}): Promise<Paginated<AppNotification>> {
  const { data } = await apiClient.get(endpoints.notifications.list, {
    params: { cursor: params?.cursor ?? undefined },
  });
  return parseResponse(paginatedSchema(notificationSchema), data);
}

export async function getNotificationById(notificationId: string): Promise<AppNotification> {
  const { data } = await apiClient.get(endpoints.notifications.detail(notificationId));
  return parseResponse(notificationSchema, data);
}

export async function registerPushToken(token: string): Promise<void> {
  await apiClient.post(endpoints.notifications.pushTokens, { token, platform: Platform.OS });
}
