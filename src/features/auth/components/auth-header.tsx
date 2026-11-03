import { View } from 'react-native';

import { useTextAlign } from '@/shared/hooks/use-text-align';
import { Text } from '@/shared/ui/text';
import { cn } from '@/shared/utils/cn';

import { BackButton } from './back-button';

/** Back button, title and optional subtitle at the top of every sign-in and registration form. */
export function AuthHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  const textAlign = useTextAlign();
  return (
    <View className="mb-10 gap-3">
      <BackButton />
      <Text variant="title" className={cn('mt-5', textAlign)}>
        {title}
      </Text>
      {subtitle ? <Text className={cn('max-w-80', textAlign)}>{subtitle}</Text> : null}
    </View>
  );
}
