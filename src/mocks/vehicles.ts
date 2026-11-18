import type { NewVehicle, Vehicle, VehicleUpdate } from '@/features/vehicles';

import { findById, MockHttpError, paginate, type MockRoute } from './server';

/** Centralized, realistic mock dataset — shared vehicle labels appear across requests/payments too. */
export const MOCK_VEHICLES: Vehicle[] = [
  {
    id: 'VEH_1',
    nickname: 'Daily driver',
    make: 'Toyota',
    model: 'Corolla',
    fuelType: 'petrol',
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
    fuelType: 'hybrid',
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
    fuelType: 'petrol',
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
    method: 'POST',
    path: '/vehicles',
    handle: ({ body }) => {
      const input = body as Partial<NewVehicle>;
      if (!input.licensePlate || !input.vin || !input.make || !input.model || !input.year) {
        throw new MockHttpError(400, 'Missing vehicle details.');
      }
      const vehicle: Vehicle = {
        id: `VEH_${MOCK_VEHICLES.length + 1}`,
        make: input.make,
        model: input.model,
        year: input.year,
        licensePlate: input.licensePlate,
        vin: input.vin,
        fuelType: input.fuelType,
        status: 'active',
      };
      // The mock "server" keeps the new car for the rest of the session.
      MOCK_VEHICLES.push(vehicle);
      return vehicle;
    },
  },
  {
    method: 'GET',
    path: '/vehicles/:id',
    handle: ({ params }) => findById(MOCK_VEHICLES, params.id),
  },
  {
    method: 'PUT',
    path: '/vehicles/:id',
    handle: ({ params, body }) => {
      const vehicle = findById(MOCK_VEHICLES, params.id);
      const input = body as Partial<VehicleUpdate>;
      if (!input.licensePlate || !input.vin || !input.make || !input.model || !input.year) {
        throw new MockHttpError(400, 'Missing vehicle details.');
      }
      Object.assign(vehicle, input);
      return vehicle;
    },
  },
  {
    method: 'DELETE',
    path: '/vehicles/:id',
    handle: ({ params }) => {
      const vehicle = findById(MOCK_VEHICLES, params.id);
      MOCK_VEHICLES.splice(MOCK_VEHICLES.indexOf(vehicle), 1);
      return null;
    },
  },
];
