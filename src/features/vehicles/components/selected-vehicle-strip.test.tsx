import { screen } from '@testing-library/react-native';

import '@/lib/i18n';
import { renderWithProviders } from '@tests/helpers/render-with-providers';

import { useVehiclePhotoStore } from '../store/vehicle-photo-store';

import { SelectedVehicleStrip } from './selected-vehicle-strip';

jest.mock('react-native-reanimated', () => require('@tests/mocks/react-native-reanimated'));
jest.mock('lucide-react-native', () => new Proxy({}, { get: () => () => null }));

beforeEach(() => useVehiclePhotoStore.setState({ selectedVehicleId: null, photos: {} }));

describe('SelectedVehicleStrip', () => {
  it('shows nothing until the vehicles have loaded', async () => {
    await renderWithProviders(<SelectedVehicleStrip />);
    expect(screen.queryByText('Toyota Corolla')).toBeNull();
  });

  it('shows the first vehicle when none is selected yet', async () => {
    await renderWithProviders(<SelectedVehicleStrip />);
    expect(await screen.findByText('Toyota Corolla')).toBeTruthy();
    expect(screen.getByText('ABC-1234 · 2022')).toBeTruthy();
    expect(screen.getByTestId('vehicle-photo-default')).toBeTruthy();
  });

  it('shows the selected vehicle and its own photo', async () => {
    useVehiclePhotoStore.setState({
      selectedVehicleId: 'VEH_2',
      photos: { VEH_2: 'file:///crv.jpg' },
    });
    await renderWithProviders(<SelectedVehicleStrip />);
    expect(await screen.findByText('Honda CR-V')).toBeTruthy();
    expect(screen.getByText('XYZ-5678 · 2021')).toBeTruthy();
    expect(screen.getByTestId('vehicle-photo-custom').props.source).toEqual({
      uri: 'file:///crv.jpg',
    });
  });
});
