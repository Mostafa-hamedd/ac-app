import { fireEvent, screen } from '@testing-library/react-native';
import { router } from 'expo-router';

import { i18n } from '@/lib/i18n';
import { renderWithProviders } from '@tests/helpers/render-with-providers';

import type { AppNotification } from '../types/notification.types';

import { NotificationsScreen } from './notifications-screen';

jest.mock('expo-router', () => ({ router: { push: jest.fn() } }));
jest.mock('react-native-reanimated', () => require('@tests/mocks/react-native-reanimated'));
jest.mock('@react-native-community/netinfo', () => ({
  useNetInfo: () => ({ isConnected: true }),
  addEventListener: () => () => undefined,
}));
jest.mock('react-native-keyboard-controller', () => ({
  KeyboardAwareScrollView: require('react-native').ScrollView,
}));
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: require('react-native').View,
}));
jest.mock('lucide-react-native', () => new Proxy({}, { get: () => () => null }));

const mockQuery = jest.fn();
jest.mock('../hooks/use-notifications', () => ({ useNotifications: () => mockQuery() }));

const UNREAD: AppNotification = {
  id: 'N1',
  title: 'Invoice ready',
  body: 'Your invoice is ready to pay.',
  category: 'payment',
  read: false,
  createdAt: '2026-10-29T08:00:00.000Z',
};
const READ: AppNotification = {
  id: 'N2',
  title: 'Service completed',
  body: 'Your annual service is complete.',
  category: 'request',
  read: true,
  createdAt: '2026-10-02T09:20:00.000Z',
};

function loaded(data: AppNotification[]) {
  return {
    isPending: false,
    isError: false,
    data,
    hasNextPage: false,
    isFetchingNextPage: false,
    isRefetching: false,
    refetch: jest.fn(),
    fetchNextPage: jest.fn(),
  };
}

beforeEach(async () => {
  jest.clearAllMocks();
  await i18n.changeLanguage('en');
});

describe('NotificationsScreen', () => {
  it('groups unread notifications under New and the rest under Older', async () => {
    mockQuery.mockReturnValue(loaded([UNREAD, READ]));
    await renderWithProviders(<NotificationsScreen />);
    expect(screen.getByText('New')).toBeTruthy();
    expect(screen.getByText('Older')).toBeTruthy();
    expect(screen.getByText('Your invoice is ready to pay.')).toBeTruthy();
    expect(screen.getByText('Your annual service is complete.')).toBeTruthy();
    // Only the payment notification offers "Pay now".
    expect(screen.getAllByText('Pay now')).toHaveLength(1);
  });

  it('moves everything to Older with "Mark all as read"', async () => {
    mockQuery.mockReturnValue(loaded([UNREAD, READ]));
    await renderWithProviders(<NotificationsScreen />);
    await fireEvent.press(screen.getByRole('button', { name: 'Mark all as read' }));
    expect(screen.queryByText('New')).toBeNull();
    expect(screen.queryByText('Mark all as read')).toBeNull();
    expect(screen.getByText('Older')).toBeTruthy();
  });

  it('opens the notification details when a row is pressed', async () => {
    mockQuery.mockReturnValue(loaded([UNREAD]));
    await renderWithProviders(<NotificationsScreen />);
    await fireEvent.press(screen.getByRole('button', { name: 'Invoice ready' }));
    expect(router.push).toHaveBeenCalledWith({
      pathname: '/notifications/[notificationId]',
      params: { notificationId: 'N1' },
    });
  });

  it('shows an empty state when there are none', async () => {
    mockQuery.mockReturnValue(loaded([]));
    await renderWithProviders(<NotificationsScreen />);
    expect(screen.getByText('No notifications yet')).toBeTruthy();
  });

  it('shows the empty state in Arabic', async () => {
    await i18n.changeLanguage('ar');
    mockQuery.mockReturnValue(loaded([]));
    await renderWithProviders(<NotificationsScreen />);
    expect(screen.getByText('لا توجد إشعارات بعد')).toBeTruthy();
  });
});
