import type { LucideIcon } from 'lucide-react-native';
import { View } from 'react-native';

import { Text } from '@/shared/ui/text';
import { colors } from '@/theme';

/** The outlined circle with an icon and a one-line title that opens a payment result screen. */
export function PaymentResultHeader({ icon: Icon, title }: { icon: LucideIcon; title: string }) {
  return (
    <View className="items-center gap-4">
      <View className="size-20 items-center justify-center rounded-full border border-foreground bg-background">
        <Icon size={36} strokeWidth={1.5} color={colors.foreground} />
      </View>
      <Text accessibilityRole="header" className="font-sans-medium text-xs">
        {title}
      </Text>
    </View>
  );
}
