import { act, fireEvent, screen } from '@testing-library/react-native';
import { router } from 'expo-router';
import { Alert, Linking } from 'react-native';

import { ROADSIDE_HOTLINE } from '@/config/support';
import { i18n } from '@/lib/i18n';
import { renderWithProviders } from '@tests/helpers/render-with-providers';

import { MyGarageScreen } from './my-garage-screen';

jest.mock('expo-router', () => ({ router: { push: jest.fn(), back: jest.fn() } }));
jest.mock('@react-native-community/netinfo', () =>
  require('@react-native-community/netinfo/jest/netinfo-mock.js'),
);
jest.mock('lucide-react-native', () => new Proxy({}, { get: () => () => null }));
jest.mock('react-native-reanimated', () => require('@tests/mocks/react-native-reanimated'));
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
// The assistance sheet is a native bottom sheet; it has its own flow.
jest.mock('../components/assistance-sheet', () => ({ AssistanceSheet: () => null }));

describe('MyGarageScreen', () => {
  it('shows the vehicle photo card above the roadside help card', async () => {
    await renderWithProviders(<MyGarageScreen />);
    expect(screen.getByTestId('vehicle-photo-default')).toBeTruthy();
    expect(screen.getByText('Need roadside help?')).toBeTruthy();
  });

  it('shows the car tabs above the vehicle photo card', async () => {
    await renderWithProviders(<MyGarageScreen />);
    expect(await screen.findByText('Toyota Corolla')).toBeTruthy();
    expect(screen.getByText('Add')).toBeTruthy();
    expect(screen.getByTestId('vehicle-photo-default')).toBeTruthy();
  });

  it('shows the Services & Booking section below the roadside help card', async () => {
    await renderWithProviders(<MyGarageScreen />);
    expect(screen.getByText('Services & Booking')).toBeTruthy();
    expect(screen.getByText('Book New')).toBeTruthy();
  });

  it('opens All Services from the Book New button', async () => {
    await renderWithProviders(<MyGarageScreen />);
    await fireEvent.press(screen.getByText('Book New'));
    expect(router.push).toHaveBeenCalledWith('/services');
  });

  it('opens the Update Photo screen from the camera button', async () => {
    await renderWithProviders(<MyGarageScreen />);
    await fireEvent.press(screen.getByLabelText('Change vehicle photo'));
    expect(router.push).toHaveBeenCalledWith('/update-photo');
  });
});

describe('MyGarageScreen sections', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await i18n.changeLanguage('en');
  });

  it('shows the ongoing service with its progress and estimate', async () => {
    await renderWithProviders(<MyGarageScreen />);
    expect(screen.getByText('Ongoing Service')).toBeTruthy();
    expect(screen.getByText('In Progress')).toBeTruthy();
    expect(screen.getByText('10k Scheduled Maintenance')).toBeTruthy();
    expect(screen.getByText('Sheikh Zayed Service Center')).toBeTruthy();
    for (const step of [
      'Tire Pressure Diagnostics',
      'Functional Systems test',
      'Oil & Filter replacement',
      'Transmission Fluid Top-up',
    ]) {
      expect(screen.getByText(step)).toBeTruthy();
    }
    expect(screen.getByText('Ready Estimation:')).toBeTruthy();
    expect(screen.getByText('11 Sep')).toBeTruthy();
    expect(screen.getByText('5:00 PM')).toBeTruthy();
  });

  it('lists an upcoming and a completed booking under Services & Booking', async () => {
    await renderWithProviders(<MyGarageScreen />);
    expect(screen.getByText('Tire Pressure Calibration')).toBeTruthy();
    expect(screen.getByText('Upcoming')).toBeTruthy();
    expect(screen.getByText('Transmission Fluid Check')).toBeTruthy();
    expect(screen.getByText('Completed')).toBeTruthy();
    expect(screen.getByText('View Service Details')).toBeTruthy();
  });

  it('opens the service center on the map when its name is pressed', async () => {
    await renderWithProviders(<MyGarageScreen />);
    await fireEvent.press(screen.getByRole('link', { name: 'Sheikh Zayed Service Center' }));
    expect(router.push).toHaveBeenCalledWith({
      pathname: '/location',
      params: { centerId: 'sheikh-zayed' },
    });
  });

  it('reschedules a booking by opening the booking form for that service', async () => {
    await renderWithProviders(<MyGarageScreen />);
    await fireEvent.press(screen.getByRole('button', { name: 'Reschedule' }));
    expect(router.push).toHaveBeenCalledWith({
      pathname: '/book-new-service',
      params: { type: 'tireService' },
    });
  });

  it('asks before cancelling and removes the booking when confirmed', async () => {
    const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
    await renderWithProviders(<MyGarageScreen />);
    await fireEvent.press(screen.getByRole('button', { name: 'Cancel' }));
    expect(alert).toHaveBeenCalledTimes(1);
    expect(screen.getByText('Tire Pressure Calibration')).toBeTruthy();

    const buttons = alert.mock.calls[0]![2]!;
    const confirm = buttons.find((button) => button.text === 'Cancel booking')!;
    await act(async () => confirm.onPress?.());
    expect(screen.queryByText('Tire Pressure Calibration')).toBeNull();
    expect(screen.getByText('Transmission Fluid Check')).toBeTruthy();
  });

  it('keeps the booking when the cancellation is declined', async () => {
    const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
    await renderWithProviders(<MyGarageScreen />);
    await fireEvent.press(screen.getByRole('button', { name: 'Cancel' }));
    const keep = alert.mock.calls[0]![2]!.find((button) => button.text === 'Keep booking')!;
    expect(keep.style).toBe('cancel');
    expect(screen.getByText('Tire Pressure Calibration')).toBeTruthy();
  });

  it('opens All Services from View Service Details', async () => {
    await renderWithProviders(<MyGarageScreen />);
    await fireEvent.press(screen.getByRole('button', { name: 'View Service Details' }));
    expect(router.push).toHaveBeenCalledWith('/services');
  });

  it('shows the due payment with its amount and actions', async () => {
    await renderWithProviders(<MyGarageScreen />);
    expect(screen.getByText('Due Payments')).toBeTruthy();
    expect(screen.getByText('Due by 15 Sep 2023')).toBeTruthy();
    expect(screen.getByText('Functional Tests Fee')).toBeTruthy();
    expect(screen.getByText('1,500 EGP')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'View Invoice' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Pay Now' })).toBeTruthy();
  });

  it('dials support from the help link', async () => {
    const open = jest.spyOn(Linking, 'openURL').mockResolvedValue(undefined);
    await renderWithProviders(<MyGarageScreen />);
    await fireEvent.press(screen.getByRole('button', { name: 'Need Help with your Garage?' }));
    expect(open).toHaveBeenCalledWith(`tel:${ROADSIDE_HOTLINE}`);
  });

  it('is translated to Arabic', async () => {
    await i18n.changeLanguage('ar');
    await renderWithProviders(<MyGarageScreen />);
    expect(screen.getByText('الخدمة الجارية')).toBeTruthy();
    expect(screen.getByText('المدفوعات المستحقة')).toBeTruthy();
    expect(screen.getByText('1,500 جنيه')).toBeTruthy();
    expect(screen.getByText('تحتاج مساعدة بخصوص جراجك؟')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'إعادة جدولة' })).toBeTruthy();
  });
});
