import { renderHook } from '@testing-library/react-native';

import { useUnreadNotificationCount } from './use-unread-count';

const mockUseNotifications = jest.fn();
jest.mock('./use-notifications', () => ({ useNotifications: () => mockUseNotifications() }));

const item = (id: string, read: boolean) => ({ id, read });

describe('useUnreadNotificationCount', () => {
  it('counts only unread notifications', async () => {
    mockUseNotifications.mockReturnValue({
      data: [item('1', false), item('2', true), item('3', false)],
    });
    const { result } = await renderHook(() => useUnreadNotificationCount());
    expect(result.current).toBe(2);
  });

  it('is 0 while loading or when everything is read', async () => {
    mockUseNotifications.mockReturnValue({ data: undefined });
    expect((await renderHook(() => useUnreadNotificationCount())).result.current).toBe(0);
    mockUseNotifications.mockReturnValue({ data: [item('1', true)] });
    expect((await renderHook(() => useUnreadNotificationCount())).result.current).toBe(0);
  });
});
