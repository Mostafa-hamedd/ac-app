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
  relatedHref: z.string().optional(),
});

export type AppNotification = z.infer<typeof notificationSchema>;
export type NotificationCategory = AppNotification['category'];
