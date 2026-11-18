import { fireEvent, screen } from '@testing-library/react-native';
import { router } from 'expo-router';

import { i18n } from '@/lib/i18n';
import { renderWithProviders } from '@tests/helpers/render-with-providers';

import { useVehiclePhotoStore } from '../store/vehicle-photo-store';
import type { VehicleSummary } from '../types/vehicle.types';

import { VehicleSelectorSheet } from './vehicle-selector-sheet';

const VEHICLES: VehicleSummary[] = [
  {
    id: 'V1',
    make: 'Opel',
    model: 'Mokka-e',
    year: 2024,
    licensePlate: 'A',
    status: 'active',
    fuelType: 'electric',
    mileage: 12450,
  },
  {
    id: 'V2',
    make: 'Opel',
    model: 'Corsa',
    year: 2022,
    licensePlate: 'B',
    status: 'active',
    fuelType: 'petrol',
    mileage: 34120,
  },
  { id: 'V3', make: 'Ford', model: 'Focus', year: 2020, licensePlate: 'C', status: 'active' },
];

jest.mock('../hooks/use-vehicles', () => ({ useVehicles: () => ({ data: VEHICLES }) }));
jest.mock('expo-router', () => ({ router: { push: jest.fn() } }));
jest.mock('lucide-react-native', () => new Proxy({}, { get: () => () => null }));
jest.mock('react-native-reanimated', () => require('@tests/mocks/react-native-reanimated'));
jest.mock('@gorhom/bottom-sheet', () => {
  const { View, ScrollView } = require('react-native');
  return {
    BottomSheetModal: ({ children }: { children: React.ReactNode }) => <View>{children}</View>,
    BottomSheetScrollView: ScrollView,
    BottomSheetBackdrop: () => null,
  };
});

const radio = (name: string) => screen.getByRole('radio', { name: `Select ${name}` });
const isSelected = (name: string) => radio(name).props.accessibilityState.selected;

beforeEach(async () => {
  jest.clearAllMocks();
  await i18n.changeLanguage('en');
  useVehiclePhotoStore.setState({ selectedVehicleId: 'V1', photos: {} });
});

describe('VehicleSelectorSheet', () => {
  it('lists the vehicles with fuel, year and mileage, the selected one marked', async () => {
    await renderWithProviders(<VehicleSelectorSheet />);
    expect(screen.getByText('My Vehicles')).toBeTruthy();
    expect(screen.getByText('Electric · 2024 · 12,450 km')).toBeTruthy();
    expect(screen.getByText('Petrol · 2022 · 34,120 km')).toBeTruthy();
    // Only what is known is shown.
    expect(screen.getByText('2020')).toBeTruthy();
    expect(isSelected('Opel Mokka-e')).toBe(true);
    expect(isSelected('Opel Corsa')).toBe(false);
  });

  it('moves the mark on press but only applies the choice on Done', async () => {
    await renderWithProviders(<VehicleSelectorSheet />);
    await fireEvent.press(radio('Opel Corsa'));
    expect(isSelected('Opel Corsa')).toBe(true);
    expect(isSelected('Opel Mokka-e')).toBe(false);
    expect(useVehiclePhotoStore.getState().selectedVehicleId).toBe('V1');

    await fireEvent.press(screen.getByRole('button', { name: 'Done' }));
    expect(useVehiclePhotoStore.getState().selectedVehicleId).toBe('V2');
  });

  it('leaves the selection alone when Done is pressed without a change', async () => {
    await renderWithProviders(<VehicleSelectorSheet />);
    await fireEvent.press(screen.getByRole('button', { name: 'Done' }));
    expect(useVehiclePhotoStore.getState().selectedVehicleId).toBe('V1');
  });

  it('opens Add Vehicle from Add New Vehicle', async () => {
    await renderWithProviders(<VehicleSelectorSheet />);
    await fireEvent.press(screen.getByRole('button', { name: 'Add New Vehicle' }));
    expect(router.push).toHaveBeenCalledWith('/add-vehicle');
  });

  it('opens Edit Vehicle for the highlighted car from the Edit button', async () => {
    await renderWithProviders(<VehicleSelectorSheet />);
    await fireEvent.press(screen.getAllByRole('radio')[1]!);
    await fireEvent.press(screen.getByRole('button', { name: 'Edit' }));
    expect(router.push).toHaveBeenCalledWith({
      pathname: '/edit-vehicle',
      params: { vehicleId: expect.any(String) },
    });
  });

  it('reads in Arabic', async () => {
    await i18n.changeLanguage('ar');
    await renderWithProviders(<VehicleSelectorSheet />);
    expect(screen.getByText('مركباتي')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'تم' })).toBeTruthy();
  });
});
