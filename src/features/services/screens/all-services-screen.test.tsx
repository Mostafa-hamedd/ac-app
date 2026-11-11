import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';
import { Alert, Linking } from 'react-native';

import { ROADSIDE_HOTLINE } from '@/config/support';
import { i18n } from '@/lib/i18n';

import { MOCK_ACTIVE_SERVICES, MOCK_SERVICE_HISTORY } from '../data/mock-services';

import { AllServicesScreen } from './all-services-screen';

jest.mock('@react-native-community/netinfo', () =>
  require('@react-native-community/netinfo/jest/netinfo-mock.js'),
);
jest.mock('lucide-react-native', () => new Proxy({}, { get: () => () => null }));
jest.mock('react-native-reanimated', () => require('@tests/mocks/react-native-reanimated'));
jest.mock('expo-router', () => ({ router: { back: jest.fn(), push: jest.fn() } }));
jest.mock('react-native-safe-area-context', () => {
  const { View } = require('react-native');
  return {
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
    SafeAreaView: View,
  };
});
jest.mock('react-native-keyboard-controller', () => {
  const { ScrollView } = require('react-native');
  return { KeyboardAwareScrollView: ScrollView };
});

beforeEach(async () => {
  jest.clearAllMocks();
  await i18n.changeLanguage('en');
  jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
  jest.spyOn(Linking, 'openURL').mockResolvedValue(undefined);
});

describe('AllServicesScreen', () => {
  it('shows the header with a working back button', async () => {
    await render(<AllServicesScreen />);
    expect(screen.getByText('All Services')).toBeTruthy();
    await fireEvent.press(screen.getByLabelText('Go back'));
    expect(router.back).toHaveBeenCalledTimes(1);
  });

  it('shows the Book New Service button and opens the booking screen with it', async () => {
    await render(<AllServicesScreen />);
    expect(screen.getByText('+ Book New Service')).toBeTruthy();
    await fireEvent.press(screen.getByText('+ Book New Service'));
    expect(router.push).toHaveBeenCalledWith('/book-service');
  });

  it('lists the active services with the count, status, appointment and the right action', async () => {
    await render(<AllServicesScreen />);
    expect(screen.getByText('Active Services (2)')).toBeTruthy();

    expect(screen.getByText('Tire Pressure Check')).toBeTruthy();
    expect(screen.getByText('Ongoing')).toBeTruthy();
    expect(screen.getByText('Appt: Today, 03:30 PM')).toBeTruthy();
    expect(screen.getByText('Track Service')).toBeTruthy();

    expect(screen.getByText('10K Maintenance')).toBeTruthy();
    expect(screen.getByText('Upcoming')).toBeTruthy();
    expect(screen.getByText('Appt: 7 May 2025')).toBeTruthy();
    expect(screen.getByText('View Booking')).toBeTruthy();
    expect(screen.getAllByText('Sheikh Zayed Center')).toHaveLength(2);
  });

  it('lists the service history with its completion date and amount', async () => {
    await render(<AllServicesScreen />);
    expect(screen.getByText('Service History')).toBeTruthy();
    expect(screen.getByText('Transmission Fluid Change')).toBeTruthy();
    expect(screen.getByText('Completed on 11 Sep 2023')).toBeTruthy();
    expect(screen.getByText('Completed')).toBeTruthy();
    expect(screen.getByText('EGP 1,500 Paid')).toBeTruthy();
    expect(screen.getByText('View Details')).toBeTruthy();
  });

  it('renders every mock service', async () => {
    await render(<AllServicesScreen />);
    for (const service of [...MOCK_ACTIVE_SERVICES, ...MOCK_SERVICE_HISTORY]) {
      expect(screen.getByText(service.title.en)).toBeTruthy();
    }
  });

  it('is fully translated to Arabic', async () => {
    await i18n.changeLanguage('ar');
    await render(<AllServicesScreen />);
    expect(screen.getByText('كل الخدمات')).toBeTruthy();
    expect(screen.getByText('+ حجز خدمة جديدة')).toBeTruthy();
    expect(screen.getByText('الخدمات النشطة (2)')).toBeTruthy();
    expect(screen.getByText('فحص ضغط الإطارات')).toBeTruthy();
    expect(screen.getByText('جارية')).toBeTruthy();
    expect(screen.getByText('تتبع الخدمة')).toBeTruthy();
    expect(screen.getByText('سجل الخدمات')).toBeTruthy();
    expect(screen.getByText('مكتملة')).toBeTruthy();
    expect(screen.getByText('تحتاج مساعدة؟')).toBeTruthy();
  });

  it('opens the dialer from Need Help?', async () => {
    await render(<AllServicesScreen />);
    await fireEvent.press(screen.getByText('Need Help?'));
    await waitFor(() => expect(Linking.openURL).toHaveBeenCalledWith(`tel:${ROADSIDE_HOTLINE}`));
  });

  it('tells the user when the dialer cannot be opened', async () => {
    jest.spyOn(Linking, 'openURL').mockRejectedValueOnce(new Error('no dialer'));
    await render(<AllServicesScreen />);
    await fireEvent.press(screen.getByText('Need Help?'));
    await waitFor(() =>
      expect(Alert.alert).toHaveBeenCalledWith('Calling is not available on this device.'),
    );
  });
});
