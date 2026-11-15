import { Alert, Linking } from 'react-native';
import { useTranslation } from 'react-i18next';

import { ROADSIDE_HOTLINE } from '@/config/support';

/** Returns a function that dials the support hotline, or says the call isn't possible. */
export function useContactSupport(): () => Promise<void> {
  const { t } = useTranslation();
  return async function contactSupport() {
    try {
      await Linking.openURL(`tel:${ROADSIDE_HOTLINE}`);
    } catch {
      Alert.alert(t('assistance.callUnavailable'));
    }
  };
}
