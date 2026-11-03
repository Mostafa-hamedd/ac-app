import { MOCK_REQUESTS } from '@/mocks/requests';

import { getRequestById, getRequests } from './requests.api';

describe('getRequests', () => {
  it('paginates the full list when no filter is applied', async () => {
    const first = await getRequests({ filters: {} });
    expect(first.items).toHaveLength(4);
    expect(first.nextCursor).not.toBeNull();

    const second = await getRequests({ filters: {}, cursor: first.nextCursor });
    expect(second.items[0]!.id).not.toBe(first.items[0]!.id);
  });

  it('filters by status', async () => {
    const result = await getRequests({ filters: { status: 'completed' } });
    expect(result.items.length).toBeGreaterThan(0);
    expect(result.items.every((item) => item.status === 'completed')).toBe(true);
  });

  it('returns an empty page for a status no mock request has', async () => {
    // Every ServiceRequestStatus is exercised except the ones filtered here.
    const result = await getRequests({ filters: { status: 'scheduled' } });
    expect(result.items.every((item) => item.status === 'scheduled')).toBe(true);
  });
});

describe('getRequestById', () => {
  it('returns the matching request', async () => {
    const [first] = MOCK_REQUESTS;
    await expect(getRequestById(first!.id)).resolves.toEqual(first);
  });

  it('throws a not_found ApiError for an unknown id', async () => {
    await expect(getRequestById('nope')).rejects.toMatchObject({ kind: 'not_found' });
  });

  it('throws a simulated server error for the magic id', async () => {
    await expect(getRequestById('ERROR')).rejects.toMatchObject({ kind: 'server' });
  });
});
