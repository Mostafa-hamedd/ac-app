import { View } from 'react-native';

import { useTextAlign } from '@/shared/hooks/use-text-align';
import { Text } from '@/shared/ui/text';
import { cn } from '@/shared/utils/cn';

import { BackButton } from '@/shared/ui/back-button';

/** Back button, title and optional subtitle at the top of every sign-in and registration form. */
export function AuthHeader({
  title,
  subtitle,
  styleWrapper,
  styleTitle,
  styleSubTitle,
}: {
  title: string;
  subtitle?: string;
  styleWrapper?: string;
  styleTitle?: string;
  styleSubTitle?: string;
}) {
  const textAlign = useTextAlign();
  return (
    <View className={cn('mb-10 gap-3', styleWrapper)}>
      <BackButton />
      <View className="mt-5 gap-1">
        <Text variant="title" className={cn(textAlign, styleTitle)}>
          {title}
        </Text>
        {subtitle ? (
          <Text className={cn('max-w-80', textAlign, styleSubTitle)}>{subtitle}</Text>
        ) : null}
      </View>
    </View>
  );
}
