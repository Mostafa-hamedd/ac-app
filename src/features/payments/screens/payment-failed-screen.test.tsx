import { fireEvent, screen } from '@testing-library/react-native';
import { router } from 'expo-router';
import { Linking } from 'react-native';

import { ROADSIDE_HOTLINE } from '@/config/support';
import { i18n } from '@/lib/i18n';
import { renderWithProviders } from '@tests/helpers/render-with-providers';

import { PaymentFailedScreen } from './payment-failed-screen';

const mockParams = { type: 'tireService', vehicleId: 'VEH_1', centerId: 'maadi', time: '10:00' };

jest.mock('@react-native-community/netinfo', () =>
  require('@react-native-community/netinfo/jest/netinfo-mock.js'),
);
jest.mock('lucide-react-native', () => new Proxy({}, { get: () => () => null }));
jest.mock('react-native-reanimated', () => require('@tests/mocks/react-native-reanimated'));
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
jest.mock('expo-router', () => ({
  router: { navigate: jest.fn() },
  useLocalSearchParams: () => mockParams,
}));

beforeEach(async () => {
  jest.clearAllMocks();
  await i18n.changeLanguage('en');
});

describe('PaymentFailedScreen', () => {
  it('says the payment failed and what to do', async () => {
    await renderWithProviders(<PaymentFailedScreen />);
    expect(screen.getByText('Payment Failed')).toBeTruthy();
    expect(screen.getByText(/could not be completed/)).toBeTruthy();
  });

  it('goes back to Payment Details with the same booking on Try Again', async () => {
    await renderWithProviders(<PaymentFailedScreen />);
    await fireEvent.press(screen.getByRole('button', { name: 'Try Again' }));
    expect(router.navigate).toHaveBeenCalledWith({
      pathname: '/payment-details',
      params: mockParams,
    });
  });

  it('dials support', async () => {
    const open = jest.spyOn(Linking, 'openURL').mockResolvedValue(undefined);
    await renderWithProviders(<PaymentFailedScreen />);
    await fireEvent.press(screen.getByRole('button', { name: 'Contact Support' }));
    expect(open).toHaveBeenCalledWith(`tel:${ROADSIDE_HOTLINE}`);
  });

  it('is translated to Arabic', async () => {
    await i18n.changeLanguage('ar');
    await renderWithProviders(<PaymentFailedScreen />);
    expect(screen.getByText('فشلت عملية الدفع')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'حاول مرة أخرى' })).toBeTruthy();
  });
});
