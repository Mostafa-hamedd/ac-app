import { fireEvent, screen } from '@testing-library/react-native';
import { router } from 'expo-router';

import '@/lib/i18n';
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
