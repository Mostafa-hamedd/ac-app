import { MOCK_VEHICLES } from '@/mocks/vehicles';

import { getVehicleById, getVehicles } from './vehicles.api';

describe('getVehicles', () => {
  it('returns every vehicle on one page', async () => {
    const result = await getVehicles();
    expect(result.items).toHaveLength(MOCK_VEHICLES.length);
    expect(result.nextCursor).toBeNull();
  });
});

describe('getVehicleById', () => {
  it('returns the matching vehicle', async () => {
    const [first] = MOCK_VEHICLES;
    await expect(getVehicleById(first!.id)).resolves.toEqual(first);
  });

  it('throws a not_found ApiError for an unknown id', async () => {
    await expect(getVehicleById('nope')).rejects.toMatchObject({ kind: 'not_found' });
  });

  it('throws a simulated server error for the magic id', async () => {
    await expect(getVehicleById('ERROR')).rejects.toMatchObject({ kind: 'server' });
  });
});
