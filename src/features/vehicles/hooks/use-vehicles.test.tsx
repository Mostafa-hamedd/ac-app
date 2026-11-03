import { renderHook, waitFor } from '@testing-library/react-native';

import { vehicleSummaryFixture } from '@tests/fixtures/vehicles';
import { createQueryWrapper } from '@tests/helpers/render-with-providers';

import { getVehicles } from '../api/vehicles.api';

import { useVehicles } from './use-vehicles';

jest.mock('../api/vehicles.api');

describe('useVehicles', () => {
  it('flattens paginated results into a single list', async () => {
    jest
      .mocked(getVehicles)
      .mockResolvedValue({ items: [vehicleSummaryFixture], nextCursor: null });

    const { result } = await renderHook(() => useVehicles(), { wrapper: createQueryWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([vehicleSummaryFixture]);
    expect(result.current.hasNextPage).toBe(false);
  });
});
