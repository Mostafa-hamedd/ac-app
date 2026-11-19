import { z } from 'zod';

import { isoDateSchema } from '@/shared/types/api';

export const notificationSchema = z.object({
  id: z.string(),
  title: z.string(),
  body: z.string(),
  category: z.enum(['request', 'payment', 'vehicle', 'system']),
  read: z.boolean(),
  createdAt: isoDateSchema,
  /** In-app path this notification is about. Comes from the server, so check it with parseAppLink. */
  /** Which sample photo to show on the card; without one the category icon is shown. */
  avatarKey: z.string().optional(),
  relatedHref: z.string().optional(),
});

export type AppNotification = z.infer<typeof notificationSchema>;
export type NotificationCategory = AppNotification['category'];
