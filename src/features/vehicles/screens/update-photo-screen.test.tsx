import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';
import { Alert, Linking } from 'react-native';

import '@/lib/i18n';

import { selectCurrentPhoto, useVehiclePhotoStore } from '../store/vehicle-photo-store';

import { UpdatePhotoScreen } from './update-photo-screen';

const mockPickFromCamera = jest.fn();
const mockPickFromGallery = jest.fn();

jest.mock('@/shared/hooks/use-image-picker', () => ({
  useImagePicker: () => ({
    isPicking: false,
    pickFromCamera: mockPickFromCamera,
    pickFromGallery: mockPickFromGallery,
  }),
}));
jest.mock('@react-native-community/netinfo', () =>
  require('@react-native-community/netinfo/jest/netinfo-mock.js'),
);
jest.mock('lucide-react-native', () => new Proxy({}, { get: () => () => null }));
jest.mock('react-native-reanimated', () => require('@tests/mocks/react-native-reanimated'));
jest.mock('expo-router', () => ({ router: { back: jest.fn() } }));
jest.mock('react-native-safe-area-context', () => {
  const { View } = require('react-native');
  return {
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
    SafeAreaView: View,
  };
});
jest.mock('react-native-keyboard-controller', () => {
  const { ScrollView } = require('react-native');
  return { KeyboardAwareScrollView: ScrollView };
});

const submitButton = () => screen.getByTestId('save-photo');
const isDisabled = (element: ReturnType<typeof submitButton>) =>
  element.props.accessibilityState.disabled;

beforeEach(() => {
  jest.clearAllMocks();
  useVehiclePhotoStore.setState({ selectedVehicleId: null, photos: {} });
  jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
  jest.spyOn(Linking, 'openSettings').mockResolvedValue(undefined);
});

describe('UpdatePhotoScreen', () => {
  it('shows the title, the current photo and the three options', async () => {
    await render(<UpdatePhotoScreen />);
    expect(screen.getByText('Update Photo')).toBeTruthy();
    expect(screen.getByTestId('vehicle-photo-default')).toBeTruthy();
    expect(screen.getByLabelText('Take Photo')).toBeTruthy();
    expect(screen.getByLabelText('Choose from Gallery')).toBeTruthy();
    expect(screen.getByLabelText('Remove Photo')).toBeTruthy();
  });

  it('starts with the submit button disabled', async () => {
    await render(<UpdatePhotoScreen />);
    expect(isDisabled(submitButton())).toBe(true);
  });

  it('enables the submit button after taking a photo, without saving yet', async () => {
    mockPickFromCamera.mockResolvedValue({
      status: 'picked',
      image: { uri: 'file:///camera.jpg' },
    });
    await render(<UpdatePhotoScreen />);
    await fireEvent.press(screen.getByLabelText('Take Photo'));

    await waitFor(() => expect(isDisabled(submitButton())).toBe(false));
    // The new photo is previewed here, but not saved until submit.
    expect(screen.getByTestId('vehicle-photo-custom').props.source).toEqual({
      uri: 'file:///camera.jpg',
    });
    expect(selectCurrentPhoto(useVehiclePhotoStore.getState())).toBeNull();
  });

  it('saves a photo chosen from the gallery and goes back on submit', async () => {
    mockPickFromGallery.mockResolvedValue({
      status: 'picked',
      image: { uri: 'file:///gallery.jpg' },
    });
    await render(<UpdatePhotoScreen />);
    await fireEvent.press(screen.getByLabelText('Choose from Gallery'));
    await waitFor(() => expect(isDisabled(submitButton())).toBe(false));

    await fireEvent.press(submitButton());
    expect(selectCurrentPhoto(useVehiclePhotoStore.getState())).toBe('file:///gallery.jpg');
    expect(router.back).toHaveBeenCalledTimes(1);
  });

  it('keeps the submit button disabled when the picker is cancelled', async () => {
    mockPickFromGallery.mockResolvedValue({ status: 'cancelled' });
    await render(<UpdatePhotoScreen />);
    await fireEvent.press(screen.getByLabelText('Choose from Gallery'));
    await waitFor(() => expect(mockPickFromGallery).toHaveBeenCalled());
    expect(isDisabled(submitButton())).toBe(true);
  });

  it('does not submit while nothing has changed', async () => {
    await render(<UpdatePhotoScreen />);
    await fireEvent.press(submitButton());
    expect(router.back).not.toHaveBeenCalled();
  });

  it('explains and offers Settings when permission is denied, leaving submit disabled', async () => {
    mockPickFromCamera.mockResolvedValue({ status: 'denied' });
    await render(<UpdatePhotoScreen />);
    await fireEvent.press(screen.getByLabelText('Take Photo'));
    await waitFor(() => expect(Alert.alert).toHaveBeenCalled());
    const [title, message, buttons] = (Alert.alert as jest.Mock).mock.calls[0];
    expect(title).toBe('Photo access needed');
    expect(message).toContain('Settings');
    expect(isDisabled(submitButton())).toBe(true);

    await act(async () => buttons[1].onPress());
    expect(Linking.openSettings).toHaveBeenCalled();
  });

  it('removes the saved photo only after submit', async () => {
    useVehiclePhotoStore.getState().setPhoto('file:///saved.jpg');
    await render(<UpdatePhotoScreen />);
    expect(screen.getByLabelText('Remove Photo').props.accessibilityState.disabled).toBe(false);
    expect(isDisabled(submitButton())).toBe(true);

    await fireEvent.press(screen.getByLabelText('Remove Photo'));
    expect(screen.getByTestId('vehicle-photo-default')).toBeTruthy();
    expect(selectCurrentPhoto(useVehiclePhotoStore.getState())).toBe('file:///saved.jpg');
    expect(isDisabled(submitButton())).toBe(false);

    await fireEvent.press(submitButton());
    expect(selectCurrentPhoto(useVehiclePhotoStore.getState())).toBeNull();
    expect(router.back).toHaveBeenCalledTimes(1);
  });

  it('only allows removing once there is a photo', async () => {
    await render(<UpdatePhotoScreen />);
    expect(screen.getByLabelText('Remove Photo').props.accessibilityState.disabled).toBe(true);
  });

  it('disables submit again when the draft goes back to the saved photo', async () => {
    mockPickFromGallery.mockResolvedValue({ status: 'picked', image: { uri: 'file:///new.jpg' } });
    await render(<UpdatePhotoScreen />);
    await fireEvent.press(screen.getByLabelText('Choose from Gallery'));
    await waitFor(() => expect(isDisabled(submitButton())).toBe(false));

    // Nothing was saved before, so removing the draft returns to the unchanged state.
    await fireEvent.press(screen.getByLabelText('Remove Photo'));
    expect(isDisabled(submitButton())).toBe(true);
  });
});
