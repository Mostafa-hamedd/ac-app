import { router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Pressable } from 'react-native';

import { colors } from '@/theme';

/** Round back button used at the top of the sign-in and registration screens. */
export function BackButton() {
  const { t } = useTranslation();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t('fields.goBack')}
      onPress={() => router.back()}
      hitSlop={8}
      className="h-9 w-9 items-center justify-center rounded-full border border-input/20 active:opacity-70">
      <ArrowLeft size={22} strokeWidth={1.4} color={colors.foreground} />
    </Pressable>
  );
}
