import { fireEvent, screen } from '@testing-library/react-native';
import { router } from 'expo-router';

import { i18n } from '@/lib/i18n';
import { renderWithProviders } from '@tests/helpers/render-with-providers';

import { PaymentSuccessScreen } from './payment-success-screen';

let mockParams: Record<string, string> = {};

jest.mock('@react-native-community/netinfo', () =>
  require('@react-native-community/netinfo/jest/netinfo-mock.js'),
);
jest.mock('lucide-react-native', () => new Proxy({}, { get: () => () => null }));
jest.mock('react-native-reanimated', () => require('@tests/mocks/react-native-reanimated'));
jest.mock('expo-router', () => ({
  router: { back: jest.fn(), navigate: jest.fn() },
  useLocalSearchParams: () => mockParams,
}));
jest.mock('react-native-keyboard-controller', () => {
  const { ScrollView } = require('react-native');
  return { KeyboardAwareScrollView: ScrollView };
});
jest.mock('react-native-safe-area-context', () => {
  const { View } = require('react-native');
  return {
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
    SafeAreaView: View,
  };
});
jest.mock('@/features/locations', () => ({
  MAINTENANCE_CENTERS: jest.requireActual('../../locations/data/maintenance-centers')
    .MAINTENANCE_CENTERS,
}));

beforeEach(async () => {
  jest.clearAllMocks();
  mockParams = {
    type: 'regularMaintenance',
    packageKm: '10',
    vehicleId: 'VEH_1',
    centerId: 'maadi',
    amount: '12050',
    code: '6754728',
    paidAt: new Date(2026, 10, 15).toISOString(),
  };
  await i18n.changeLanguage('en');
});

describe('PaymentSuccessScreen', () => {
  it('confirms the payment and summarises it', async () => {
    await renderWithProviders(<PaymentSuccessScreen />);
    expect(screen.getByText('Payment Successful')).toBeTruthy();
    expect(screen.getByText('12,050.00 EGP')).toBeTruthy();
    expect(screen.getByText('Nov 15, 2026')).toBeTruthy();
    expect(screen.getByText('#6754728')).toBeTruthy();
    expect(screen.getByText('10K Maintenance')).toBeTruthy();
    expect(screen.getByText('AutoConnect Maadi Center')).toBeTruthy();
    for (const label of ['Amount', 'Date', 'Transaction Code', 'Vehicle', 'Service Type']) {
      expect(screen.getByText(label)).toBeTruthy();
    }
    expect(await screen.findByText('Toyota Corolla 2022')).toBeTruthy();
  });

  it('opens the bookings list from View Booking Details', async () => {
    await renderWithProviders(<PaymentSuccessScreen />);
    await fireEvent.press(screen.getByRole('button', { name: 'View Booking Details' }));
    expect(router.navigate).toHaveBeenCalledWith('/services');
  });

  it('returns to My Garage', async () => {
    await renderWithProviders(<PaymentSuccessScreen />);
    await fireEvent.press(screen.getByRole('button', { name: 'Back to My Garage' }));
    expect(router.navigate).toHaveBeenCalledWith('/');
  });

  it('is translated to Arabic', async () => {
    await i18n.changeLanguage('ar');
    await renderWithProviders(<PaymentSuccessScreen />);
    expect(screen.getByText('تمت عملية الدفع بنجاح')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'العودة إلى جراجي' })).toBeTruthy();
  });
});
