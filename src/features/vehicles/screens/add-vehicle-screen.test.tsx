import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';
import { Alert } from 'react-native';

import { i18n } from '@/lib/i18n';
import { renderWithProviders } from '@tests/helpers/render-with-providers';

import { createVehicle } from '../api/vehicles.api';
import { useVehiclePhotoStore } from '../store/vehicle-photo-store';

import { AddVehicleScreen } from './add-vehicle-screen';

jest.mock('../api/vehicles.api', () => ({ createVehicle: jest.fn() }));
jest.mock('@/shared/hooks/use-image-picker', () => ({
  useImagePicker: () => ({
    isPicking: false,
    pickFromCamera: jest.fn(),
    pickFromGallery: jest.fn(),
  }),
}));
jest.mock('@react-native-community/netinfo', () =>
  require('@react-native-community/netinfo/jest/netinfo-mock.js'),
);
jest.mock('lucide-react-native', () => new Proxy({}, { get: () => () => null }));
jest.mock('react-native-reanimated', () => require('@tests/mocks/react-native-reanimated'));
jest.mock('expo-router', () => ({ router: { back: jest.fn() } }));
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

const VIN = '1HGCM82633A004352';
const createVehicleMock = jest.mocked(createVehicle);
const submit = () => screen.getByRole('button', { name: 'Add Vehicle' });
const isDisabled = () => submit().props.accessibilityState.disabled;

async function choose(field: string, option: string) {
  await fireEvent.press(screen.getByRole('button', { name: field }));
  await fireEvent.press(screen.getByRole('menuitem', { name: option }));
}

async function fillEverything() {
  await fireEvent.changeText(screen.getByLabelText('License Plate'), 'F-OP 2024');
  await fireEvent.changeText(screen.getByLabelText('VIN Number'), VIN);
  await choose('Make', 'Opel');
  await choose('Model', 'Astra');
  await choose('Year', String(new Date().getFullYear()));
  await fireEvent.press(screen.getByRole('radio', { name: 'Electric' }));
}

beforeEach(async () => {
  jest.clearAllMocks();
  await i18n.changeLanguage('en');
  useVehiclePhotoStore.setState({ selectedVehicleId: null, photos: {} });
});

describe('AddVehicleScreen', () => {
  it('shows every field of the design with the button disabled', async () => {
    await renderWithProviders(<AddVehicleScreen />);
    for (const label of ['License Plate', 'VIN Number', 'Make', 'Model', 'Year', 'Fuel Type']) {
      expect(screen.getAllByText(label).length).toBeGreaterThan(0);
    }
    expect(screen.getByText('Tap to add vehicle photo')).toBeTruthy();
    expect(isDisabled()).toBe(true);
  });

  it('only offers the models of the chosen make, and clears the model when the make changes', async () => {
    await renderWithProviders(<AddVehicleScreen />);
    expect(screen.getByRole('button', { name: 'Model' }).props.accessibilityState.disabled).toBe(
      true,
    );
    await choose('Make', 'Opel');
    await fireEvent.press(screen.getByRole('button', { name: 'Model' }));
    expect(screen.getByRole('menuitem', { name: 'Astra' })).toBeTruthy();
    expect(screen.queryByRole('menuitem', { name: 'Corolla' })).toBeNull();
    await fireEvent.press(screen.getByRole('menuitem', { name: 'Astra' }));

    await choose('Make', 'Toyota');
    expect(screen.getByRole('button', { name: 'Model' }).props.accessibilityValue.text).toBe(
      'Select model',
    );
  });

  it('explains an invalid VIN once the field is left', async () => {
    await renderWithProviders(<AddVehicleScreen />);
    const vin = screen.getByLabelText('VIN Number');
    await fireEvent.changeText(vin, 'SHORT');
    expect(screen.queryByText(/17 letters and numbers/)).toBeNull();
    await fireEvent(vin, 'blur');
    expect(screen.getByText(/17 letters and numbers/)).toBeTruthy();
  });

  it('enables the button once everything is filled', async () => {
    await renderWithProviders(<AddVehicleScreen />);
    await fillEverything();
    expect(isDisabled()).toBe(false);
  });

  it('adds the vehicle, selects it and goes back', async () => {
    createVehicleMock.mockResolvedValue({
      id: 'VEH_9',
      make: 'Opel',
      model: 'Astra',
      year: new Date().getFullYear(),
      licensePlate: 'F-OP 2024',
      vin: VIN,
      status: 'active',
    });
    await renderWithProviders(<AddVehicleScreen />);
    await fillEverything();
    await fireEvent.press(submit());

    await waitFor(() => expect(router.back).toHaveBeenCalledTimes(1));
    expect(createVehicleMock).toHaveBeenCalledWith({
      licensePlate: 'F-OP 2024',
      vin: VIN,
      make: 'Opel',
      model: 'Astra',
      year: new Date().getFullYear(),
      fuelType: 'electric',
    });
    expect(useVehiclePhotoStore.getState().selectedVehicleId).toBe('VEH_9');
  });

  it('stays on the form and says so when adding fails', async () => {
    const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
    createVehicleMock.mockRejectedValue(new Error('boom'));
    await renderWithProviders(<AddVehicleScreen />);
    await fillEverything();
    await fireEvent.press(submit());

    await waitFor(() => expect(alert).toHaveBeenCalledWith(expect.stringContaining('could not')));
    expect(router.back).not.toHaveBeenCalled();
  });

  it('reads in Arabic', async () => {
    await i18n.changeLanguage('ar');
    await renderWithProviders(<AddVehicleScreen />);
    expect(screen.getAllByText('رقم اللوحة').length).toBeGreaterThan(0);
    expect(screen.getAllByText('إضافة مركبة').length).toBeGreaterThan(0);
  });
});
