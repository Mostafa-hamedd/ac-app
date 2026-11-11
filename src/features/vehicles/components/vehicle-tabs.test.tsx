import { fireEvent, screen } from '@testing-library/react-native';

import '@/lib/i18n';
import { renderWithProviders } from '@tests/helpers/render-with-providers';

import { selectCurrentPhoto, useVehiclePhotoStore } from '../store/vehicle-photo-store';

import { VehicleTabs, vehicleLabel } from './vehicle-tabs';

jest.mock('lucide-react-native', () => new Proxy({}, { get: () => () => null }));
jest.mock('react-native-reanimated', () => require('@tests/mocks/react-native-reanimated'));

beforeEach(() => useVehiclePhotoStore.setState({ selectedVehicleId: null, photos: {} }));

const isSelected = (name: string) =>
  screen.getByRole('tab', { name }).props.accessibilityState.selected;

describe('vehicleLabel', () => {
  it('joins make and model', () => {
    expect(vehicleLabel({ make: 'Opel', model: 'Astra' })).toBe('Opel Astra');
  });
});

describe('VehicleTabs', () => {
  it('shows a tab for each car from the vehicle data, plus Add', async () => {
    await renderWithProviders(<VehicleTabs />);
    expect(await screen.findByText('Toyota Corolla')).toBeTruthy();
    expect(screen.getByText('Honda CR-V')).toBeTruthy();
    expect(screen.getByText('Ford F-150')).toBeTruthy();
    expect(screen.getByText('Add')).toBeTruthy();
  });

  it('does not stretch to fill spare height (no gap under the tabs)', async () => {
    await renderWithProviders(<VehicleTabs />);
    await screen.findByText('Toyota Corolla');
    expect(screen.getByLabelText('My cars').props.style).toEqual(
      expect.objectContaining({ flexGrow: 0 }),
    );
  });

  it('selects the first car by default', async () => {
    await renderWithProviders(<VehicleTabs />);
    await screen.findByText('Toyota Corolla');
    expect(useVehiclePhotoStore.getState().selectedVehicleId).toBe('VEH_1');
    expect(isSelected('Toyota Corolla')).toBe(true);
    expect(isSelected('Honda CR-V')).toBe(false);
  });

  it('switches the selected car when another tab is pressed', async () => {
    await renderWithProviders(<VehicleTabs />);
    await fireEvent.press(await screen.findByText('Honda CR-V'));
    expect(useVehiclePhotoStore.getState().selectedVehicleId).toBe('VEH_2');
    expect(isSelected('Honda CR-V')).toBe(true);
    expect(isSelected('Toyota Corolla')).toBe(false);
  });

  it('keeps the user choice and gives each car its own photo', async () => {
    await renderWithProviders(<VehicleTabs />);
    await fireEvent.press(await screen.findByText('Toyota Corolla'));
    useVehiclePhotoStore.getState().setPhoto('file:///corolla.jpg');
    await fireEvent.press(screen.getByText('Honda CR-V'));
    expect(selectCurrentPhoto(useVehiclePhotoStore.getState())).toBeNull();
    await fireEvent.press(screen.getByText('Toyota Corolla'));
    expect(selectCurrentPhoto(useVehiclePhotoStore.getState())).toBe('file:///corolla.jpg');
  });

  it('calls onAddVehicle when Add is pressed', async () => {
    const onAddVehicle = jest.fn();
    await renderWithProviders(<VehicleTabs onAddVehicle={onAddVehicle} />);
    await fireEvent.press(await screen.findByText('Add'));
    expect(onAddVehicle).toHaveBeenCalledTimes(1);
  });
});
