import type { ServiceRequest } from '@/features/requests';

import { findById, paginate, type MockRoute } from './server';

/** Centralized, realistic mock dataset — one entry per status, across a few vehicles. */
export const MOCK_REQUESTS: ServiceRequest[] = [
  {
    id: 'REQ_101',
    reference: '10101',
    title: 'Annual service',
    status: 'completed',
    vehicleLabel: 'Toyota Corolla 2022',
    updatedAt: '2026-10-02T09:15:00.000Z',
    dealershipName: 'Downtown Toyota',
    description: 'Full annual service including oil change and brake inspection.',
    history: [
      { status: 'submitted', at: '2026-09-20T10:00:00.000Z' },
      { status: 'scheduled', at: '2026-09-22T14:00:00.000Z' },
      { status: 'in_progress', at: '2026-10-02T08:00:00.000Z' },
      { status: 'completed', at: '2026-10-02T09:15:00.000Z', note: 'All checks passed.' },
    ],
  },
  {
    id: 'REQ_102',
    reference: '10102',
    title: 'Brake pad replacement',
    status: 'in_progress',
    vehicleLabel: 'Toyota Corolla 2022',
    updatedAt: '2026-10-28T11:30:00.000Z',
    dealershipName: 'Downtown Toyota',
    description: 'Front brake pads worn below safe threshold.',
    scheduledFor: '2026-10-29T09:00:00.000Z',
    history: [
      { status: 'submitted', at: '2026-10-25T16:00:00.000Z' },
      { status: 'scheduled', at: '2026-10-26T09:00:00.000Z' },
      { status: 'in_progress', at: '2026-10-28T11:30:00.000Z' },
    ],
  },
  {
    id: 'REQ_103',
    reference: '10103',
    title: 'Check engine light',
    status: 'awaiting_approval',
    vehicleLabel: 'Honda CR-V 2021',
    updatedAt: '2026-10-27T15:00:00.000Z',
    dealershipName: 'Riverside Honda',
    description: 'Diagnostics found a faulty oxygen sensor. Awaiting approval to proceed.',
    history: [
      { status: 'submitted', at: '2026-10-26T08:00:00.000Z' },
      { status: 'in_progress', at: '2026-10-26T13:00:00.000Z' },
      {
        status: 'awaiting_approval',
        at: '2026-10-27T15:00:00.000Z',
        note: 'Replacement part quoted at $180.',
      },
    ],
  },
  {
    id: 'REQ_104',
    reference: '10104',
    title: 'Tire rotation',
    status: 'scheduled',
    vehicleLabel: 'Honda CR-V 2021',
    updatedAt: '2026-10-29T08:00:00.000Z',
    dealershipName: 'Riverside Honda',
    scheduledFor: '2026-11-03T10:00:00.000Z',
    history: [
      { status: 'submitted', at: '2026-10-28T19:00:00.000Z' },
      { status: 'scheduled', at: '2026-10-29T08:00:00.000Z' },
    ],
  },
  {
    id: 'REQ_105',
    reference: '10105',
    title: 'Battery replacement',
    status: 'submitted',
    vehicleLabel: 'Ford F-150 2023',
    updatedAt: '2026-10-30T07:45:00.000Z',
    dealershipName: 'Northgate Ford',
    description: 'Battery struggling on cold starts.',
    history: [{ status: 'submitted', at: '2026-10-30T07:45:00.000Z' }],
  },
  {
    id: 'REQ_106',
    reference: '10106',
    title: 'Recall: airbag inflator',
    status: 'completed',
    vehicleLabel: 'Ford F-150 2023',
    updatedAt: '2026-08-14T13:00:00.000Z',
    dealershipName: 'Northgate Ford',
    description: 'Manufacturer safety recall, no charge.',
    history: [
      { status: 'submitted', at: '2026-08-01T09:00:00.000Z' },
      { status: 'scheduled', at: '2026-08-05T09:00:00.000Z' },
      { status: 'completed', at: '2026-08-14T13:00:00.000Z' },
    ],
  },
  {
    id: 'REQ_107',
    reference: '10107',
    title: 'Cabin air filter',
    status: 'cancelled',
    vehicleLabel: 'Toyota Corolla 2022',
    updatedAt: '2026-09-18T12:00:00.000Z',
    dealershipName: 'Downtown Toyota',
    description: 'Customer opted to handle this one themselves.',
    history: [
      { status: 'submitted', at: '2026-09-17T10:00:00.000Z' },
      { status: 'cancelled', at: '2026-09-18T12:00:00.000Z', note: 'Cancelled by customer.' },
    ],
  },
  {
    id: 'REQ_108',
    reference: '10108',
    title: 'Wheel alignment',
    status: 'in_progress',
    vehicleLabel: 'Ford F-150 2023',
    updatedAt: '2026-10-30T10:00:00.000Z',
    dealershipName: 'Northgate Ford',
    history: [
      { status: 'submitted', at: '2026-10-29T09:00:00.000Z' },
      { status: 'in_progress', at: '2026-10-30T10:00:00.000Z' },
    ],
  },
  {
    id: 'REQ_109',
    reference: '10109',
    title: 'Windshield wiper replacement',
    status: 'awaiting_approval',
    vehicleLabel: 'Honda CR-V 2021',
    updatedAt: '2026-10-30T13:20:00.000Z',
    dealershipName: 'Riverside Honda',
    history: [
      { status: 'submitted', at: '2026-10-30T13:00:00.000Z' },
      { status: 'awaiting_approval', at: '2026-10-30T13:20:00.000Z' },
    ],
  },
];

export const requestsRoutes: MockRoute[] = [
  {
    method: 'GET',
    path: '/requests',
    handle: ({ query }) =>
      paginate(
        query.status
          ? MOCK_REQUESTS.filter((request) => request.status === query.status)
          : MOCK_REQUESTS,
        query.cursor,
        4,
      ),
  },
  {
    method: 'GET',
    path: '/requests/:id',
    handle: ({ params }) => findById(MOCK_REQUESTS, params.id),
  },
];
