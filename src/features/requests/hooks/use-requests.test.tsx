import { renderHook, waitFor } from '@testing-library/react-native';

import { requestSummaryFixture } from '@tests/fixtures/requests';
import { createQueryWrapper } from '@tests/helpers/render-with-providers';

import { getRequests } from '../api/requests.api';

import { useRequests } from './use-requests';

jest.mock('../api/requests.api');

describe('useRequests', () => {
  it('flattens paginated results into a single list', async () => {
    jest
      .mocked(getRequests)
      .mockResolvedValue({ items: [requestSummaryFixture], nextCursor: null });

    const { result } = await renderHook(() => useRequests(), { wrapper: createQueryWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([requestSummaryFixture]);
    expect(result.current.hasNextPage).toBe(false);
  });
});
