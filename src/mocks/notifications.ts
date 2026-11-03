import type { AppNotification } from '@/features/notifications';

import { findById, paginate, type MockRoute } from './server';

/** Centralized, realistic mock dataset — some cross-link to requests/payments/vehicles. */
const MOCK_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'NOTIF_301',
    title: 'Invoice ready',
    body: 'Your invoice for the brake pad replacement is ready to pay.',
    category: 'payment',
    read: false,
    createdAt: '2026-10-29T08:00:00.000Z',
    relatedHref: '/payments/PAY_202',
  },
  {
    id: 'NOTIF_302',
    title: 'Approval needed',
    body: 'Check engine light diagnostics found an issue that needs your approval.',
    category: 'request',
    read: false,
    createdAt: '2026-10-27T15:05:00.000Z',
    relatedHref: '/requests/REQ_103',
  },
  {
    id: 'NOTIF_303',
    title: 'Service completed',
    body: 'Your Toyota Corolla’s annual service is complete.',
    category: 'request',
    read: true,
    createdAt: '2026-10-02T09:20:00.000Z',
    relatedHref: '/requests/REQ_101',
  },
  {
    id: 'NOTIF_304',
    title: 'Service due soon',
    body: 'Your Honda CR-V is due for service in two weeks.',
    category: 'vehicle',
    read: true,
    createdAt: '2026-10-01T09:00:00.000Z',
    relatedHref: '/vehicles/VEH_2',
  },
  {
    id: 'NOTIF_305',
    title: 'Welcome to AutoConnect',
    body: 'Track requests, invoices and vehicles all in one place.',
    category: 'system',
    read: true,
    createdAt: '2026-07-01T12:00:00.000Z',
  },
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
