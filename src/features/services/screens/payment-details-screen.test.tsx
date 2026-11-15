import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';

import { i18n } from '@/lib/i18n';
import { renderWithProviders } from '@tests/helpers/render-with-providers';

import { PaymentDetailsScreen } from './payment-details-screen';

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

const maintenanceParams = {
  type: 'regularMaintenance',
  packageKm: '10',
  vehicleId: 'VEH_1',
  centerId: 'maadi',
  date: new Date(2026, 10, 20).toISOString(),
  time: '15:30',
};

beforeEach(async () => {
  jest.clearAllMocks();
  mockParams = maintenanceParams;
  await i18n.changeLanguage('en');
});

describe('PaymentDetailsScreen', () => {
  it('shows the booking details card instead of an invoice context card', async () => {
    await renderWithProviders(<PaymentDetailsScreen />);
    expect(screen.getByText('Payment Details')).toBeTruthy();
    for (const label of ['Service', 'Vehicle', 'Service Center', 'Date & Time', 'Estimated Cost']) {
      expect(screen.getByText(label)).toBeTruthy();
    }
    expect(screen.getByText('10K Maintenance')).toBeTruthy();
    expect(screen.getByText('AutoConnect Maadi Center')).toBeTruthy();
    expect(screen.getByText('November 20, 2026, 03:30 PM')).toBeTruthy();
    expect(screen.getByText('EGP 12,000')).toBeTruthy();
    expect(screen.queryByText('Payment Due')).toBeNull();
    expect(screen.queryByText(/Invoice #/)).toBeNull();
  });

  it('shows the vehicle once the list has loaded', async () => {
    await renderWithProviders(<PaymentDetailsScreen />);
    expect(await screen.findByText('Toyota Corolla 2022')).toBeTruthy();
  });

  it('shows the invoice lines, subtotal, taxes and total', async () => {
    await renderWithProviders(<PaymentDetailsScreen />);
    expect(screen.getByText('Labour')).toBeTruthy();
    expect(screen.getByText('7,200.00 EGP')).toBeTruthy();
    expect(screen.getByText('Subtotal')).toBeTruthy();
    expect(screen.getByText('12,000.00 EGP', { exact: true })).toBeTruthy();
    expect(screen.getByText('50.00 EGP')).toBeTruthy();
    expect(screen.getByText('Total Due')).toBeTruthy();
    expect(screen.getByText('12,050.00 EGP')).toBeTruthy();
  });

  it('shows the saved payment method', async () => {
    await renderWithProviders(<PaymentDetailsScreen />);
    expect(screen.getByText('•••• 4242')).toBeTruthy();
    expect(screen.getByText('Change')).toBeTruthy();
  });

  it('opens the terms in a modal when the underlined words are pressed', async () => {
    await renderWithProviders(<PaymentDetailsScreen />);
    expect(screen.getByText(/I have read and agree to the/)).toBeTruthy();
    expect(screen.queryByText('Changes and cancellation')).toBeNull();
    await fireEvent.press(screen.getByRole('link', { name: 'Terms and Conditions' }));
    expect(screen.getByText('Changes and cancellation')).toBeTruthy();
    await fireEvent.press(screen.getAllByRole('button', { name: 'Close' }).at(-1)!);
    await waitFor(() => expect(screen.queryByText('Changes and cancellation')).toBeNull());
  });

  it('keeps Pay Now disabled until the terms box is ticked', async () => {
    await renderWithProviders(<PaymentDetailsScreen />);
    const box = () => screen.getByRole('checkbox');
    const pay = () => screen.getByRole('button', { name: 'Pay Now' });
    expect(box().props.accessibilityState.checked).toBe(false);
    expect(pay().props.accessibilityState.disabled).toBe(true);
    await fireEvent.press(box());
    expect(box().props.accessibilityState.checked).toBe(true);
    expect(pay().props.accessibilityState.disabled).toBe(false);
    await fireEvent.press(box());
    expect(pay().props.accessibilityState.disabled).toBe(true);
  });

  it('disables Pay Now and explains when the price is still to be quoted', async () => {
    mockParams = { ...maintenanceParams, type: 'other', packageKm: '' };
    await renderWithProviders(<PaymentDetailsScreen />);
    await fireEvent.press(screen.getByRole('checkbox'));
    expect(screen.getByRole('button', { name: 'Pay Now' }).props.accessibilityState.disabled).toBe(
      true,
    );
    expect(screen.getByText(/confirmed by the service center/)).toBeTruthy();
    expect(screen.queryByText('Subtotal')).toBeNull();
  });

  it('goes back to the booking form', async () => {
    await renderWithProviders(<PaymentDetailsScreen />);
    await fireEvent.press(screen.getByLabelText('Go back'));
    expect(router.navigate).toHaveBeenCalledWith({
      pathname: '/book-new-service',
      params: { type: 'regularMaintenance' },
    });
  });

  it('is translated to Arabic', async () => {
    await i18n.changeLanguage('ar');
    await renderWithProviders(<PaymentDetailsScreen />);
    await waitFor(() => expect(screen.getByText('تفاصيل الدفع')).toBeTruthy());
    expect(screen.getByText('ادفع الآن')).toBeTruthy();
    expect(screen.getByText('الإجمالي المستحق')).toBeTruthy();
  });
});
