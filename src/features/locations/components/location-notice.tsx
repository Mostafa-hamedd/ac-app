import { useTranslation } from 'react-i18next';
import { Linking, View } from 'react-native';

import { useTextAlign } from '@/shared/hooks/use-text-align';
import { Button } from '@/shared/ui/button';
import { Text } from '@/shared/ui/text';

import type { DeviceLocationStatus } from '../hooks/use-device-location';

type LocationNoticeProps = {
  status: DeviceLocationStatus;
  isApproximate: boolean;
  onRequest: () => void;
  onRetry: () => void;
};

/** Explains why the map can't show the user's position yet, with the right next step. */
export function LocationNotice({ status, isApproximate, onRequest, onRetry }: LocationNoticeProps) {
  const { t } = useTranslation();
  const textAlign = useTextAlign();

  const openSettings = () => void Linking.openSettings();

  let message: string | null = null;
  let action: { label: string; onPress: () => void } | null = null;

  switch (status) {
    case 'loading':
      message = t('location.finding');
      break;
    case 'denied':
      message = t('location.permissionDenied');
      action = { label: t('location.allowLocation'), onPress: onRequest };
      break;
    case 'blocked':
      message = t('location.permissionBlocked');
      action = { label: t('common.openSettings'), onPress: openSettings };
      break;
    case 'services-disabled':
      message = t('location.servicesDisabled');
      action = { label: t('common.openSettings'), onPress: openSettings };
      break;
    case 'error':
      message = t('location.locateError');
      action = { label: t('common.tryAgain'), onPress: onRetry };
      break;
    case 'granted':
      if (isApproximate) {
        message = t('location.approximate');
        action = { label: t('common.openSettings'), onPress: openSettings };
      }
      break;
  }

  if (!message) return null;
  return (
    <View className="gap-3 rounded-lg bg-muted p-3.5">
      <Text variant="muted" className={`text-xs ${textAlign}`}>
        {message}
      </Text>
      {action ? (
        <Button variant="outline" size="sm" onPress={action.onPress} label={action.label} />
      ) : null}
    </View>
  );
}
