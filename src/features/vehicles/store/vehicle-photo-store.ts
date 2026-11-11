import { create } from 'zustand';

/** Photos are kept under this key until a vehicle has been selected. */
const NO_VEHICLE = '_none';

type VehiclePhotoState = {
  /** The vehicle shown on Home, or null until the vehicle list has loaded. */
  selectedVehicleId: string | null;
  /** Local URI of the photo the user picked, per vehicle. */
  photos: Record<string, string>;
  selectVehicle: (vehicleId: string) => void;
  /** Sets the photo of the selected vehicle. */
  setPhoto: (uri: string) => void;
  /** Removes the photo of the selected vehicle, so it shows the placeholder again. */
  removePhoto: () => void;
};

const keyOf = (state: Pick<VehiclePhotoState, 'selectedVehicleId'>) =>
  state.selectedVehicleId ?? NO_VEHICLE;

/**
 * The selected vehicle and each vehicle's photo. Kept for the app session;
 * there is no backend yet.
 */
export const useVehiclePhotoStore = create<VehiclePhotoState>((set) => ({
  selectedVehicleId: null,
  photos: {},
  selectVehicle: (vehicleId) => set({ selectedVehicleId: vehicleId }),
  setPhoto: (uri) => set((state) => ({ photos: { ...state.photos, [keyOf(state)]: uri } })),
  removePhoto: () =>
    set((state) => {
      const { [keyOf(state)]: _removed, ...rest } = state.photos;
      return { photos: rest };
    }),
}));

/** The photo of the selected vehicle, or null when it has none. */
export const selectCurrentPhoto = (state: VehiclePhotoState): string | null =>
  state.photos[keyOf(state)] ?? null;
