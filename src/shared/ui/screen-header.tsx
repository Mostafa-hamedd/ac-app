import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { cn } from '@/shared/utils/cn';

import { BackButton } from './back-button';
import { Text } from './text';

type ScreenHeaderProps = {
  title: string;
  /** Shown at the end of the row (e.g. an action button). */
  trailing?: React.ReactNode;
  className?: string;
};

/** Back button and title at the top of a screen that hides the native header. */
export function ScreenHeader({ title, trailing, className }: ScreenHeaderProps) {
  const { i18n } = useTranslation();
  const insets = useSafeAreaInsets();
  const row = i18n.language === 'ar' ? 'flex-row-reverse' : 'flex-row';

  return (
    <View
      className={cn(row, 'items-center gap-3 bg-background px-5 pb-3', className)}
      style={{ paddingTop: insets.top + 12 }}>
      <BackButton />
      <Text variant="h3" className="flex-1" numberOfLines={1}>
        {title}
      </Text>
      {trailing}
    </View>
  );
}
