import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';
import { Alert, Linking } from 'react-native';

import { ROADSIDE_HOTLINE } from '@/config/support';
import { i18n } from '@/lib/i18n';
import { renderWithProviders } from '@tests/helpers/render-with-providers';

import { SERVICE_TYPES } from '../data/service-types';

import { BookServiceScreen } from './book-service-screen';

jest.mock('@react-native-community/netinfo', () =>
  require('@react-native-community/netinfo/jest/netinfo-mock.js'),
);
jest.mock('lucide-react-native', () => new Proxy({}, { get: () => () => null }));
jest.mock('react-native-reanimated', () => require('@tests/mocks/react-native-reanimated'));
jest.mock('expo-router', () => ({
  router: { back: jest.fn(), push: jest.fn(), navigate: jest.fn() },
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

const isSelected = (name: string) =>
  screen.getByRole('radio', { name }).props.accessibilityState.selected;

beforeEach(async () => {
  jest.clearAllMocks();
  await i18n.changeLanguage('en');
  jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
  jest.spyOn(Linking, 'openURL').mockResolvedValue(undefined);
});

describe('BookServiceScreen', () => {
  it('shows the header with a working back button', async () => {
    await renderWithProviders(<BookServiceScreen />);
    expect(screen.getByText('Book New Service')).toBeTruthy();
    await fireEvent.press(screen.getByLabelText('Go back'));
    expect(router.navigate).toHaveBeenCalledWith('/services');
  });

  it('shows the selected vehicle from the vehicle data', async () => {
    await renderWithProviders(<BookServiceScreen />);
    expect(await screen.findByText('Toyota Corolla')).toBeTruthy();
    expect(screen.getByText('ABC-1234 · 2022')).toBeTruthy();
  });

  it('lists the six service types, none selected at first', async () => {
    await renderWithProviders(<BookServiceScreen />);
    expect(screen.getByText('Select Service Type')).toBeTruthy();
    expect(screen.getAllByRole('radio')).toHaveLength(SERVICE_TYPES.length);
    for (const name of [
      'Regular Maintenance',
      'Tire Service',
      'Brake Service',
      'Battery Check',
      'AC Service',
      'Other',
    ]) {
      expect(isSelected(name)).toBe(false);
    }
  });

  it('keeps the button disabled until a service is selected', async () => {
    await renderWithProviders(<BookServiceScreen />);
    const button = screen.getByRole('button', { name: 'Select a service to continue' });
    expect(button.props.accessibilityState.disabled).toBe(true);
  });

  it('selects a service, enabling the button', async () => {
    await renderWithProviders(<BookServiceScreen />);
    await fireEvent.press(screen.getByRole('radio', { name: 'Tire Service' }));
    expect(isSelected('Tire Service')).toBe(true);
    expect(screen.queryByText('Select a service to continue')).toBeNull();
    const button = screen.getByRole('button', { name: 'Continue' });
    expect(button.props.accessibilityState.disabled).toBe(false);
  });

  it('opens the booking form with the chosen service type when Continue is pressed', async () => {
    await renderWithProviders(<BookServiceScreen />);
    await fireEvent.press(screen.getByRole('radio', { name: 'Brake Service' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Continue' }));
    expect(router.push).toHaveBeenCalledWith({
      pathname: '/book-new-service',
      params: { type: 'brakeService' },
    });
  });

  it('does not open the form while no service is selected', async () => {
    await renderWithProviders(<BookServiceScreen />);
    await fireEvent.press(screen.getByRole('button', { name: 'Select a service to continue' }));
    expect(router.push).not.toHaveBeenCalled();
  });

  it('moves the selection when another service is chosen', async () => {
    await renderWithProviders(<BookServiceScreen />);
    await fireEvent.press(screen.getByRole('radio', { name: 'Tire Service' }));
    await fireEvent.press(screen.getByRole('radio', { name: 'AC Service' }));
    expect(isSelected('AC Service')).toBe(true);
    expect(isSelected('Tire Service')).toBe(false);
  });

  it('is translated to Arabic', async () => {
    await i18n.changeLanguage('ar');
    await renderWithProviders(<BookServiceScreen />);
    expect(screen.getByText('حجز خدمة جديدة')).toBeTruthy();
    expect(screen.getByText('اختر نوع الخدمة')).toBeTruthy();
    expect(screen.getByRole('radio', { name: 'صيانة دورية' })).toBeTruthy();
    expect(screen.getByText('اختر خدمة للمتابعة')).toBeTruthy();
    expect(screen.getByText('لا تجد ما تبحث عنه؟')).toBeTruthy();
    expect(screen.getByText('تواصل مع الدعم')).toBeTruthy();
  });

  it('opens the dialer from Contact Support', async () => {
    await renderWithProviders(<BookServiceScreen />);
    await fireEvent.press(screen.getByText('Contact Support'));
    await waitFor(() => expect(Linking.openURL).toHaveBeenCalledWith(`tel:${ROADSIDE_HOTLINE}`));
  });

  it('tells the user when the dialer cannot be opened', async () => {
    jest.spyOn(Linking, 'openURL').mockRejectedValueOnce(new Error('no dialer'));
    await renderWithProviders(<BookServiceScreen />);
    await fireEvent.press(screen.getByText('Contact Support'));
    await waitFor(() =>
      expect(Alert.alert).toHaveBeenCalledWith('Calling is not available on this device.'),
    );
  });
});
