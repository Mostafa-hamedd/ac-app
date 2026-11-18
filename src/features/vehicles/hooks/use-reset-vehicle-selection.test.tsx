import { render } from '@testing-library/react-native';

import { useVehiclePhotoStore } from '../store/vehicle-photo-store';

import { useResetVehicleSelectionOnExit } from './use-reset-vehicle-selection';

function SignedInArea() {
  useResetVehicleSelectionOnExit();
  return null;
}

describe('useResetVehicleSelectionOnExit', () => {
  it('keeps the selection while signed in and forgets it when the area unmounts', async () => {
    useVehiclePhotoStore.setState({
      selectedVehicleId: 'VEH_2',
      photos: { VEH_2: 'file://a.jpg' },
    });
    const view = await render(<SignedInArea />);
    expect(useVehiclePhotoStore.getState().selectedVehicleId).toBe('VEH_2');

    await view.unmount();
    expect(useVehiclePhotoStore.getState()).toMatchObject({ selectedVehicleId: null, photos: {} });
  });
});
