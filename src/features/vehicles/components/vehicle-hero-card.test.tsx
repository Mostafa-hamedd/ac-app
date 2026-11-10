import { act, fireEvent, render, screen } from '@testing-library/react-native';

import '@/lib/i18n';

import { useVehiclePhotoStore } from '../store/vehicle-photo-store';

import { VehicleHeroCard } from './vehicle-hero-card';

jest.mock('lucide-react-native', () => new Proxy({}, { get: () => () => null }));
jest.mock('react-native-reanimated', () => require('@tests/mocks/react-native-reanimated'));

beforeEach(() => useVehiclePhotoStore.getState().removePhoto());

describe('VehicleHeroCard', () => {
  it('shows the placeholder when there is no custom photo', async () => {
    await render(<VehicleHeroCard onEditPhoto={jest.fn()} />);
    expect(screen.getByTestId('vehicle-photo-default')).toBeTruthy();
    expect(screen.queryByTestId('vehicle-photo-custom')).toBeNull();
  });

  it('shows the user photo once one is picked, and the default again after removing it', async () => {
    await render(<VehicleHeroCard onEditPhoto={jest.fn()} />);
    await act(async () => useVehiclePhotoStore.getState().setPhoto('file:///mine.jpg'));
    expect(screen.getByTestId('vehicle-photo-custom').props.source).toEqual({
      uri: 'file:///mine.jpg',
    });
    expect(screen.queryByTestId('vehicle-photo-default')).toBeNull();

    await act(async () => useVehiclePhotoStore.getState().removePhoto());
    expect(screen.getByTestId('vehicle-photo-default')).toBeTruthy();
  });

  it('falls back to the placeholder when the photo cannot be loaded', async () => {
    await render(<VehicleHeroCard onEditPhoto={jest.fn()} />);
    await act(async () => useVehiclePhotoStore.getState().setPhoto('file:///broken.jpg'));
    await fireEvent(screen.getByTestId('vehicle-photo-custom'), 'error');
    expect(screen.getByTestId('vehicle-photo-default')).toBeTruthy();
    expect(screen.queryByTestId('vehicle-photo-custom')).toBeNull();

    // A different photo gets a fresh chance to load.
    await act(async () => useVehiclePhotoStore.getState().setPhoto('file:///good.jpg'));
    expect(screen.getByTestId('vehicle-photo-custom')).toBeTruthy();
  });

  it('calls onEditPhoto when the camera button is pressed', async () => {
    const onEditPhoto = jest.fn();
    await render(<VehicleHeroCard onEditPhoto={onEditPhoto} />);
    await fireEvent.press(screen.getByLabelText('Change vehicle photo'));
    expect(onEditPhoto).toHaveBeenCalledTimes(1);
  });
});
