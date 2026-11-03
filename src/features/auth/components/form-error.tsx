import { View } from 'react-native';

import { toApiError } from '@/lib/api/api-error';
import { Text } from '@/shared/ui/text';

/** Form-level error banner for a failed mutation. */
export function FormError({ error }: { error: unknown }) {
  if (!error) return null;
  return (
    <View
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      className="rounded-md bg-destructive/10 p-3">
      <Text className="text-sm text-destructive">{toApiError(error).message}</Text>
    </View>
  );
}
