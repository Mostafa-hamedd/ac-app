import { Car } from 'lucide-react-native';
import { useState } from 'react';
import { Image, View, type ViewProps } from 'react-native';

import { cn } from '@/shared/utils/cn';
import { colors } from '@/theme';

import { useVehiclePhotoStore } from '../store/vehicle-photo-store';

type VehiclePhotoProps = ViewProps & {
  /** Photo to show instead of the saved one (e.g. a not-yet-saved choice). `null` shows the placeholder. */
  uri?: string | null;
};

/**
 * The vehicle's photo, filling its frame. Shows a neutral placeholder when there is no photo
 * yet, or when the photo cannot be loaded.
 */
export function VehiclePhoto({ uri, className, children, ...props }: VehiclePhotoProps) {
  const savedUri = useVehiclePhotoStore((state) => state.photoUri);
  const photoUri = uri === undefined ? savedUri : uri;
  const [failedUri, setFailedUri] = useState<string | null>(null);
  const showPlaceholder = !photoUri || failedUri === photoUri;

  return (
    <View className={cn('overflow-hidden rounded-2xl bg-photo', className)} {...props}>
      {showPlaceholder ? (
        <View testID="vehicle-photo-default" className="size-full items-center justify-center">
          <Car size={48} strokeWidth={1.25} color={colors['muted-foreground']} />
        </View>
      ) : (
        <Image
          testID="vehicle-photo-custom"
          source={{ uri: photoUri }}
          resizeMode="cover"
          onError={() => setFailedUri(photoUri)}
          className="size-full"
        />
      )}
      {children}
    </View>
  );
}
