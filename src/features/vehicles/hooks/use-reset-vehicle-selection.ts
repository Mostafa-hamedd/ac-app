import { useEffect } from 'react';

import { useVehiclePhotoStore } from '../store/vehicle-photo-store';

/**
 * Forgets the selected vehicle and the photos picked for it when the signed-in area goes away
 * (sign out or an expired session), so the next person to sign in on this device does not see
 * them. Mount once inside the signed-in area.
 */
export function useResetVehicleSelectionOnExit(): void {
  useEffect(() => () => useVehiclePhotoStore.setState({ selectedVehicleId: null, photos: {} }), []);
}
