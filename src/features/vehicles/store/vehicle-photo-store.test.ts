import { useVehiclePhotoStore } from './vehicle-photo-store';

beforeEach(() => useVehiclePhotoStore.getState().removePhoto());

describe('useVehiclePhotoStore', () => {
  it('starts without a custom photo', () => {
    expect(useVehiclePhotoStore.getState().photoUri).toBeNull();
  });

  it('stores the picked photo and replaces it with a newer one', () => {
    useVehiclePhotoStore.getState().setPhoto('file:///a.jpg');
    expect(useVehiclePhotoStore.getState().photoUri).toBe('file:///a.jpg');
    useVehiclePhotoStore.getState().setPhoto('file:///b.jpg');
    expect(useVehiclePhotoStore.getState().photoUri).toBe('file:///b.jpg');
  });

  it('goes back to the default when the photo is removed', () => {
    useVehiclePhotoStore.getState().setPhoto('file:///a.jpg');
    useVehiclePhotoStore.getState().removePhoto();
    expect(useVehiclePhotoStore.getState().photoUri).toBeNull();
  });
});
