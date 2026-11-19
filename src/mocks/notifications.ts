import type { AppNotification } from '@/features/notifications';

import { findById, paginate, type MockRoute } from './server';

const HOUR = 3_600_000;
const ago = (ms: number) => new Date(Date.now() - ms).toISOString();
const SERVICE_DONE =
  'Your Opel’s 10k maintenance service is finished. You can now complete its payment and collect your car.';

/** Centralized, realistic mock dataset — some cross-link to requests/vehicles. Times are relative to now. */
const MOCK_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'NOTIF_301',
    title: 'Service finished',
    body: SERVICE_DONE,
    category: 'payment',
    read: false,
    createdAt: ago(2 * HOUR),
    avatarKey: 'avatar-1',
  },
  {
    id: 'NOTIF_302',
    title: 'Checked into service',
    body: 'Your Opel has been checked into service at Mansour Auto Sheikh Zayed. You can collect your car on 15 Sep 2022 at 5:00 PM.',
    category: 'request',
    read: false,
    createdAt: ago(3 * HOUR),
    relatedHref: '/requests/REQ_103',
    avatarKey: 'avatar-2',
  },
  {
    id: 'NOTIF_303',
    title: 'Service finished',
    body: SERVICE_DONE,
    category: 'payment',
    read: false,
    createdAt: ago(5 * HOUR),
    avatarKey: 'avatar-3',
  },
  ...[4, 5, 6, 7].map((n, i) => ({
    id: `NOTIF_30${i + 4}`,
    title: 'Service finished',
    body: SERVICE_DONE,
    category: 'payment' as const,
    read: true,
    createdAt: ago(24 * HOUR + i * HOUR),
    avatarKey: `avatar-${n}`,
  })),
];

export const notificationsRoutes: MockRoute[] = [
  {
    method: 'GET',
    path: '/notifications',
    handle: ({ query }) => paginate(MOCK_NOTIFICATIONS, query.cursor, 10),
  },
  {
    method: 'GET',
    path: '/notifications/:id',
    handle: ({ params }) => findById(MOCK_NOTIFICATIONS, params.id),
  },
  { method: 'POST', path: '/notifications/push-tokens', handle: () => null },
];
