import { selectCurrentPhoto, useVehiclePhotoStore } from './vehicle-photo-store';

const store = () => useVehiclePhotoStore.getState();
const currentPhoto = () => selectCurrentPhoto(store());

beforeEach(() => useVehiclePhotoStore.setState({ selectedVehicleId: null, photos: {} }));

describe('useVehiclePhotoStore', () => {
  it('starts with no selected vehicle and no photo', () => {
    expect(store().selectedVehicleId).toBeNull();
    expect(currentPhoto()).toBeNull();
  });

  it('stores the picked photo and replaces it with a newer one', () => {
    store().setPhoto('file:///a.jpg');
    expect(currentPhoto()).toBe('file:///a.jpg');
    store().setPhoto('file:///b.jpg');
    expect(currentPhoto()).toBe('file:///b.jpg');
  });

  it('goes back to the placeholder when the photo is removed', () => {
    store().setPhoto('file:///a.jpg');
    store().removePhoto();
    expect(currentPhoto()).toBeNull();
  });

  it('keeps a separate photo for each vehicle', () => {
    store().selectVehicle('VEH_1');
    store().setPhoto('file:///one.jpg');
    store().selectVehicle('VEH_2');
    expect(currentPhoto()).toBeNull();
    store().setPhoto('file:///two.jpg');

    store().selectVehicle('VEH_1');
    expect(currentPhoto()).toBe('file:///one.jpg');
    store().selectVehicle('VEH_2');
    expect(currentPhoto()).toBe('file:///two.jpg');
  });

  it('removes only the selected vehicle photo', () => {
    store().selectVehicle('VEH_1');
    store().setPhoto('file:///one.jpg');
    store().selectVehicle('VEH_2');
    store().setPhoto('file:///two.jpg');

    store().removePhoto();
    expect(currentPhoto()).toBeNull();
    store().selectVehicle('VEH_1');
    expect(currentPhoto()).toBe('file:///one.jpg');
  });
});
