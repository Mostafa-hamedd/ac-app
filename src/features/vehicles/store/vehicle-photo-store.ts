import { create } from 'zustand';

type VehiclePhotoState = {
  /** Local URI of the photo the user picked, or null to show the default illustration. */
  photoUri: string | null;
  setPhoto: (uri: string) => void;
  removePhoto: () => void;
};

/** The vehicle photo shown on Home. Kept for the app session; there is no backend yet. */
export const useVehiclePhotoStore = create<VehiclePhotoState>((set) => ({
  photoUri: null,
  setPhoto: (uri) => set({ photoUri: uri }),
  removePhoto: () => set({ photoUri: null }),
}));
