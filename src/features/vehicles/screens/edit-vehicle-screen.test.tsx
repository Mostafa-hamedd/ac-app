import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';
import { Alert } from 'react-native';

import { i18n } from '@/lib/i18n';
import { renderWithProviders } from '@tests/helpers/render-with-providers';

import { deleteVehicle, getVehicleById, updateVehicle } from '../api/vehicles.api';

import { EditVehicleScreen } from './edit-vehicle-screen';

jest.mock('../api/vehicles.api', () => ({
  getVehicleById: jest.fn(),
  updateVehicle: jest.fn(),
  deleteVehicle: jest.fn(),
}));
jest.mock('@react-native-community/netinfo', () =>
  require('@react-native-community/netinfo/jest/netinfo-mock.js'),
);
jest.mock('lucide-react-native', () => new Proxy({}, { get: () => () => null }));
jest.mock('react-native-reanimated', () => require('@tests/mocks/react-native-reanimated'));
jest.mock('expo-router', () => ({
  router: { back: jest.fn(), push: jest.fn() },
  useLocalSearchParams: () => ({ vehicleId: 'V1' }),
}));
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

const VEHICLE = {
  id: 'V1',
  make: 'Opel',
  model: 'Astra',
  year: 2021,
  licensePlate: '1234 ABC',
  vin: 'W0L0AH756HG098234',
  status: 'active' as const,
  mileage: 45000,
};

beforeEach(async () => {
  jest.clearAllMocks();
  await i18n.changeLanguage('en');
  jest.mocked(getVehicleById).mockResolvedValue(VEHICLE);
  jest.mocked(updateVehicle).mockResolvedValue(VEHICLE);
  jest.mocked(deleteVehicle).mockResolvedValue(undefined);
});

describe('EditVehicleScreen', () => {
  it('shows the vehicle details in the fields', async () => {
    await renderWithProviders(<EditVehicleScreen />);
    expect(await screen.findByDisplayValue('1234 ABC')).toBeTruthy();
    expect(screen.getByDisplayValue('W0L0AH756HG098234')).toBeTruthy();
    expect(screen.getByDisplayValue('45000')).toBeTruthy();
    expect(screen.getByText('Opel')).toBeTruthy();
    expect(screen.getByText('Astra')).toBeTruthy();
    expect(screen.getByText('2021')).toBeTruthy();
  });

  it('saves the changes and goes back', async () => {
    await renderWithProviders(<EditVehicleScreen />);
    await fireEvent.changeText(await screen.findByLabelText('License Plate'), 'NEW 999');
    await fireEvent.press(screen.getByRole('button', { name: 'Update Vehicle' }));
    await waitFor(() =>
      expect(updateVehicle).toHaveBeenCalledWith(
        'V1',
        expect.objectContaining({ licensePlate: 'NEW 999', make: 'Opel', mileage: 45000 }),
      ),
    );
    await waitFor(() => expect(router.back).toHaveBeenCalled());
  });

  it('disables Update while the VIN is invalid', async () => {
    await renderWithProviders(<EditVehicleScreen />);
    await fireEvent.changeText(await screen.findByLabelText('VIN Number'), 'SHORT');
    expect(
      screen.getByRole('button', { name: 'Update Vehicle' }).props.accessibilityState.disabled,
    ).toBe(true);
  });

  it('asks before deleting and deletes when confirmed', async () => {
    const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
    await renderWithProviders(<EditVehicleScreen />);
    await fireEvent.press(await screen.findByRole('button', { name: 'Delete Vehicle' }));
    expect(deleteVehicle).not.toHaveBeenCalled();
    const confirm = alert.mock.calls[0]![2]!.find((button) => button.style === 'destructive')!;
    await confirm.onPress?.();
    await waitFor(() => expect(deleteVehicle).toHaveBeenCalledWith('V1'));
    await waitFor(() => expect(router.back).toHaveBeenCalled());
  });

  it('is translated to Arabic', async () => {
    await i18n.changeLanguage('ar');
    await renderWithProviders(<EditVehicleScreen />);
    expect(await screen.findByRole('button', { name: 'تحديث المركبة' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'حذف المركبة' })).toBeTruthy();
  });
});
