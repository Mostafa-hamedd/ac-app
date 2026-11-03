import type { Vehicle } from '@/features/vehicles';

import { findById, paginate, type MockRoute } from './server';

/** Centralized, realistic mock dataset — shared vehicle labels appear across requests/payments too. */
export const MOCK_VEHICLES: Vehicle[] = [
  {
    id: 'VEH_1',
    nickname: 'Daily driver',
    make: 'Toyota',
    model: 'Corolla',
    year: 2022,
    licensePlate: 'ABC-1234',
    status: 'active',
    vin: '1HGCM82633A004352',
    color: 'Silver',
    mileage: 28450,
    lastServiceAt: '2026-10-02T09:15:00.000Z',
    nextServiceDueAt: '2027-04-02T09:00:00.000Z',
  },
  {
    id: 'VEH_2',
    nickname: 'Family SUV',
    make: 'Honda',
    model: 'CR-V',
    year: 2021,
    licensePlate: 'XYZ-5678',
    status: 'needs_attention',
    vin: '5J6RW2H59DL000001',
    color: 'Blue',
    mileage: 41230,
    lastServiceAt: '2026-04-15T10:00:00.000Z',
    nextServiceDueAt: '2026-10-15T10:00:00.000Z',
  },
  {
    id: 'VEH_3',
    make: 'Ford',
    model: 'F-150',
    year: 2023,
    licensePlate: 'TRK-9012',
    status: 'in_service',
    vin: '1FTFW1E50NFA00001',
    color: 'Black',
    mileage: 15870,
    lastServiceAt: '2026-08-14T13:00:00.000Z',
  },
];

export const vehiclesRoutes: MockRoute[] = [
  {
    method: 'GET',
    path: '/vehicles',
    handle: ({ query }) => paginate(MOCK_VEHICLES, query.cursor, 10),
  },
  {
    method: 'GET',
    path: '/vehicles/:id',
    handle: ({ params }) => findById(MOCK_VEHICLES, params.id),
  },
];
