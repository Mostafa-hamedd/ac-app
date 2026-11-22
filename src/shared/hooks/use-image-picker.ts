import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';

export type PickedImage = { uri: string; mimeType?: string; fileName?: string };

export type PickResult =
  { status: 'picked'; image: PickedImage } | { status: 'cancelled' } | { status: 'denied' };

export type ImagePickerOptions = {
  /** Opens the system crop / edit screen after the photo is taken or chosen. */
  allowsEditing?: boolean;
};

async function pickFrom(
  source: 'camera' | 'gallery',
  { allowsEditing = false }: ImagePickerOptions,
): Promise<PickResult> {
  const pickerOptions: ImagePicker.ImagePickerOptions = {
    mediaTypes: ['images'],
    quality: 0.8,
    allowsEditing,
  };
  const permission =
    source === 'camera'
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) return { status: 'denied' };

  const result =
    source === 'camera'
      ? await ImagePicker.launchCameraAsync(pickerOptions)
      : await ImagePicker.launchImageLibraryAsync(pickerOptions);

  const [asset] = result.assets ?? [];
  if (result.canceled || !asset) return { status: 'cancelled' };
  return {
    status: 'picked',
    image: {
      uri: asset.uri,
      mimeType: asset.mimeType ?? undefined,
      fileName: asset.fileName ?? undefined,
    },
  };
}

/** Camera / gallery picker that asks for permission first. */
export function useImagePicker(options: ImagePickerOptions = {}) {
  const [isPicking, setIsPicking] = useState(false);

  async function pick(source: 'camera' | 'gallery'): Promise<PickResult> {
    setIsPicking(true);
    try {
      return await pickFrom(source, options);
    } finally {
      setIsPicking(false);
    }
  }

  return {
    isPicking,
    pickFromCamera: () => pick('camera'),
    pickFromGallery: () => pick('gallery'),
  };
}
